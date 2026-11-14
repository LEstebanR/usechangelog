import { describe, expect, test } from "bun:test";
import { formData } from "@/lib/test/form-data";
import {
  adminHref,
  FEEDBACK_KINDS,
  FEEDBACK_STATUSES,
  parseAdminFilters,
  parseFeedback,
  parseStatusChange,
  STATUS_ACTIONS,
  STATUS_LABELS,
} from "./form";

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

  test("line breaks count once, however the browser sends them", () => {
    const message = `${"a".repeat(990)}\r\n${"b".repeat(1009)}`;
    expect(parseFeedback(formData({ message })).error).toBeUndefined();
    expect(parseFeedback(formData({ message })).values.message).not.toContain("\r");
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

describe("STATUS_LABELS", () => {
  test("each kind names done and dismissed its own way", () => {
    expect(STATUS_LABELS.bug).toEqual({ open: "Open", done: "Fixed", dismissed: "Won't fix" });
    expect(STATUS_LABELS.idea).toEqual({ open: "Open", done: "Shipped", dismissed: "Declined" });
    expect(STATUS_LABELS.other).toEqual({ open: "Open", done: "Answered", dismissed: "Archived" });
  });

  test("every kind has a label and an action for every status", () => {
    for (const k of FEEDBACK_KINDS)
      for (const s of FEEDBACK_STATUSES) {
        expect(STATUS_LABELS[k][s]).toBeTruthy();
        expect(STATUS_ACTIONS[k][s]).toBeTruthy();
      }
  });
});

describe("parseStatusChange", () => {
  const id = "0b6f1c2e-3d4a-4b5c-8d9e-0f1a2b3c4d5e";

  test("a message id and a known status", () => {
    expect(parseStatusChange(formData({ id, status: "done" }))).toEqual({ id, status: "done" });
  });

  test("an unknown status or a malformed id is null", () => {
    expect(parseStatusChange(formData({ id, status: "planned" }))).toBeNull();
    expect(parseStatusChange(formData({ id: "1; drop table feedback", status: "done" }))).toBeNull();
    expect(parseStatusChange(formData({ status: "done" }))).toBeNull();
  });
});

describe("parseAdminFilters", () => {
  test("open by default; all means every status", () => {
    expect(parseAdminFilters({})).toEqual({ kind: undefined, status: "open" });
    expect(parseAdminFilters({ status: "all" })).toEqual({ kind: undefined, status: undefined });
    expect(parseAdminFilters({ kind: "bug", status: "done" })).toEqual({ kind: "bug", status: "done" });
  });

  test("unknown values fall back to every kind and open", () => {
    expect(parseAdminFilters({ kind: "spam", status: "weird" })).toEqual({ kind: undefined, status: "open" });
  });
});

describe("adminHref", () => {
  test("open is the default, so it's left out of the URL", () => {
    expect(adminHref(undefined, "open")).toBe("/app/admin");
    expect(adminHref("bug", "open")).toBe("/app/admin?kind=bug");
    expect(adminHref("bug", "done")).toBe("/app/admin?kind=bug&status=done");
    expect(adminHref(undefined, undefined)).toBe("/app/admin?status=all");
  });

  test("round-trips through parseAdminFilters", () => {
    for (const kind of [undefined, ...FEEDBACK_KINDS])
      for (const status of [undefined, ...FEEDBACK_STATUSES]) {
        const params = Object.fromEntries(new URL(adminHref(kind, status), "http://x").searchParams);
        expect(parseAdminFilters(params)).toEqual({ kind, status });
      }
  });
});
