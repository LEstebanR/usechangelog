import Link from "next/link";
import { formatDay } from "@/lib/posts/form";
import { listPosts } from "@/lib/posts/server";
import { publicUrl } from "@/lib/site";
import { requireWorkspace } from "@/lib/workspace/server";
import { primaryButtonClass } from "../form-styles";
import { PostTags } from "./post-tags";

export default async function AppPage() {
  const workspace = await requireWorkspace();
  const [posts, url] = await Promise.all([listPosts(), publicUrl(workspace.slug)]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">{workspace.name}</h1>
          <p className="mt-2 text-sm text-graphite">
            <a href={url} className="text-blue underline underline-offset-4">
              {url}
            </a>
            {" · "}
            <Link href="/app/settings" className="hover:text-ink">
              Settings
            </Link>
          </p>
        </div>
        {posts.length > 0 && (
          <Link href="/app/posts/new" className={primaryButtonClass}>
            New post
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 border border-dashed border-hairline bg-canvas px-8 py-16 text-center">
          <h2 className="font-display text-2xl font-medium tracking-tight">Write your first post</h2>
          <p className="mx-auto mt-2 max-w-sm text-graphite">
            Tell your users what shipped, or what&apos;s coming next.
          </p>
          <Link href="/app/posts/new" className={`mt-6 inline-block ${primaryButtonClass}`}>
            Write your first post
          </Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-hairline border border-hairline bg-canvas">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/app/posts/${post.id}`}
                className={`flex flex-col gap-2 px-5 py-4 hover:bg-wash sm:flex-row sm:items-center sm:gap-4 ${
                  post.type === "coming" ? "border-l-2 border-dashed border-l-graphite" : ""
                }`}
              >
                <PostTags category={post.category} type={post.type} />
                <span className="flex-1 font-medium">{post.title}</span>
                <span className="flex items-center gap-3 text-sm text-graphite">
                  {post.status === "draft" ? (
                    <span className="border border-hairline px-1.5 py-0.5 text-xs uppercase tracking-wider">Draft</span>
                  ) : null}
                  <span className="tabular-nums">
                    {post.publishedAt ? formatDay(post.publishedAt) : `Edited ${formatDay(post.updatedAt)}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
