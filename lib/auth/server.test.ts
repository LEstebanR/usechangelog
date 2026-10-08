import { beforeEach, describe, expect, mock, test } from "bun:test";

// requireUser with the session simulated: the cookie, Neon's getSession and redirect are mocked.
let hasCookie = false;
let sessionUser: { id: string; email: string } | null = null;

mock.module("next/headers", () => ({ cookies: async () => ({ has: () => hasCookie }) }));
mock.module("next/server", () => ({ connection: async () => {} }));
mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
mock.module("@neondatabase/auth/next/server", () => ({
  createNeonAuth: () => ({ getSession: async () => ({ data: sessionUser ? { user: sessionUser } : null }) }),
}));

process.env.NEON_AUTH_BASE_URL ??= "https://auth.example.test/neondb/auth";
process.env.NEON_AUTH_COOKIE_SECRET ??= "x".repeat(32);
const { requireUser } = await import("./server");

describe("requireUser", () => {
  beforeEach(() => {
    hasCookie = false;
    sessionUser = null;
  });

  test("with a session, returns the user", async () => {
    hasCookie = true;
    sessionUser = { id: "u1", email: "owner@example.com" };
    expect(await requireUser()).toEqual(sessionUser);
  });

  test("without a session cookie, redirects to /sign-in", async () => {
    await expect(requireUser()).rejects.toThrow("redirect:/sign-in");
  });

  test("with a cookie Neon doesn't recognize, redirects to /sign-in", async () => {
    hasCookie = true;
    await expect(requireUser()).rejects.toThrow("redirect:/sign-in");
  });
});
