import { beforeEach, describe, expect, mock, test } from "bun:test";

// signInWithGoogle with Neon's signIn.social and redirect mocked. Needs `bun test --isolate`
// (the `test` script): mocking ./server would otherwise leak into server.test.ts.
let social: { data: { url?: string } | null; error: { status: number; message?: string } | null };
let socialArgs: unknown;

mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
mock.module("@/lib/site", () => ({ getOrigin: async () => "https://www.usechangelog.com" }));
mock.module("./server", () => ({
  getAuth: () => ({
    signIn: {
      social: async (args: unknown) => {
        socialArgs = args;
        return social;
      },
    },
  }),
}));

const { signInWithGoogle } = await import("./actions");

describe("signInWithGoogle", () => {
  beforeEach(() => {
    social = { data: { url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=x" }, error: null };
    socialArgs = undefined;
  });

  test("redirects to Google; new and returning users come back to the same absolute callback", async () => {
    await expect(signInWithGoogle()).rejects.toThrow("redirect:https://accounts.google.com/o/oauth2/v2/auth?client_id=x");
    expect(socialArgs).toEqual({
      provider: "google",
      callbackURL: "https://www.usechangelog.com/auth/callback?via=google",
      newUserCallbackURL: "https://www.usechangelog.com/auth/callback?via=google",
      errorCallbackURL: "https://www.usechangelog.com/sign-in",
    });
  });

  test("when Neon fails, back to /sign-in with GOOGLE_FAILED", async () => {
    social = { data: null, error: { status: 403, message: "Forbidden" } };
    const log = console.error;
    console.error = () => {};
    try {
      await expect(signInWithGoogle()).rejects.toThrow("redirect:/sign-in?error=GOOGLE_FAILED");
    } finally {
      console.error = log;
    }
  });
});
