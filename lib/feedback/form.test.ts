import { describe, expect, test } from "bun:test";
import { formData } from "@/lib/test/form-data";
import { parseFeedback } from "./form";

describe("parseFeedback", () => {
  test("a valid message keeps its kind and the app page it came from", () => {
    expect(parseFeedback(formData({ kind: "bug", message: "  The save button flickers.  ", page: "/app/settings" }))).toEqual({
      values: { kind: "bug", message: "The save button flickers." },
      page: "/app/settings",
      error: undefined,
    });
  });

  test("under 10 or over 2,000 characters is an error", () => {
    expect(parseFeedback(formData({ message: "too short" })).error).toBe("Write at least 10 characters.");
    expect(parseFeedback(formData({ message: "a".repeat(2001) })).error).toBe("Keep it under 2,000 characters.");
    expect(parseFeedback(formData({ message: "a".repeat(2000) })).error).toBeUndefined();
    expect(parseFeedback(formData({ message: "a".repeat(10) })).error).toBeUndefined();
  });

  test("an unknown kind is other", () => {
    expect(parseFeedback(formData({ kind: "spam", message: "a".repeat(10) })).values.kind).toBe("other");
  });

  test.each(["https://evil.example/x", "/sign-in", "/appx", "javascript:alert(1)", ""])("the page %s becomes /app", (page) => {
    expect(parseFeedback(formData({ message: "a".repeat(10), page })).page).toBe("/app");
  });

  test("app pages are kept", () => {
    expect(parseFeedback(formData({ message: "a".repeat(10), page: "/app" })).page).toBe("/app");
    expect(parseFeedback(formData({ message: "a".repeat(10), page: "/app/posts/abc-123" })).page).toBe("/app/posts/abc-123");
  });
});
