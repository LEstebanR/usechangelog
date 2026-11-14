"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/server";
import { getCurrentWorkspace } from "@/lib/workspace/server";
import { adminHref, type FeedbackState, parseAdminFilters, parseFeedback, parseStatusChange, RATE_LIMITED } from "./form";
import { insertFeedback, setFeedbackStatus } from "./server";

// Who sends it comes from the session, never the form (#28). Admins read it at /app/admin.
export async function sendFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const user = await requireUser();
  const { values, page, error } = parseFeedback(formData);
  if (error) return { values, error };

  const workspace = await getCurrentWorkspace();
  const saved = await insertFeedback(user.id, workspace?.id ?? null, { ...values, page });
  if (!saved) return { values, error: RATE_LIMITED };

  return { ok: true, values };
}

// Staff mark a message from /app/admin (#75). The same check as the page: anyone else gets a
// 404 and nothing changes. Back to the view it was sent from (its kind and status filters).
export async function setStatus(formData: FormData) {
  await requireAdmin();
  const change = parseStatusChange(formData);
  if (!change) notFound();
  await setFeedbackStatus(change.id, change.status);
  revalidatePath("/app/admin");
  const { kind, status } = parseAdminFilters({
    kind: String(formData.get("kind") ?? ""),
    status: String(formData.get("view") ?? ""),
  });
  redirect(adminHref(kind, status));
}
