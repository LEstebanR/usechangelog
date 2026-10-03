import { renderMarkdown } from "@/lib/markdown";

// A post body, rendered from Markdown. `renderMarkdown` escapes raw HTML and drops
// unsafe links, so the output is safe to inject. Preflight resets lists and links,
// so they get their look back here.
export function MarkdownBody({ body, className = "" }: { body: string; className?: string }) {
  return (
    <div
      className={`space-y-3 leading-relaxed [&_a]:text-blue [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-ink [&_code]:bg-wash [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
    />
  );
}
