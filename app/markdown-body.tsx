import { renderMarkdown } from "@/lib/markdown";
import { markdownClass } from "./markdown-styles";

// A post body, rendered from Markdown. `renderMarkdown` escapes raw HTML and drops
// unsafe links, so the output is safe to inject.
export function MarkdownBody({ body, className = "" }: { body: string; className?: string }) {
  return <div className={`${markdownClass} ${className}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />;
}
