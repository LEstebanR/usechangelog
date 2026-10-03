import { describe, expect, test } from "bun:test";
import { WIDGET_COPY } from "./copy";

// public/widget.js hands its pure helpers to tests when there's no document.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { esc, day, section } = require("../../public/widget.js") as {
  esc: (s: string) => string;
  day: (d: string, locale: string) => string;
  section: (label: string, posts: unknown[], data: { lang: string; copy: (typeof WIDGET_COPY)["en"] }) => string;
};

const post = {
  id: "1",
  title: "Dark <b>mode</b>",
  html: "<p>Now <strong>live</strong></p>\n",
  category: "improved",
  type: "coming",
  publishedOn: "2026-09-30",
};

describe("widget.js", () => {
  test("escapes text it puts in HTML", () => {
    expect(esc(`<img src=x onerror="a('b')">&`)).toBe("&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;");
  });

  test("formats days in the widget's language, in UTC", () => {
    expect(day("2026-09-30", "en")).toBe("Sep 30, 2026");
    expect(day("2026-10-03", "es")).toBe("3 oct 2026");
  });

  test("renders a post with its tags, date, escaped title and trusted body", () => {
    const html = section("Próximamente", [post], { lang: "es", copy: WIDGET_COPY.es });
    expect(html).toContain("<h3>Próximamente</h3>");
    expect(html).toContain("<span class='tag improved'>Mejorado</span>");
    expect(html).toContain("<span class='tag coming'>Próximamente</span>");
    expect(html).toContain("<time datetime='2026-09-30'>30 sept 2026</time>");
    expect(html).toContain("Dark &lt;b&gt;mode&lt;/b&gt;");
    expect(html).toContain("<div class=body><p>Now <strong>live</strong></p>\n</div>");
  });

  test("renders nothing for an empty section, and no coming tag for shipped posts", () => {
    expect(section("Latest", [], { lang: "en", copy: WIDGET_COPY.en })).toBe("");
    const html = section("Latest", [{ ...post, type: "shipped", html: "" }], { lang: "en", copy: WIDGET_COPY.en });
    expect(html).not.toContain("tag coming");
    expect(html).not.toContain("class=body");
  });
});
