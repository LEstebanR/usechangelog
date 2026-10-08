import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/neon-auth";
import { feedback, workspaces } from "@/db/schema";
import type { FeedbackKind } from "./form";

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
