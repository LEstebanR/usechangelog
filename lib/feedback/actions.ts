"use server";

import { and, count, eq, gt } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/db";
import { feedback } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";
import { getCurrentWorkspace } from "@/lib/workspace/server";
import { FEEDBACK_PER_HOUR, type FeedbackState, parseFeedback, RATE_LIMITED, slackText } from "./form";

// Who sends it comes from the session, never the form (#28). The message is saved first;
// Slack is told after the response and can't make sending fail.
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

  const webhook = process.env.FEEDBACK_SLACK_WEBHOOK_URL;
  if (webhook) {
    const text = slackText({ ...values, page, email: user.email, workspace: workspace?.slug ?? null });
    after(() =>
      fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(3000),
      })
        .then((r) => r.ok || console.error("[feedback] Slack answered", r.status))
        .catch((e) => console.error("[feedback] Slack failed", e)),
    );
  }
  return { ok: true, values: { kind: "other", message: "" } };
}
