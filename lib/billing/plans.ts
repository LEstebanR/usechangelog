import type { SubscriptionStatus } from "./status";

// Free and Pro (#65). The plan is the account's, derived from its subscription, never stored.
// The limits live here: changing one is a PR. Pro's price and free trial live in Polar.
// For now the plans differ only in how many projects publish; no quotas on posts or traffic.
export const PLANS = {
  free: { name: "Free", projects: 1 },
  pro: { name: "Pro", projects: 3 },
} as const;

export type Plan = keyof typeof PLANS;

// The statuses that are Pro. A free trial is `active`, so it's Pro too. SQL that needs the
// same rule (the sitemap) uses this list.
export const PRO_STATUSES = ["active"] as const satisfies readonly SubscriptionStatus[];

export type WithStatus = { subscriptionStatus: SubscriptionStatus };

export const planOf = (account: WithStatus): Plan =>
  (PRO_STATUSES as readonly SubscriptionStatus[]).includes(account.subscriptionStatus) ? "pro" : "free";

// How many projects the account can have, and how many of them publish: the oldest ones.
export const projectLimit = (account: WithStatus) => PLANS[planOf(account)].projects;
