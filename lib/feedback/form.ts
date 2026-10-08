// Feedback from signed-in users to us (#28). Pure: no server imports, so it's tested.
import { oneOf } from "@/lib/posts/form";

export const FEEDBACK_KINDS = ["bug", "idea", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export const FEEDBACK_LABELS: Record<FeedbackKind, string> = { bug: "Bug", idea: "Idea", other: "Other" };

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2000;
// Messages per user per hour; the sixth is refused.
export const FEEDBACK_PER_HOUR = 5;
export const RATE_LIMITED = "You've sent a lot of feedback recently. Try again in a bit.";

export type FeedbackState = { ok?: true; error?: string; values: { kind: FeedbackKind; message: string } };

// The form's fields. `page` is the app route it was sent from; anything outside /app is
// dropped, so only our own paths get stored.
export function parseFeedback(formData: FormData) {
  const kind = oneOf(FEEDBACK_KINDS, formData.get("kind"), "other");
  const message = String(formData.get("message") ?? "").trim();
  const rawPage = String(formData.get("page") ?? "");
  const page = /^\/app(\/[\w\-/]*)?$/.test(rawPage) ? rawPage.slice(0, 200) : "/app";
  const error =
    message.length < MESSAGE_MIN
      ? `Write at least ${MESSAGE_MIN} characters.`
      : message.length > MESSAGE_MAX
        ? `Keep it under ${MESSAGE_MAX.toLocaleString("en-US")} characters.`
        : undefined;
  return { values: { kind, message }, page, error };
}

// The Slack message: who, from where, what (#28).
export function slackText(f: { kind: FeedbackKind; message: string; page: string; email: string; workspace: string | null }) {
  return `*${FEEDBACK_LABELS[f.kind]}* from ${f.email} (${f.workspace ?? "no workspace yet"}) on \`${f.page}\`\n>${f.message.replace(/\n/g, "\n>")}`;
}
