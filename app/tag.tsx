import type { PostTag } from "./content";

const tagStyles: Record<PostTag, string> = {
  New: "border-blue bg-blue text-canvas",
  Improved: "border-green/40 bg-green-wash text-green",
  Fixed: "border-clay/40 bg-clay-wash text-clay",
  "Coming soon": "border-dashed border-graphite text-graphite",
};

export const tagDots: Record<PostTag, string> = {
  New: "bg-blue",
  Improved: "bg-green",
  Fixed: "bg-clay",
  "Coming soon": "border border-dashed border-graphite",
};

// `label` overrides the text, e.g. to show the tag in another language.
export function Tag({ tag, label }: { tag: PostTag; label?: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap border px-2 py-0.5 font-display text-[0.72rem] font-medium uppercase tracking-wider ${tagStyles[tag]}`}
    >
      {label ?? tag}
    </span>
  );
}
