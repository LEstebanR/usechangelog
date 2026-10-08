"use server";

import { requireUser } from "@/lib/auth/server";
import { type FeedbackState, parseFeedback, RATE_LIMITED } from "./form";
import { insertFeedback } from "./server";

// Who sends it comes from the session, never the form (#28). Admins read it at /app/admin.
export async function sendFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const user = await requireUser();
  const { values, page, error } = parseFeedback(formData);
  if (error) return { values, error };

  const saved = await insertFeedback(user.id, { ...values, page });
  if (!saved) return { values, error: RATE_LIMITED };

  return { ok: true, values };
}
