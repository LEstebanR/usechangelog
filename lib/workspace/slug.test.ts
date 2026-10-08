import { describe, expect, test } from "bun:test";
import { slugify, validateSlug } from "./slug";

describe("validateSlug", () => {
  test("accepts lowercase letters, numbers and single hyphens", () => {
    expect(validateSlug("acme")).toEqual({ ok: true, slug: "acme" });
    expect(validateSlug("acme-app-2")).toEqual({ ok: true, slug: "acme-app-2" });
    expect(validateSlug("  Acme  ")).toEqual({ ok: true, slug: "acme" });
  });

  // Each one is a route or file of ours: /{slug} would shadow it.
  test.each(["app", "API", "sign-in", "privacy", "terms", "sitemap.xml", "widget.js", "robots.txt"])(
    "rejects the reserved %s",
    (slug) => {
      expect(validateSlug(slug)).toEqual({ ok: false, error: "That URL is reserved. Try another one." });
    },
  );

  test.each(["a", "ab", "-x", "x-", "a--b", "acme app", "acmé", "a".repeat(41)])("rejects %s", (slug) => {
    expect(validateSlug(slug).ok).toBe(false);
  });

  test("40 characters is the limit", () => {
    expect(validateSlug("a".repeat(40)).ok).toBe(true);
  });
});

describe("slugify", () => {
  test("builds a slug from a workspace name", () => {
    expect(slugify("Acme App!")).toBe("acme-app");
    expect(slugify("Café Niño")).toBe("cafe-nino");
    expect(slugify("---")).toBe("");
  });

  test("never passes 40 characters, nor ends on a hyphen", () => {
    const slug = slugify(`${"a".repeat(39)} b c d`);
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
  });
});
