// A workspace's subscription, as the Polar webhook (#15) stores it. Pure: no SDK, no database.

export const SUBSCRIPTION_STATUSES = ["active", "past_due", "canceled", "none"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// Polar's status, in our four states. A canceled subscription stays `active` until the period
// ends (with cancel_at_period_end), so it keeps publishing until then. Anything not clearly
// active or past due is `canceled`; no subscription is `none`.
export function mapPolarStatus(status: string | null | undefined): SubscriptionStatus {
  if (!status) return "none";
  if (status === "active" || status === "past_due") return status;
  return "canceled";
}

// The one rule for what goes public: publishing, the public page and the widget (#16).
export const canPublish = (workspace: { subscriptionStatus: SubscriptionStatus }) =>
  workspace.subscriptionStatus === "active";
