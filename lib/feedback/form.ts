// Feedback from signed-in users to us (#28). Pure: no server imports, so it's tested.
import { oneOf } from "@/lib/posts/form";
import { UUID } from "@/lib/uuid";

export const FEEDBACK_KINDS = ["bug", "idea", "other"] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export const FEEDBACK_LABELS: Record<FeedbackKind, string> = { bug: "Bug", idea: "Idea", other: "Other" };

// Staff mark each message from /app/admin (#75). One set of states, named after the kind.
export const FEEDBACK_STATUSES = ["open", "done", "dismissed"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];
// The status filter spans every kind, so it uses the generic names.
export const STATUS_FILTER_LABELS: Record<FeedbackStatus, string> = { open: "Open", done: "Done", dismissed: "Dismissed" };
// Each status's name for a kind (`label`) and the button that moves a message to it
// (`action`), in one table so a rename changes both.
type StatusName = { label: string; action: string };
const OPEN: StatusName = { label: "Open", action: "Reopen" };
export const STATUS_NAMES: Record<FeedbackKind, Record<FeedbackStatus, StatusName>> = {
  bug: { open: OPEN, done: { label: "Fixed", action: "Mark fixed" }, dismissed: { label: "Won't fix", action: "Won't fix" } },
  idea: { open: OPEN, done: { label: "Shipped", action: "Mark shipped" }, dismissed: { label: "Declined", action: "Decline" } },
  other: { open: OPEN, done: { label: "Answered", action: "Mark answered" }, dismissed: { label: "Archived", action: "Archive" } },
};

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
  const status = params.status === "all" ? undefined : oneOf(FEEDBACK_STATUSES, params.status, "open");
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
