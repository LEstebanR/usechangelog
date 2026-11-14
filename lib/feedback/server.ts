import { and, count, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/neon-auth";
import { feedback, workspaces } from "@/db/schema";
import { FEEDBACK_PER_HOUR, type FeedbackKind, type FeedbackStatus } from "./form";

// The latest feedback for the admin view (#28), with who sent it and from which workspace.
// `kind` and `status` (#75) filter; without them, every one. Returns the query, which runs
// when awaited.
export function listFeedback({
  kind,
  status,
  limit = 200,
}: { kind?: FeedbackKind; status?: FeedbackStatus; limit?: number } = {}) {
  return getDb()
    .select({
      id: feedback.id,
      kind: feedback.kind,
      message: feedback.message,
      page: feedback.page,
      createdAt: feedback.createdAt,
      status: feedback.status,
      resolvedAt: feedback.resolvedAt,
      email: user.email,
      workspace: workspaces.slug,
    })
    .from(feedback)
    .innerJoin(user, eq(user.id, feedback.userId))
    .leftJoin(workspaces, eq(workspaces.id, feedback.workspaceId))
    .where(and(kind ? eq(feedback.kind, kind) : undefined, status ? eq(feedback.status, status) : undefined))
    .orderBy(desc(feedback.createdAt))
    .limit(limit);
}

// Saves a message unless the user already sent FEEDBACK_PER_HOUR in the last hour (#28).
// One transaction: a lock per user, then the insert only if the count allows it, so
// parallel requests can't slip past the limit. The workspace is the project open in /app
// (#65), or null before onboarding. Returns false when the limit was hit.
export async function insertFeedback(
  userId: string,
  workspaceId: string | null,
  f: { kind: FeedbackKind; message: string; page: string },
) {
  const db = getDb();
  const [, inserted] = await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtext(${`feedback:${userId}`}))`),
    db.execute(sql`
      insert into ${feedback} (user_id, workspace_id, kind, message, page)
      select ${userId}, ${workspaceId}::uuid,
             ${f.kind}::feedback_kind, ${f.message}, ${f.page}
      where (select count(*) from ${feedback}
             where ${feedback.userId} = ${userId} and ${feedback.createdAt} > now() - interval '1 hour') < ${FEEDBACK_PER_HOUR}
      returning ${feedback.id}`),
  ]);
  return inserted.rows.length > 0;
}

// Open messages per kind, for the admin filters (#75). A kind with none is missing.
export function openCounts() {
  return getDb()
    .select({ kind: feedback.kind, open: count() })
    .from(feedback)
    .where(eq(feedback.status, "open"))
    .groupBy(feedback.kind);
}

// Moves a message to a status (#75): resolved_at is when it left open, kept from done to
// dismissed (or a repeated submit), null once reopened.
// Returns the query, which runs when awaited; an unknown id changes nothing.
export function setFeedbackStatus(id: string, status: FeedbackStatus) {
  return getDb()
    .update(feedback)
    .set({ status, resolvedAt: status === "open" ? null : sql`coalesce(${feedback.resolvedAt}, now())` })
    .where(eq(feedback.id, id));
}
