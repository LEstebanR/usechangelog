import { describe, expect, test } from "bun:test";
import { signInErrorMessage } from "./sign-in-errors";

describe("signInErrorMessage", () => {
  test("expired and invalid links have their own message", () => {
    expect(signInErrorMessage("EXPIRED_TOKEN")).toContain("expired");
    expect(signInErrorMessage("INVALID_TOKEN")).toContain("already used");
  });

  test("an unknown code gets the generic message", () => {
    expect(signInErrorMessage("SOMETHING_ELSE")).toBe("Something went wrong with that link. Enter your email to get a new one.");
  });

  test("no code, no message", () => {
    expect(signInErrorMessage(undefined)).toBeUndefined();
    expect(signInErrorMessage(["EXPIRED_TOKEN"])).toBeUndefined();
  });
});
