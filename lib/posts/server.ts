import { and, count, desc, eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { requireWorkspace } from "@/lib/workspace/server";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
// `limit` caps the list; without it, every published post.
export async function listPublishedPosts(workspaceId: string, options: { limit?: number } = {}) {
  return publishedPostsQuery(workspaceId, options);
}

// The query behind listPublishedPosts, built but not run, so the rule can be tested
// without a database (#12).
export function publishedPostsQuery(workspaceId: string, { limit }: { limit?: number } = {}) {
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

// A post of the signed-in user's workspace. Anything else, including another
// workspace's id or a malformed one, is a 404.
export async function requirePost(id: string) {
  const workspace = await requireWorkspace();
  if (!UUID.test(id)) notFound();
  const [post] = await getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.id, id), eq(posts.workspaceId, workspace.id)))
    .limit(1);
  if (!post) notFound();
  return post;
}
