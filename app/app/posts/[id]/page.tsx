import type { Metadata } from "next";
import Link from "next/link";
import { deletePost, savePost } from "@/lib/posts/actions";
import { requirePost } from "@/lib/posts/server";
import { DeletePost } from "../delete-post";
import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "Edit post — UseChangelog" };

export default async function EditPostPage({ params }: PageProps<"/app/posts/[id]">) {
  const post = await requirePost((await params).id);
  const published = post.status === "published";

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3 text-sm text-graphite">
        <Link href="/app" className="hover:text-ink">← All posts</Link>
        <span aria-hidden="true">/</span>
        <h1 className="text-ink">Edit post</h1>
        <span className={`border px-1.5 py-0.5 text-xs uppercase tracking-wider ${
          published ? "border-green/40 bg-green-wash text-green" : "border-hairline text-graphite"
        }`}>
          {published ? "Published" : "Draft"}
        </span>
      </div>
      <PostForm
        action={savePost.bind(null, post.id)}
        initial={{
          title: post.title,
          body: post.body,
          category: post.category,
          type: post.type,
          publishedOn: post.publishedOn ?? "",
        }}
        status={post.status}
      />
      {/* Under the sidebar: its own form, since forms can't nest. */}
      <div className="mt-6 flex justify-end lg:ml-auto lg:w-72">
        <DeletePost action={deletePost.bind(null, post.id)} />
      </div>
    </div>
  );
}
