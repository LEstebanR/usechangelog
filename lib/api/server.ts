import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { apiKeys, posts } from "@/db/schema";
import type { DraftInput } from "./input";

// How many drafts the API creates per project per hour (#86). Generous for a team merging
// pull requests, low enough to stop a runaway loop from filling the dashboard.
export const API_DRAFTS_PER_HOUR = 60;

// The project of a key, by its hash, marking the key as used. No row: no such key, or
// revoked. Returns the query, which runs when awaited.
export function touchApiKey(hash: string) {
  return getDb()
    .update(apiKeys)
    .set({ lastUsedAt: sql`now()` })
    .where(eq(apiKeys.hash, hash))
    .returning({ workspaceId: apiKeys.workspaceId });
}

// Drafts the API created in the last hour: every one has a source_ref.
const recent = (workspaceId: string) =>
  sql`${posts.workspaceId} = ${workspaceId} and ${posts.sourceRef} is not null and ${posts.createdAt} > now() - interval '1 hour'`;

// The insert: always a draft of type Shipped, only while the project is under the hourly
// limit, and nothing when its pull request already has a post.
export const insertDraftSql = (workspaceId: string, d: DraftInput) => sql`
  insert into ${posts} (workspace_id, title, body, category, type, status, source_ref)
  select ${workspaceId}::uuid, ${d.title}, ${d.body}, ${d.category}::post_category, 'shipped', 'draft', ${d.sourceRef}
  where (select count(*) from ${posts} where ${recent(workspaceId)}) < ${API_DRAFTS_PER_HOUR}
  on conflict (workspace_id, source_ref) do nothing
  returning ${posts.id}`;

// After the insert: the post of that pull request, if any, and the seconds until the oldest
// recent draft leaves the hour, for Retry-After.
export const afterInsertSql = (workspaceId: string, sourceRef: string) => sql`
  select
    (select ${posts.id} from ${posts} where ${posts.workspaceId} = ${workspaceId} and ${posts.sourceRef} = ${sourceRef}) as existing,
    (select ${posts.status} from ${posts} where ${posts.workspaceId} = ${workspaceId} and ${posts.sourceRef} = ${sourceRef}) as existing_status,
    greatest(1, ceil(extract(epoch from (select min(${posts.createdAt}) from ${posts} where ${recent(workspaceId)}) + interval '1 hour' - now())))::int as retry_after`;

export type DraftResult =
  | { kind: "created"; id: string }
  // The post may have been published since: its status is the real one.
  | { kind: "exists"; id: string; status: "draft" | "published" }
  | { kind: "limited"; retryAfter: number };

// Creates the draft in one transaction (#86). A lock per project first, so parallel
// requests can't slip past the limit; the unique index keeps one post per pull request
// even without it.
export async function createDraft(workspaceId: string, draft: DraftInput): Promise<DraftResult> {
  const db = getDb();
  const [, inserted, after] = await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtext(${`api-drafts:${workspaceId}`}))`),
    db.execute(insertDraftSql(workspaceId, draft)),
    db.execute(afterInsertSql(workspaceId, draft.sourceRef)),
  ]);
  const created = inserted.rows[0] as { id: string } | undefined;
  if (created) return { kind: "created", id: created.id };
  const { existing, existing_status, retry_after } = after.rows[0] as {
    existing: string | null;
    existing_status: "draft" | "published" | null;
    retry_after: number | null;
  };
  if (existing) return { kind: "exists", id: existing, status: existing_status ?? "draft" };
  return { kind: "limited", retryAfter: retry_after ?? 3600 };
}

// What settings shows of a project's key: never the key or its hash.
export async function getApiKey(workspaceId: string) {
  const [key] = await getDb()
    .select({ prefix: apiKeys.prefix, createdAt: apiKeys.createdAt, lastUsedAt: apiKeys.lastUsedAt })
    .from(apiKeys)
    .where(eq(apiKeys.workspaceId, workspaceId))
    .limit(1);
  return key ?? null;
}
