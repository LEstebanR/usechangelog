import { and, count, desc, eq, inArray, max, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { accounts, posts, workspaces } from "@/db/schema";
import { UUID } from "@/lib/uuid";
import { listWorkspaces, publishesSql, requireWorkspace } from "@/lib/workspace/server";

// The workspace's posts, newest first: by publish date, or by last edit for never-published drafts.
export async function listPosts() {
  const workspace = await requireWorkspace();
  // Everything but the body, which the list never shows.
  return getDb()
    .select({
      id: posts.id,
      title: posts.title,
      category: posts.category,
      type: posts.type,
      status: posts.status,
      publishedOn: posts.publishedOn,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.workspaceId, workspace.id))
    .orderBy(desc(sql`coalesce(${posts.publishedOn}, ${posts.updatedAt}::date)`), desc(posts.updatedAt));
}

// What the public sees: published posts only, "Coming soon" first, then newest first.
// One place for this rule, shared by the header preview, the public page (#7) and the widget (#8).
// `limit` caps the list; without it, every published post. It returns the query, which runs
// when awaited, so the rule can be tested from its SQL without a database (#12).
export function listPublishedPosts(workspaceId: string, { limit }: { limit?: number } = {}) {
  const query = getDb()
    .select({
      id: posts.id,
      title: posts.title,
      body: posts.body,
      category: posts.category,
      type: posts.type,
      publishedOn: posts.publishedOn,
    })
    .from(posts)
    .where(and(eq(posts.workspaceId, workspaceId), eq(posts.status, "published")))
    .orderBy(desc(sql`${posts.type} = 'coming'`), desc(posts.publishedOn), desc(posts.createdAt));
  return limit ? query.limit(limit) : query;
}

// How many posts are public, beyond the 10 the preview lists.
export async function countPublishedPosts(workspaceId: string) {
  const [{ total }] = await getDb()
    .select({ total: count() })
    .from(posts)
    .where(and(eq(posts.workspaceId, workspaceId), eq(posts.status, "published")));
  return total;
}

// Every changelog that is public and has something on it, for the sitemap (#19): the
// project publishes (publishesSql, the same rule as canPublish: among its account's oldest,
// as many as the plan allows) and has at least one published post. `lastPost` is its newest
// publish date. Returns the query, like above.
export function listPublicChangelogs() {
  const db = getDb();
  // Ranked once per project, in a subquery, not once per joined post.
  const publishing = db
    .select({ id: workspaces.id })
    .from(workspaces)
    .leftJoin(accounts, eq(accounts.userId, workspaces.ownerId))
    .where(publishesSql);
  return db
    .select({ slug: workspaces.slug, lastPost: max(posts.publishedOn) })
    .from(workspaces)
    .innerJoin(posts, and(eq(posts.workspaceId, workspaces.id), eq(posts.status, "published")))
    .where(inArray(workspaces.id, publishing))
    .groupBy(workspaces.slug);
}

// A post of any of the signed-in user's projects, not only the open one (#65): another tab
// may have switched projects. Returns the post and its project. Anything else, including
// another user's post or a malformed id, is a 404.
export async function requirePost(id: string) {
  if (!UUID.test(id)) notFound();
  const projects = await listWorkspaces();
  if (!projects.length) notFound();
  const [post] = await getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.id, id), inArray(posts.workspaceId, projects.map((p) => p.id))))
    .limit(1);
  const workspace = post && projects.find((p) => p.id === post.workspaceId);
  if (!post || !workspace) notFound();
  return { post, workspace };
}
