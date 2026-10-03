// The ways to install the widget that /app/settings shows, one per stack. Pure, so the
// exact text is tested. Every variant loads the same widget.js with the same attributes.
export function widgetSnippets(origin: string, key: string) {
  const src = `${origin}/widget.js`;
  return [
    {
      id: "html",
      label: "HTML",
      where: "Before </body>, on every page.",
      code: `<script src="${src}" data-key="${key}" defer></script>`,
    },
    {
      id: "nextjs",
      label: "Next.js",
      where: "In app/layout.tsx, inside <body>. next/script loads it once, without React warnings.",
      code: `import Script from "next/script";\n\n<Script src="${src}" data-key="${key}" strategy="afterInteractive" />`,
    },
    {
      id: "vite",
      label: "React (Vite)",
      where: "In index.html, before </body>. Not inside a component.",
      code: `<script src="${src}" data-key="${key}" defer></script>`,
    },
  ];
}

// What a site with a Content Security Policy has to allow.
export const cspDirectives = (origin: string) => `script-src ${origin}; connect-src ${origin}`;
