import { describe, expect, test } from "bun:test";
import { ogImage, pageMetadata, signInMetadata } from "./metadata";

describe("pageMetadata", () => {
  const meta = pageMetadata({ title: "Acme Changelog", description: "What's new.", path: "/acme" });

  test("points Open Graph and Twitter at the shared image", () => {
    expect(meta.openGraph.images).toEqual([ogImage]);
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", images: [ogImage.url] });
    expect(ogImage.url).toBe("/opengraph-image.png");
    expect(ogImage.width).toBe(1200);
    expect(ogImage.height).toBe(630);
    expect(String(meta.metadataBase)).toMatch(/^http/);
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
