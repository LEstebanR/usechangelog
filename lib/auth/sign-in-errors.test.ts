import { describe, expect, test } from "bun:test";
import { signInErrorMessage } from "./sign-in-errors";

describe("signInErrorMessage", () => {
  test("expired and invalid links have their own message", () => {
    expect(signInErrorMessage("EXPIRED_TOKEN")).toContain("expired");
    expect(signInErrorMessage("INVALID_TOKEN")).toContain("already used");
  });

  test("a cancelled Google sign-in says so", () => {
    expect(signInErrorMessage("access_denied")).toContain("cancelled");
  });

  test("an unknown code, from a link or from Google, gets the generic message", () => {
    expect(signInErrorMessage("SOMETHING_ELSE")).toBe(
      "Something went wrong signing you in. Try again, or use your email to get a new link.",
    );
  });

  test("no code, no message", () => {
    expect(signInErrorMessage(undefined)).toBeUndefined();
    expect(signInErrorMessage(["EXPIRED_TOKEN"])).toBeUndefined();
  });
});
