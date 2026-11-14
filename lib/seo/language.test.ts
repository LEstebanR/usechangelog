import { describe, expect, test } from "bun:test";
import { WIDGET_LANGS } from "@/lib/widget/copy";
import { changelogLanguage, ogLocale } from "./language";

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

describe("ogLocale", () => {
  test("each language has a language_TERRITORY locale that starts with it", () => {
    for (const lang of WIDGET_LANGS) expect(ogLocale(lang)).toMatch(new RegExp(`^${lang}_[A-Z]{2}$`));
  });
});
