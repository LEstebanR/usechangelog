import { describe, expect, test } from "bun:test";
import { canSignIn, signInIsRestricted } from "./early-access";

describe("early access", () => {
  test("previews and local are open", () => {
    expect(signInIsRestricted({ VERCEL_ENV: "preview" })).toBe(false);
    expect(signInIsRestricted({})).toBe(false);
    expect(canSignIn("anyone@example.com", { VERCEL_ENV: "preview" })).toBe(true);
    expect(canSignIn("anyone@example.com", {})).toBe(true);
  });

  test("production signs in only the allowed emails, in any case", () => {
    const env = { VERCEL_ENV: "production", SIGN_IN_ALLOWED_EMAILS: " Owner@Example.com, tester@example.com " };
    expect(signInIsRestricted(env)).toBe(true);
    expect(canSignIn("owner@example.com", env)).toBe(true);
    expect(canSignIn(" TESTER@example.com", env)).toBe(true);
    expect(canSignIn("someone@example.com", env)).toBe(false);
  });

  test("production without the list lets nobody in", () => {
    expect(canSignIn("owner@example.com", { VERCEL_ENV: "production" })).toBe(false);
    expect(canSignIn("", { VERCEL_ENV: "production", SIGN_IN_ALLOWED_EMAILS: "" })).toBe(false);
  });
});
