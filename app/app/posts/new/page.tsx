import type { Metadata } from "next";
import Link from "next/link";
import { savePost } from "@/lib/posts/actions";
import { requireWorkspace } from "@/lib/workspace/server";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "New post — UseChangelog" };

export default async function NewPostPage() {
  await requireWorkspace();
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3 text-sm text-graphite">
        <Link href="/app" className="hover:text-ink">← All posts</Link>
        <span aria-hidden="true">/</span>
        <h1 className="text-ink">New post</h1>
      </div>
      <PostForm
        action={savePost.bind(null, null)}
        initial={{ title: "", body: "", category: "new", type: "shipped", publishedOn: "" }}
        status="new"
      />
    </div>
  );
}
