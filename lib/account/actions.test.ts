import { beforeEach, describe, expect, mock, test } from "bun:test";

// deleteAccount with the session, Polar, Neon, cookies and redirect mocked (`bun test --isolate`).
let account: { id: string } | null;
let calls: string[];
let polarFails: boolean;
let neonFails: boolean;
let signedOut: boolean;

mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
mock.module("@/lib/auth/server", () => ({
  requireUser: async () => ({ id: "user-1", email: "Ana@example.com" }),
  clearAuthCookies: async () => {
    signedOut = true;
  },
}));
mock.module("@/lib/workspace/server", () => ({ getCurrentAccount: async () => account }));
mock.module("@/lib/billing/polar", () => ({
  revokeSubscriptionsInPolar: async (id: string) => {
    calls.push(`polar:${id}`);
    if (polarFails) throw new Error("polar down");
  },
}));
mock.module("./neon", () => ({
  deleteAuthUser: async (id: string) => {
    calls.push(`neon:${id}`);
    if (neonFails) throw new Error("neon down");
  },
}));

const { deleteAccount } = await import("./actions");
const form = (email: string) => {
  const data = new FormData();
  data.set("email", email);
  return data;
};

describe("deleteAccount", () => {
  beforeEach(() => {
    account = { id: "acct-1" };
    calls = [];
    polarFails = false;
    neonFails = false;
    signedOut = false;
    console.error = () => {};
  });

  test("cancels in Polar, deletes the user, signs out and lands on /?deleted=1", async () => {
    await expect(deleteAccount({}, form(" ana@example.com "))).rejects.toThrow("redirect:/?deleted=1");
    expect(calls).toEqual(["polar:acct-1", "neon:user-1"]);
    expect(signedOut).toBe(true);
  });

  test("a different email is refused, even when the action is called directly", async () => {
    expect(await deleteAccount({}, form("other@example.com"))).toEqual({ error: expect.stringContaining("email") });
    expect(calls).toEqual([]);
  });

  test("when Polar fails, nothing is deleted", async () => {
    polarFails = true;
    expect(await deleteAccount({}, form("ana@example.com"))).toEqual({ error: expect.stringContaining("nothing was deleted") });
    expect(calls).toEqual(["polar:acct-1"]);
    expect(signedOut).toBe(false);
  });

  test("when Neon fails, the user stays signed in and sees the error", async () => {
    neonFails = true;
    expect(await deleteAccount({}, form("ana@example.com"))).toEqual({ error: expect.stringContaining("couldn't delete") });
    expect(signedOut).toBe(false);
  });

  test("without an account row (no checkout ever), there is nothing to cancel: the user is deleted", async () => {
    account = null;
    await expect(deleteAccount({}, form("ana@example.com"))).rejects.toThrow("redirect:/?deleted=1");
    expect(calls).toEqual(["neon:user-1"]);
  });
});
