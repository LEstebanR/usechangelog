import { LABELS, type Category, type PostType } from "@/lib/posts/form";
import { Tag } from "../tag";

// The landing's tags: the category, plus a dashed "Coming soon" for what's not shipped yet.
export function PostTags({ category, type }: { category: Category; type: PostType }) {
  return (
    <span className="flex items-center gap-1.5">
      <Tag tag={LABELS[category]} />
      {type === "coming" && <Tag tag={LABELS.coming} />}
    </span>
  );
}
