// Host pages for trying the widget from another origin, like a customer's site.
//   bun run widget-test <widget-key> [base-url] [port]
// Serves on http://localhost:<port> (5050 by default) four pages that load widget.js from
// <base-url> (http://localhost:3000 by default):
//   /            floating button
//   /trigger     lang="es" and data-trigger on the page's own link
//   /aggressive  hostile CSS (* { all: unset }, 40px fonts, transforms)
//   /invalid     an unknown key: nothing shows, one console warning
// For a protected Vercel preview, set VERCEL_AUTOMATION_BYPASS_SECRET (Vercel → Settings →
// Deployment Protection → Protection Bypass for Automation); widget.js passes it on to the API.
const [key, base = "http://localhost:3000", port = "5050"] = process.argv.slice(2);
if (!key) {
  console.error("Usage: bun run widget-test <widget-key> [base-url] [port]");
  process.exit(1);
}

const src = new URL("/widget.js", base);
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (bypass) src.searchParams.set("x-vercel-protection-bypass", bypass);

const tag = (attrs: string, dataKey = key) => `<script src="${src}" data-key="${dataKey}" ${attrs} defer></script>`;
const page = (title: string, body: string) =>
  `<!doctype html><meta charset="utf-8"><title>${title}</title><body style="font-family:Georgia,serif">${body}</body>`;

const pages: Record<string, string> = {
  "/": page("Floating button", `<h1>Floating button</h1><p>A "What's new" button shows bottom right.</p>${tag("")}`),
  "/trigger": page(
    "Trigger, Spanish",
    `<nav style="display:flex;justify-content:space-between;padding:12px;background:#222;color:#fff"><b>MyApp</b>` +
      `<a id="whats-new" href="#" style="color:#fff">Novedades</a></nav>` +
      `<p>No floating button; the link opens the panel in Spanish.</p>${tag('lang="es" data-trigger="#whats-new"')}`,
  ),
  "/aggressive": page(
    "Aggressive CSS",
    `<style>* { all: unset } html { font-size: 40px } body, div, p, button, ol, li, h3 { font-size: 40px !important;` +
      ` color: red !important; font-family: Papyrus, fantasy !important; transform: rotate(1deg) } style, script { display: none }</style>` +
      `<div><h1>Aggressive host</h1><p>This text stays red and huge; the widget keeps its own look.</p></div>${tag("")}`,
  ),
  "/invalid": page("Invalid key", `<h1>Invalid key</h1><p>Nothing shows; one console warning.</p>${tag("", "not-a-real-key")}`),
};

Bun.serve({
  port: Number(port),
  fetch(req) {
    const html = pages[new URL(req.url).pathname];
    return html ? new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }) : new Response("Not found", { status: 404 });
  },
});

console.log(`Widget test pages for ${base} (Ctrl+C to stop):`);
for (const path of Object.keys(pages)) console.log(`  http://localhost:${port}${path}`);
