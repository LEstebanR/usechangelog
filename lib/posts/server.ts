import { and, desc, eq, sql } from "drizzle-orm";
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
