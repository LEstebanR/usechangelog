import type { SubscriptionStatus } from "@/lib/billing/status";
import { formatDay, toDay } from "@/lib/posts/form";

const day = (date: Date) => formatDay(toDay(date));

// Date and time in UTC, for both admin pages.
export const dateTime = (date: Date) =>
  date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

// An account's subscription for the admin users view (#57, #65), as the webhook stored it. A
// trial is `active` with trial_ends_at; a cancellation is `active` until the period ends.
export function subscriptionLabel(w: {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}) {
  if (w.subscriptionStatus !== "active") return w.subscriptionStatus;
  // A trial can be canceled too, so both parts can show.
  const parts = ["active"];
  if (w.trialEndsAt) parts.push(`trial until ${day(w.trialEndsAt)}`);
  if (w.cancelAtPeriodEnd && w.currentPeriodEnd) parts.push(`cancels ${day(w.currentPeriodEnd)}`);
  return parts.join(" · ");
}

export const postsLabel = (total: number, published: number) =>
  `${total} ${total === 1 ? "post" : "posts"} · ${published} published`;
