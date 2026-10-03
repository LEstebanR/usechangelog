import { describe, expect, test } from "bun:test";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  test("renders lists, links, bold, italic, inline code and line breaks", () => {
    expect(renderMarkdown("- one\n- two")).toBe("<ul>\n<li>one</li>\n<li>two</li>\n</ul>\n");
    expect(renderMarkdown("1. a")).toContain("<ol>");
    expect(renderMarkdown("**b** _i_ `c`\nnext")).toBe("<p><strong>b</strong> <em>i</em> <code>c</code><br>\nnext</p>\n");
  });

  test("opens links in a new tab with a safe rel", () => {
    expect(renderMarkdown("[site](https://example.com)")).toBe(
      '<p><a href="https://example.com" target="_blank" rel="noopener nofollow ugc">site</a></p>\n',
    );
    expect(renderMarkdown("[me](mailto:a@b.co)")).toContain('href="mailto:a@b.co"');
  });

  test.each([
    "<script>alert(1)</script>",
    '<img src=x onerror="alert(1)">',
    "<a href=\"javascript:alert(1)\">x</a>",
  ])("escapes raw HTML: %s", (input) => {
    const html = renderMarkdown(input);
    expect(html).not.toMatch(/<(script|img|a)\b/i);
    expect(html).toContain("&lt;");
  });

  test.each([
    "[x](javascript:alert(1))",
    "[x](JaVaScRiPt:alert(1))",
    "[x](  javascript:alert(1))",
    "[x](&#106;avascript:alert(1))",
    "[x](%6Aavascript:alert(1))",
    "[x](data:text/html,hi)",
    "[x](vbscript:x)",
    "[x](/relative)",
    "[ref]\n\n[ref]: javascript:alert(1)",
  ])("drops links that aren't http, https or mailto: %s", (input) => {
    expect(renderMarkdown(input)).not.toContain("<a ");
  });

  test("leaves out headings, quotes, images and code blocks", () => {
    const html = renderMarkdown("# H\n\n> q\n\n![i](https://e.com/a.png)\n\n```\nc\n```");
    expect(html).not.toMatch(/<(h1|blockquote|img|pre)\b/);
  });
});
