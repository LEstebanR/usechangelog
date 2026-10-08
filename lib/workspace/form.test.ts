import { describe, expect, test } from "bun:test";
import { parseForm } from "./form";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

describe("parseForm (workspace)", () => {
  test("trims the name and keeps a valid slug in lowercase", () => {
    expect(parseForm(form({ name: "  Acme  ", slug: "Acme-App" }))).toEqual({
      values: { name: "Acme", slug: "acme-app", widgetLang: "en" },
    });
  });

  test("an empty slug is built from the name", () => {
    expect(parseForm(form({ name: "Café Niño", slug: "" })).values.slug).toBe("cafe-nino");
  });

  test("an empty or too long name is an error on name", () => {
    expect(parseForm(form({ name: "  ", slug: "acme" })).errors?.name).toBe("Add a name.");
    expect(parseForm(form({ name: "a".repeat(61), slug: "acme" })).errors?.name).toBe("Keep it under 60 characters.");
    expect(parseForm(form({ name: "a".repeat(60), slug: "acme" })).errors).toBeUndefined();
  });

  test("a reserved slug is an error on slug, and an unknown language falls back to English", () => {
    const state = parseForm(form({ name: "Acme", slug: "app", widgetLang: "xx" }));
    expect(state.errors?.slug).toBe("That URL is reserved. Try another one.");
    expect(state.values.widgetLang).toBe("en");
  });
});
