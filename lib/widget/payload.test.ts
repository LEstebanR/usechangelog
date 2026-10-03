import { describe, expect, test } from "bun:test";
import { WIDGET_COPY } from "./copy";
import { widgetPayload } from "./payload";

const workspace = { name: "Acme", slug: "acme", widgetLang: "en" as const };
const post = {
  id: "1",
  title: "Dark mode",
  body: "Now **live**. <script>alert(1)</script>",
  category: "new" as const,
  type: "shipped" as const,
  publishedOn: "2026-09-30",
};

describe("widgetPayload", () => {
  test("links to the public page and renders bodies safely", () => {
    const payload = widgetPayload({ workspace, posts: [post], origin: "https://usechangelog.com", lang: null });
    expect(payload.enabled).toBe(true);
    expect(payload.url).toBe("https://usechangelog.com/acme");
    expect(payload.name).toBe("Acme");
    expect(payload.posts[0].html).toBe("<p>Now <strong>live</strong>. &lt;script&gt;alert(1)&lt;/script&gt;</p>\n");
    expect(payload.posts[0]).not.toHaveProperty("body");
  });

  test("uses the workspace's language without an override", () => {
    const payload = widgetPayload({ workspace: { ...workspace, widgetLang: "de" }, posts: [], origin: "", lang: null });
    expect(payload.lang).toBe("de");
    expect(payload.copy).toEqual(WIDGET_COPY.de);
  });

  test("lets the embed's lang win, and ignores unknown ones", () => {
    expect(widgetPayload({ workspace, posts: [], origin: "", lang: "es" }).copy.title).toBe("Novedades");
    expect(widgetPayload({ workspace, posts: [], origin: "", lang: "xx" }).lang).toBe("en");
  });
});
