// A workspace's subscription, as the Polar webhook (#15) stores it. Pure: no SDK, no database.

export const SUBSCRIPTION_STATUSES = ["active", "past_due", "canceled", "none"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// Polar's status, in our four states. A free trial (`trialing`, set on the product in Polar)
// is `active`: it publishes. A canceled subscription stays `active` until the period ends
// (with cancel_at_period_end), so it keeps publishing until then. Anything not clearly
// active or past due is `canceled`; no subscription is `none`.
export function mapPolarStatus(status: string | null | undefined): SubscriptionStatus {
  if (!status) return "none";
  if (status === "trialing") return "active";
  if (status === "active" || status === "past_due") return status;
  return "canceled";
}

type WithStatus = { subscriptionStatus: SubscriptionStatus };

// The one rule for what goes public: publishing, the public page and the widget (#16).
export const canPublish = (workspace: WithStatus) => workspace.subscriptionStatus === "active";

// A live subscription, paid or failing: it's managed in the portal, never checked out again.
export const hasSubscription = (workspace: WithStatus) =>
  workspace.subscriptionStatus === "active" || workspace.subscriptionStatus === "past_due";

// Where a workspace that can't publish goes to fix it: a failed payment is fixed in Polar's
// portal (#17), anything else by subscribing. The banner and the publish refusal both use it.
export const billingFix = (status: SubscriptionStatus) =>
  status === "past_due"
    ? { problem: "Your last payment failed", href: "/api/polar/portal", cta: "Update your card" }
    : { problem: "You don't have an active subscription", href: "/app/billing", cta: "Subscribe" };
