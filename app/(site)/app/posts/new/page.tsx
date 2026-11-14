import type { Metadata } from "next";
import Link from "next/link";
import { savePost } from "@/lib/posts/actions";
import { requireWorkspace } from "@/lib/workspace/server";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "New post — UseChangelog" };

export default async function NewPostPage() {
  // Bound to the project open now, so a switch in another tab doesn't move the post (#65).
  const workspace = await requireWorkspace();
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3 text-sm text-graphite">
        <Link href="/app" className="hover:text-ink">← All posts</Link>
        <span aria-hidden="true">/</span>
        <span>{workspace.name}</span>
        <span aria-hidden="true">/</span>
        <h1 className="text-ink">New post</h1>
      </div>
      <PostForm
        action={savePost.bind(null, { workspaceId: workspace.id })}
        initial={{ title: "", body: "", category: "new", type: "shipped", publishedOn: "" }}
        status="new"
      />
    </div>
  );
}
