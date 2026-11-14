import type { SubscriptionStatus } from "@/lib/billing/status";

const day = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

// A workspace's subscription for the admin users view (#57), as the webhook stored it. A
// trial is `active` with trial_ends_at; a cancellation is `active` until the period ends.
export function subscriptionLabel(w: {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}) {
  if (w.subscriptionStatus !== "active") return w.subscriptionStatus;
  if (w.trialEndsAt) return `active · trial until ${day(w.trialEndsAt)}`;
  if (w.cancelAtPeriodEnd && w.currentPeriodEnd) return `active · cancels ${day(w.currentPeriodEnd)}`;
  return "active";
}

export const postsLabel = (total: number, published: number) =>
  `${total} ${total === 1 ? "post" : "posts"} · ${published} published`;
