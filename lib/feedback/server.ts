import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/neon-auth";
import { feedback, workspaces } from "@/db/schema";
import { FEEDBACK_PER_HOUR, type FeedbackKind } from "./form";

// The latest feedback for the admin view (#28), with who sent it and from which workspace.
// `kind` filters; without it, every kind. Returns the query, which runs when awaited.
export function listFeedback({ kind, limit = 200 }: { kind?: FeedbackKind; limit?: number } = {}) {
  return getDb()
    .select({
      id: feedback.id,
      kind: feedback.kind,
      message: feedback.message,
      page: feedback.page,
      createdAt: feedback.createdAt,
      email: user.email,
      workspace: workspaces.slug,
    })
    .from(feedback)
    .innerJoin(user, eq(user.id, feedback.userId))
    .leftJoin(workspaces, eq(workspaces.id, feedback.workspaceId))
    .where(kind ? eq(feedback.kind, kind) : undefined)
    .orderBy(desc(feedback.createdAt))
    .limit(limit);
}

// Saves a message unless the user already sent FEEDBACK_PER_HOUR in the last hour (#28).
// One transaction: a lock per user, then the insert only if the count allows it, so
// parallel requests can't slip past the limit. The workspace is the user's own (one per
// account), looked up in the same insert. Returns false when the limit was hit.
export async function insertFeedback(userId: string, f: { kind: FeedbackKind; message: string; page: string }) {
  const db = getDb();
  const [, inserted] = await db.batch([
    db.execute(sql`select pg_advisory_xact_lock(hashtext(${`feedback:${userId}`}))`),
    db.execute(sql`
      insert into ${feedback} (user_id, workspace_id, kind, message, page)
      select ${userId}, (select ${workspaces.id} from ${workspaces} where ${workspaces.ownerId} = ${userId}),
             ${f.kind}::feedback_kind, ${f.message}, ${f.page}
      where (select count(*) from ${feedback}
             where ${feedback.userId} = ${userId} and ${feedback.createdAt} > now() - interval '1 hour') < ${FEEDBACK_PER_HOUR}
      returning ${feedback.id}`),
  ]);
  return inserted.rows.length > 0;
}
