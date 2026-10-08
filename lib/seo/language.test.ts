import { describe, expect, test } from "bun:test";
import { WIDGET_LANGS } from "@/lib/widget/copy";
import { changelogLanguage } from "./language";

describe("changelogLanguage", () => {
  test("keeps each language the workspace can choose", () => {
    for (const lang of WIDGET_LANGS) expect(changelogLanguage(lang)).toBe(lang);
  });

  test("English when the workspace has no language", () => {
    expect(changelogLanguage(undefined)).toBe("en");
    expect(changelogLanguage(null)).toBe("en");
    expect(changelogLanguage("")).toBe("en");
    expect(changelogLanguage("xx")).toBe("en");
  });
});
