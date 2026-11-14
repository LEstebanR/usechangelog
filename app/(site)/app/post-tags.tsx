import { LABELS, type Category, type PostType } from "@/lib/posts/form";
import { Tag } from "../tag";

// The landing's tags: the category, plus a dashed "Coming soon" for what's not shipped yet.
// `labels` translates them on the public page; the app stays English.
export function PostTags({ category, type, labels }: {
  category: Category;
  type: PostType;
  labels?: Record<Category | "coming", string>;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Tag tag={LABELS[category]} label={labels?.[category]} />
      {type === "coming" && <Tag tag={LABELS.coming} label={labels?.coming} />}
    </span>
  );
}
