import { describe, expect, test } from "bun:test";
import { changelogJsonLd, jsonLdScript, marketingJsonLd } from "./json-ld";

const marketing = marketingJsonLd({
  name: "UseChangelog",
  description: "A public changelog.",
  url: "https://www.usechangelog.com/",
});

describe("marketingJsonLd", () => {
  test("describes the product, without a price", () => {
    expect(marketing["@type"]).toBe("SoftwareApplication");
    expect(marketing.url).toBe("https://www.usechangelog.com/");
    expect(JSON.stringify(marketing)).not.toMatch(/price|offers/i);
  });
});

describe("changelogJsonLd", () => {
  test("is a blog of the published posts, without inventing a permalink", () => {
    const data = changelogJsonLd({
      name: "Acme Changelog",
      description: "What's new in Acme.",
      url: "https://www.usechangelog.com/acme",
      inLanguage: "es",
      posts: [
        { title: "Listo", body: "Ya está.", publishedOn: "2026-10-08" },
        { title: "Sin cuerpo", body: "  ", publishedOn: null },
      ],
    });
    expect(data["@type"]).toBe("Blog");
    expect(data.inLanguage).toBe("es");
    expect(data.blogPost).toEqual([
      { "@type": "BlogPosting", headline: "Listo", inLanguage: "es", datePublished: "2026-10-08", articleBody: "Ya está." },
      { "@type": "BlogPosting", headline: "Sin cuerpo", inLanguage: "es" },
    ]);
    expect(JSON.stringify(data)).not.toContain("/acme/");
  });
});

describe("jsonLdScript", () => {
  test("escapes < so a body cannot close the script", () => {
    expect(jsonLdScript({ articleBody: "</script><script>alert(1)" })).not.toContain("</script>");
    expect(jsonLdScript({ articleBody: "</script><script>alert(1)" })).toContain("\\u003c/script>");
  });
});
