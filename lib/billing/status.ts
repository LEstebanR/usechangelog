// An account's subscription, as the Polar webhook (#15) stores it, and what publishes.
// Pure: no SDK, no database.

import { PLANS, planOf, projectLimit, type WithStatus } from "./plans";

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

// When a subscription's free trial ends, while it's in one; null otherwise. Polar can keep
// trial_end after the trial converts, so the status decides.
export const trialEnd = (subscription: { status: string; trial_end: string | Date | null }) =>
  subscription.status === "trialing" && subscription.trial_end ? new Date(subscription.trial_end) : null;

// A project as the publishing rule sees it: its account's status and its place among the
// account's projects by age (1 is the oldest).
type Ranked = WithStatus & { rank: number };

// The one rule for what goes public: publishing, the public page and the widget (#16, #65).
// The account's N oldest projects publish, where N is its plan's limit: Free publishes one,
// Pro up to three. The sitemap query applies the same rule in SQL, and a test keeps them aligned.
export const canPublish = (workspace: Ranked) => workspace.rank <= projectLimit(workspace);

// What search engines may index (#19): a changelog that can publish and has a published post.
export const isIndexable = (workspace: Ranked, publishedPosts: number) =>
  canPublish(workspace) && publishedPosts > 0;

// A live subscription, paid or failing: it's managed in the portal, never checked out again.
export const hasSubscription = (account: WithStatus) =>
  account.subscriptionStatus === "active" || account.subscriptionStatus === "past_due";

// What to do about a project that doesn't publish (#16, #65): a failed payment is fixed in
// Polar's portal (#17); on Free, by moving to Pro; on Pro past its limit, by deleting a project.
// The banner and the publish refusal both use it.
export const billingFix = (status: SubscriptionStatus) =>
  status === "past_due"
    ? { problem: "Your last payment failed", href: "/api/polar/portal", cta: "Update your card" }
    : planOf({ subscriptionStatus: status }) === "pro"
      ? { problem: `Pro publishes your ${PLANS.pro.projects} oldest projects`, href: "/app/settings", cta: "Delete a project" }
      : { problem: "The Free plan only publishes your oldest project", href: "/app/billing", cta: "Upgrade to Pro" };
