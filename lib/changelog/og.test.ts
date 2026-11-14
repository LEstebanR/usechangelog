import { describe, expect, test } from "bun:test";
import { clip, OG_POSTS, ogCard } from "./og";

const post = (title: string, category: "new" | "improved" | "fixed" = "new", type: "shipped" | "coming" = "shipped") => ({
  title,
  category,
  type,
});

describe("ogCard", () => {
  test("speaks the workspace's language", () => {
    const card = ogCard({ name: "Conexory", lang: "es", posts: [post("Exportar CSV"), post("Búsqueda", "improved")] });
    expect(card.label).toBe("Novedades");
    expect(card.poweredBy).toBe("Hecho con");
    expect(card.posts).toEqual([
      { tag: "new", label: "Nuevo", title: "Exportar CSV" },
      { tag: "improved", label: "Mejorado", title: "Búsqueda" },
    ]);
  });

  test("English keeps the page's words", () => {
    const card = ogCard({ name: "Acme", lang: "en", posts: [post("Dark mode", "fixed", "coming")] });
    expect(card.label).toBe("Changelog");
    expect(card.posts).toEqual([{ tag: "coming", label: "Coming soon", title: "Dark mode" }]);
  });

  test(`shows at most ${OG_POSTS} posts, and none when there are none`, () => {
    const many = Array.from({ length: 5 }, (_, i) => post(`Post ${i}`));
    expect(ogCard({ name: "Acme", lang: "en", posts: many }).posts).toHaveLength(OG_POSTS);
    expect(ogCard({ name: "Acme", lang: "en", posts: [] }).posts).toEqual([]);
  });

  test("long names and titles are clipped and the name gets smaller", () => {
    const card = ogCard({ name: "A".repeat(80), lang: "en", posts: [post("B".repeat(80))] });
    expect(card.name).toHaveLength(40);
    expect(card.name.endsWith("…")).toBe(true);
    expect(card.posts[0].title).toHaveLength(64);
    expect(card.nameSize).toBeLessThan(ogCard({ name: "Acme", lang: "en", posts: [] }).nameSize);
  });
});

describe("clip", () => {
  test("keeps short text and collapses whitespace", () => {
    expect(clip("  Dark\n mode ", 20)).toBe("Dark mode");
  });
});
