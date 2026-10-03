import type { Metadata } from "next";
import Link from "next/link";
import { deletePost, savePost } from "@/lib/posts/actions";
import { dayFromDate } from "@/lib/posts/form";
import { requirePost } from "@/lib/posts/server";
import { DeletePost } from "../delete-post";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Edit post — UseChangelog" };

export default async function EditPostPage({ params }: PageProps<"/app/posts/[id]">) {
  const post = await requirePost((await params).id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app" className="text-sm text-graphite hover:text-ink">← All posts</Link>
      <div className="mt-4 mb-8 flex items-center gap-3">
        <h1 className="font-display text-3xl font-medium tracking-tight">Edit post</h1>
        <span className={`border px-1.5 py-0.5 text-xs uppercase tracking-wider ${
          post.status === "published" ? "border-green/40 bg-green-wash text-green" : "border-hairline text-graphite"
        }`}>
          {post.status === "published" ? "Published" : "Draft"}
        </span>
      </div>
      <div className="border border-hairline bg-canvas p-8">
        <PostForm
          action={savePost.bind(null, post.id)}
          initial={{
            title: post.title,
            body: post.body,
            category: post.category,
            type: post.type,
            publishedOn: dayFromDate(post.publishedAt),
          }}
          status={post.status}
        />
      </div>
      <div className="mt-6 flex justify-end">
        <DeletePost action={deletePost.bind(null, post.id)} />
      </div>
    </div>
  );
}
