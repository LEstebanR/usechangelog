import type { Category, PostType } from "@/lib/posts/form";
import { Tag } from "../tag";

const categoryTag = { new: "New", improved: "Improved", fixed: "Fixed" } as const;

// The landing's tags: the category, plus a dashed "Coming soon" for what's not shipped yet.
export function PostTags({ category, type }: { category: Category; type: PostType }) {
  return (
    <span className="flex items-center gap-1.5">
      <Tag tag={categoryTag[category]} />
      {type === "coming" && <Tag tag="Coming soon" />}
    </span>
  );
}
