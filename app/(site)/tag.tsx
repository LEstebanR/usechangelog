import type { PostTag } from "./content";

// The one category palette: landing, app list, editor chips and the What's new panel.
// New is blue, Improved violet, Fixed green (a fix is good news, never a warning).
// Full class names on purpose: Tailwind only generates classes it can read.
export const TAG_PALETTE: Record<PostTag, { tag: string; dot: string; pill: string; chip: string }> = {
  New: {
    tag: "border-blue bg-blue text-canvas",
    dot: "bg-blue",
    pill: "bg-blue-wash text-blue",
    chip: "peer-checked:border-blue peer-checked:bg-blue peer-checked:text-canvas",
  },
  Improved: {
    tag: "border-violet/40 bg-violet-wash text-violet",
    dot: "bg-violet",
    pill: "bg-violet-wash text-violet",
    chip: "peer-checked:border-violet/40 peer-checked:bg-violet-wash peer-checked:text-violet",
  },
  Fixed: {
    tag: "border-green/40 bg-green-wash text-green",
    dot: "bg-green",
    pill: "bg-green-wash text-green",
    chip: "peer-checked:border-green/40 peer-checked:bg-green-wash peer-checked:text-green",
  },
  "Coming soon": {
    tag: "border-dashed border-graphite text-graphite",
    dot: "border border-dashed border-graphite",
    pill: "border border-dashed border-graphite/60 text-ink",
    chip: "peer-checked:border-dashed peer-checked:border-graphite peer-checked:text-ink",
  },
};

export function Tag({ tag }: { tag: PostTag }) {
  return (
    <span
      className={`inline-block whitespace-nowrap border px-2 py-0.5 font-display text-[0.72rem] font-medium uppercase tracking-wider ${TAG_PALETTE[tag].tag}`}
    >
      {tag}
    </span>
  );
}
