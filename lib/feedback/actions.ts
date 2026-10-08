"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { feedback } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";
import { getCurrentWorkspace } from "@/lib/workspace/server";
import { FEEDBACK_PER_HOUR, type FeedbackState, parseFeedback, RATE_LIMITED } from "./form";

// Who sends it comes from the session, never the form (#28). Admins read it at /app/admin.
export async function sendFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const user = await requireUser();
  const { values, page, error } = parseFeedback(formData);
  if (error) return { values, error };

  const db = getDb();
  const hourAgo = new Date(Date.now() - 3_600_000);
  const [{ sent }] = await db
    .select({ sent: count() })
    .from(feedback)
    .where(and(eq(feedback.userId, user.id), gt(feedback.createdAt, hourAgo)));
  if (sent >= FEEDBACK_PER_HOUR) return { values, error: RATE_LIMITED };

  const workspace = await getCurrentWorkspace();
  await db.insert(feedback).values({ userId: user.id, workspaceId: workspace?.id ?? null, ...values, page });

  return { ok: true, values: { kind: "other", message: "" } };
}
