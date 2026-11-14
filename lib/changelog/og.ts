import type { Category, PostType } from "@/lib/posts/form";
import type { WidgetLang } from "@/lib/widget/copy";
import { PAGE_COPY } from "./copy";

// What a changelog's share image says (#73), in the workspace's language. Pure, so the
// words and the cut-offs are tested without rendering; app/[slug]/og/route.tsx draws it.
export const OG_POSTS = 3;
const NAME_MAX = 40;
const TITLE_MAX = 52;

type OgPost = { title: string; category: Category; type: PostType };
export type OgTag = Category | "coming";

// Long text ends in "…" instead of running off the card. Satori wraps but can't clamp.
// Counted in code points, so an emoji at the cut isn't split in half.
export const clip = (text: string, max: number) => {
  const chars = Array.from(text.replace(/\s+/g, " ").trim());
  return chars.length > max ? `${chars.slice(0, max - 1).join("").trimEnd()}…` : chars.join("");
};

// The name's size steps down as it gets longer, so it stays on one or two lines.
const nameSize = (name: string) => (name.length <= 14 ? 120 : name.length <= 24 ? 92 : 68);

export function ogCard({ name, lang, posts }: { name: string; lang: WidgetLang; posts: OgPost[] }) {
  const copy = PAGE_COPY[lang];
  const shown = clip(name, NAME_MAX);
  return {
    label: copy.label,
    poweredBy: copy.poweredBy,
    name: shown,
    nameSize: nameSize(shown),
    // "Coming soon" posts show as such; shipped ones by their category.
    posts: posts.slice(0, OG_POSTS).map((post) => {
      const tag: OgTag = post.type === "coming" ? "coming" : post.category;
      return { tag, label: copy.tags[tag], title: clip(post.title, TITLE_MAX) };
    }),
  };
}

// A short hash of what the card shows, for the image URL (?v=): platforms that cache share
// images by URL fetch a new one when the card changes, and not otherwise.
export function ogVersion(card: ReturnType<typeof ogCard>) {
  let hash = 5381;
  for (const char of JSON.stringify(card)) hash = ((hash * 33) ^ char.codePointAt(0)!) >>> 0;
  return hash.toString(36);
}
