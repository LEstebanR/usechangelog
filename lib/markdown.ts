import markdownIt from "markdown-it";

// Post bodies are written by workspace owners and read by anyone, so the output must be safe.
// Only paragraphs, line breaks, lists, links, bold, italic and inline code. Raw HTML is
// escaped (`html: false`) and links are kept only for http, https and mailto.
// Shared by the public page (#7) and the widget (#8).

const SAFE_LINK = /^(https?:|mailto:)/i;

const md = markdownIt("zero", { html: false, breaks: true }).enable([
  "list",
  "newline",
  "link",
  "emphasis",
  "backticks",
  "escape",
  "entity",
]);
md.validateLink = (url) => SAFE_LINK.test(url.trim());
md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
  tokens[idx].attrSet("target", "_blank");
  tokens[idx].attrSet("rel", "noopener nofollow ugc");
  return self.renderToken(tokens, idx, options);
};

export function renderMarkdown(body: string) {
  return md.render(body);
}
