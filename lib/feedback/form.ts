// Feedback from signed-in users to us (#28). Pure: no server imports, so it's tested.
import { oneOf } from "@/lib/posts/form";

export const FEEDBACK_KINDS = ["bug", "idea", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export const FEEDBACK_LABELS: Record<FeedbackKind, string> = { bug: "Bug", idea: "Idea", other: "Other" };

// Staff mark each message from /app/admin (#75). One set of states, named after the kind.
export const FEEDBACK_STATUSES = ["open", "done", "dismissed"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
// The status filter spans every kind, so it uses the generic names.
export const STATUS_FILTER_LABELS: Record<FeedbackStatus, string> = { open: "Open", done: "Done", dismissed: "Dismissed" };
export const STATUS_LABELS: Record<FeedbackKind, Record<FeedbackStatus, string>> = {
  bug: { open: "Open", done: "Fixed", dismissed: "Won't fix" },
  idea: { open: "Open", done: "Shipped", dismissed: "Declined" },
  other: { open: "Open", done: "Answered", dismissed: "Archived" },
};
// The buttons that move a message to each status.
export const STATUS_ACTIONS: Record<FeedbackKind, Record<FeedbackStatus, string>> = {
  bug: { open: "Reopen", done: "Mark fixed", dismissed: "Won't fix" },
  idea: { open: "Reopen", done: "Mark shipped", dismissed: "Decline" },
  other: { open: "Reopen", done: "Mark answered", dismissed: "Archive" },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The admin's status form: which message and its new status. Null when either is invalid.
export function parseStatusChange(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = FEEDBACK_STATUSES.find((s) => s === formData.get("status"));
  return UUID.test(id) && status ? { id, status } : null;
}

// The admin list's filters from its URL: no status is open, "all" every status; an unknown
// kind is every kind.
export function parseAdminFilters(params: { kind?: string | string[]; status?: string | string[] }) {
  const kind = FEEDBACK_KINDS.find((k) => k === params.kind);
  const status = params.status === "all" ? undefined : (FEEDBACK_STATUSES.find((s) => s === params.status) ?? "open");
  return { kind, status };
}

// The admin list's URL for a kind and status; open is the default, so it's left out.
export function adminHref(kind: FeedbackKind | undefined, status: FeedbackStatus | undefined) {
  const q = new URLSearchParams();
  if (kind) q.set("kind", kind);
  if (status !== "open") q.set("status", status ?? "all");
  const s = q.toString();
  return s ? `/app/admin?${s}` : "/app/admin";
}

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
  // Browsers send line breaks as \r\n; count them as one, like the textarea does.
  const message = String(formData.get("message") ?? "").replace(/\r\n?/g, "\n").trim();
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
