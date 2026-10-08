import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { canPublish, isIndexable } from "@/lib/billing/status";
import { formatDay, LABELS } from "@/lib/posts/form";
import { listPublishedPosts } from "@/lib/posts/server";
import { changelogJsonLd } from "@/lib/seo/json-ld";
import { changelogLanguage } from "@/lib/seo/language";
import { siteUrl } from "@/lib/site";
import { getWorkspaceBySlug } from "@/lib/workspace/server";
import { JsonLd } from "../json-ld";
import { PostTags } from "../(site)/app/post-tags";
import { Grid } from "../(site)/grid";
import { container } from "../(site)/layout-styles";
import { MarkdownBody } from "../(site)/markdown-body";
import { pageMetadata } from "../(site)/metadata";
import { SiteFooter } from "../(site)/site-footer";
import { SectionLabel } from "../(site)/section-label";

// Always fresh: publishing shows up on the next reload. Without this, Next would cache
// the page after its first request.
export const dynamic = "force-dynamic";

type Post = Awaited<ReturnType<typeof listPublishedPosts>>[number];

const changelogDescription = (name: string) => `What's new in ${name}: what shipped, and what's coming.`;


// Each changelog shares as itself: its workspace's name, its own URL and canonical (#19).
// Pages that 404 (unknown or unpaid) get the 404's metadata. A paid changelog with nothing
// published yet isn't indexed until it has a post.
export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const slug = (await params).slug.toLowerCase();
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace || !canPublish(workspace)) return {};
  const indexable = isIndexable(workspace, (await getPublicPosts(workspace.id)).length);
  return {
    ...pageMetadata({
      title: `${workspace.name} Changelog`,
      description: changelogDescription(workspace.name),
      path: `/${slug}`,
    }),
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

// The page and its metadata both need the posts: one query per request.
const getPublicPosts = cache(async (workspaceId: string) => await listPublishedPosts(workspaceId));

// A workspace's public changelog: "Coming soon" first, then what shipped, newest first.
// Unknown slugs get the 404, and so do workspaces without an active subscription (#16):
// nothing unpaid is public. Their posts come back when it's active again.
export default async function PublicChangelog({ params }: PageProps<"/[slug]">) {
  // Slugs are stored lowercase, so /Acme reaches /acme.
  const { slug } = await params;
  if (slug !== slug.toLowerCase()) permanentRedirect(`/${encodeURIComponent(slug.toLowerCase())}`);
  const workspace = await getWorkspaceBySlug(slug);
  if (!workspace || !canPublish(workspace)) notFound();
  const posts = await getPublicPosts(workspace.id);
  const coming = posts.filter((p) => p.type === "coming");
  const shipped = posts.filter((p) => p.type !== "coming");
  const description = changelogDescription(workspace.name);

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      {posts.length > 0 && (
        <JsonLd
          data={changelogJsonLd({
            name: `${workspace.name} Changelog`,
            description,
            url: `${siteUrl()}/${slug}`,
            inLanguage: changelogLanguage(workspace.widgetLang),
            posts,
          })}
        />
      )}
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

      <SiteFooter prefix="Powered by" />
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
