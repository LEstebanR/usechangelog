import type { Metadata } from "next";
import Link from "next/link";
import { savePost } from "@/lib/posts/actions";
import { requireWorkspace } from "@/lib/workspace/server";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "New post — UseChangelog" };

export default async function NewPostPage() {
  await requireWorkspace();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app" className="text-sm text-graphite hover:text-ink">← All posts</Link>
      <h1 className="mt-4 mb-8 font-display text-3xl font-medium tracking-tight">New post</h1>
      <div className="border border-hairline bg-canvas p-8">
        <PostForm
          action={savePost.bind(null, null)}
          initial={{ title: "", body: "", category: "new", type: "shipped", publishedOn: "" }}
          status="new"
        />
      </div>
    </div>
  );
}
