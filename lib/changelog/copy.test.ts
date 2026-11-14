import { describe, expect, test } from "bun:test";
import { formatDay } from "@/lib/posts/form";
import { WIDGET_LANGS } from "@/lib/widget/copy";
import { PAGE_COPY } from "./copy";

describe("public page copy", () => {
  test("every widget language has the page's words", () => {
    for (const lang of WIDGET_LANGS) {
      const copy = PAGE_COPY[lang];
      expect(copy.label && copy.shipped && copy.coming && copy.empty && copy.poweredBy).toBeTruthy();
      expect(copy.title("Acme")).toContain("Acme");
    }
  });

  test("a Spanish changelog shows Spanish tags and dates", () => {
    expect(PAGE_COPY.es.tags).toEqual({ new: "Nuevo", improved: "Mejorado", fixed: "Corregido", coming: "Próximamente" });
    expect(formatDay("2026-11-14", "es")).toBe("14 nov 2026");
  });

  test("English keeps the page's current words", () => {
    expect(PAGE_COPY.en.title("Acme")).toBe("Acme Changelog");
    expect(PAGE_COPY.en.empty).toBe("No updates yet.");
    expect(formatDay("2026-11-14", "en")).toBe("Nov 14, 2026");
  });
});
