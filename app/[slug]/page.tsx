import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { canPublish } from "@/lib/billing/status";
import { formatDay, LABELS } from "@/lib/posts/form";
import { listPublishedPosts } from "@/lib/posts/server";
import { getWorkspaceBySlug } from "@/lib/workspace/server";
import { PostTags } from "../app/post-tags";
import { brand } from "../content";
import { Grid } from "../grid";
import { MarkdownBody } from "../markdown-body";
import { SectionLabel } from "../section-label";

// Always fresh: publishing shows up on the next reload. Without this, Next would cache
// the page after its first request.
export const dynamic = "force-dynamic";

type Post = Awaited<ReturnType<typeof listPublishedPosts>>[number];

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

// A workspace's public changelog: "Coming soon" first, then what shipped, newest first.
// Unknown slugs get the 404, and so do workspaces without an active subscription (#16):
// nothing unpaid is public. Their posts come back when it's active again.
export default async function PublicChangelog({ params }: PageProps<"/[slug]">) {
  // Slugs are stored lowercase, so /Acme reaches /acme.
  const { slug } = await params;
  if (slug !== slug.toLowerCase()) permanentRedirect(`/${encodeURIComponent(slug.toLowerCase())}`);
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace || !canPublish(workspace)) notFound();
  const posts = await listPublishedPosts(workspace.id);
  const coming = posts.filter((p) => p.type === "coming");
  const shipped = posts.filter((p) => p.type !== "coming");

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <Grid />

      <main className={`${container} flex-1 pb-20 pt-16 md:pb-28 md:pt-24`}>
        <div className="grid gap-y-4 md:grid-cols-12">
          <SectionLabel marker="filled" className="md:col-span-3 md:pt-4">
            Changelog
          </SectionLabel>
          <h1 className="text-balance font-display text-[2.75rem] font-medium leading-[1.02] tracking-[-0.03em] [overflow-wrap:anywhere] sm:text-6xl md:col-span-9">
            {workspace.name}
          </h1>
        </div>

        {posts.length === 0 ? (
          <p className="mt-14 border border-dashed border-hairline bg-canvas px-8 py-16 text-center text-lg text-graphite md:mt-20">
            No updates yet.
          </p>
        ) : (
          <>
            {coming.length > 0 && <PostList label={LABELS.coming} marker="dashed" posts={coming} />}
            {shipped.length > 0 && <PostList label={LABELS.shipped} posts={shipped} />}
          </>
        )}
      </main>

      <footer className="border-t border-hairline bg-canvas">
        <div className={`${container} py-8 text-sm text-graphite`}>
          <Link href="/" className="hover:text-ink">
            Powered by{" "}
            <span translate="no" className="font-display font-medium text-ink">
              {brand}
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

// One block of the page, laid out like the landing's example changelog.
function PostList({ label, marker, posts }: {
  label: string;
  marker?: "dashed";
  posts: Post[];
}) {
  return (
    <section aria-label={label} className="mt-14 md:mt-20">
      <SectionLabel marker={marker}>{label}</SectionLabel>
      <div className="mt-5 divide-y divide-hairline border border-ink bg-canvas">
        {posts.map((post) => (
          <article
            key={post.id}
            className={`grid gap-3 px-5 py-7 md:grid-cols-12 md:gap-0 md:px-8 ${post.type === "coming" ? "bg-wash" : ""}`}
          >
            <div className="flex flex-wrap items-center gap-3 md:contents">
              <div className="font-display text-sm tabular-nums text-graphite md:col-span-2 md:pt-1">
                {post.publishedOn && <time dateTime={post.publishedOn}>{formatDay(post.publishedOn)}</time>}
              </div>
              <div className="md:col-span-3 md:pt-0.5">
                <PostTags category={post.category} type={post.type} />
              </div>
            </div>
            <div className="min-w-0 md:col-span-7">
              <h3 className="font-display text-xl font-medium tracking-tight [overflow-wrap:anywhere] md:text-2xl">
                {post.title}
              </h3>
              {post.body && <MarkdownBody body={post.body} className="mt-2 max-w-2xl text-graphite [overflow-wrap:anywhere]" />}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
