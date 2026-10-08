import { describe, expect, test } from "bun:test";
import { NOTICES, noticeText } from "./notice";

describe("noticeText", () => {
  test.each(["published", "drafted", "deleted", "settings"] as const)("%s has its text", (key) => {
    expect(noticeText(key)).toBe(NOTICES[key]);
  });

  // ?done= comes from the URL: nothing outside the list may reach the page.
  test.each(["__proto__", "constructor", "toString", "hasOwnProperty", "", "nope"])("%s gives nothing", (key) => {
    expect(noticeText(key)).toBeUndefined();
  });

  test("anything that isn't a string gives nothing", () => {
    expect(noticeText(undefined)).toBeUndefined();
    expect(noticeText(["published"])).toBeUndefined();
  });
});
