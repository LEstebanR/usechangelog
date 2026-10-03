import { describe, expect, test } from "bun:test";
import { cspDirectives, widgetSnippets } from "./snippets";

describe("widgetSnippets", () => {
  const snippets = widgetSnippets("https://usechangelog.com", "abc123");

  test("every variant loads widget.js from the origin with the key", () => {
    expect(snippets.map((s) => s.id)).toEqual(["html", "nextjs", "vite"]);
    for (const s of snippets) {
      expect(s.code).toContain('src="https://usechangelog.com/widget.js"');
      expect(s.code).toContain('data-key="abc123"');
    }
  });

  test("Next.js uses next/script after hydration, not a raw script tag", () => {
    const next = snippets.find((s) => s.id === "nextjs")!;
    expect(next.code).toContain('import Script from "next/script";');
    expect(next.code).toContain('strategy="afterInteractive"');
    expect(next.code).not.toContain("<script");
  });

  test("CSP needs the origin in script-src and connect-src", () => {
    expect(cspDirectives("https://usechangelog.com")).toBe(
      "script-src https://usechangelog.com; connect-src https://usechangelog.com",
    );
  });
});
