import { describe, expect, test } from "bun:test";
import { ogImage, pageMetadata, signInMetadata } from "./metadata";

describe("pageMetadata", () => {
  const meta = pageMetadata({ title: "Acme Changelog", description: "What's new.", path: "/acme" });

  test("points Open Graph and Twitter at the shared image", () => {
    expect(meta.openGraph.images).toEqual([ogImage]);
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", images: [{ url: ogImage.url, alt: ogImage.alt }] });
    expect(ogImage.url).toBe("/opengraph-image.png");
    expect(ogImage.width).toBe(1200);
    expect(ogImage.height).toBe(630);
    expect(String(meta.metadataBase)).toMatch(/^http/);
  });
});

describe("pageMetadata with its own image", () => {
  test("uses it for Open Graph and Twitter, with the locale", () => {
    const image = { url: "/acme/og", width: 1200, height: 630, alt: "Novedades de Acme" };
    const meta = pageMetadata({ title: "Novedades de Acme", description: "…", path: "/acme", locale: "es_ES", image });
    expect(meta.openGraph).toMatchObject({ images: [image], locale: "es_ES" });
    expect(meta.twitter.images).toEqual([{ url: "/acme/og", alt: "Novedades de Acme" }]);
  });
});

describe("signInMetadata", () => {
  test("has its own title and description, and is not indexed", () => {
    expect(signInMetadata.title).toBe("Sign in — UseChangelog");
    expect(signInMetadata.description).not.toMatch(/indie hackers/);
    expect(signInMetadata.robots).toEqual({ index: false, follow: false });
    expect(signInMetadata.openGraph.title).toBe("Sign in — UseChangelog");
  });
});
