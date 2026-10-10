import { createPolarCore, type Environment, type models } from "@polar-sh/sdk/2026-10";
import { getProducts } from "@polar-sh/sdk/2026-10/services/products";
import { listSubscriptions, revokeSubscriptions } from "@polar-sh/sdk/2026-10/services/subscriptions";
import { mapPolarStatus } from "./status";

// Read on first use, not at import, so `next build` runs without env vars.
// Previews point to Polar's sandbox and production to production (`POLAR_SERVER`).
// Null when Polar isn't set up (CI builds, a fresh clone); polarConfig() requires it.
export function readPolarConfig() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const productId = process.env.POLAR_PRODUCT_ID;
  const server = process.env.POLAR_SERVER;
  if (!accessToken || !productId || (server !== "sandbox" && server !== "production")) return null;
  const environment: Environment = server;
  return { accessToken, productId, environment };
}

export function polarConfig() {
  const config = readPolarConfig();
  if (!config) throw new Error("POLAR_ACCESS_TOKEN, POLAR_PRODUCT_ID and POLAR_SERVER (sandbox or production) must be set");
  return config;
}

// Whether Polar already has a live subscription for this workspace. Our row can lag behind
// (the webhook takes a few seconds), so a second checkout asks Polar itself: one paid
// subscription per workspace, never two.
export async function hasActiveSubscriptionInPolar(workspaceId: string) {
  const { accessToken, environment } = polarConfig();
  const { items } = await listSubscriptions(createPolarCore({ accessToken, environment }))({
    external_customer_id: workspaceId,
    active: true,
    limit: 1,
  });
  return items.length > 0;
}

// Ends every subscription of the workspace that still bills or publishes (trialing, active,
// past_due) right away, without a refund. Deleting the account (#31) calls it first: if it
// throws, nothing is deleted. The webhook that follows finds no workspace and skips it.
export async function revokeSubscriptionsInPolar(workspaceId: string) {
  const { accessToken, environment } = polarConfig();
  const polar = createPolarCore({ accessToken, environment });
  const { items } = await listSubscriptions(polar)({ external_customer_id: workspaceId, limit: 100 });
  const live = items.filter((subscription) => mapPolarStatus(subscription.status) !== "canceled");
  await Promise.all(live.map((subscription) => revokeSubscriptions(polar)(subscription.id)));
}

// Off: no coupons in the MVP. Only while Polar reviews the account, POLAR_ALLOW_DISCOUNT_CODES=true
// lets their team use a 100% code to go through the checkout. Remove it once approved.
export const discountCodesAllowed = () => process.env.POLAR_ALLOW_DISCOUNT_CODES === "true";

export function webhookSecret() {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) throw new Error("POLAR_WEBHOOK_SECRET is not set");
  return secret;
}

const NO_PLAN = { price: null, trial: null };

// The plan as Polar has it: its price ("$9.99 / month") and free trial ("15-day free trial"),
// each null when there is none or it can't be read. Pages then say only "Monthly plan".
// Neither is ever written in our code. The landing caches it for an hour (#9); the billing
// page reads it per request. Without Polar set up, it quietly gives nothing.
export async function readPlan() {
  const config = readPolarConfig();
  if (!config) return NO_PLAN;
  try {
    const { accessToken, productId, environment } = config;
    const product = await getProducts(createPolarCore({ accessToken, environment }))(productId);
    const price = product.prices.find((p): p is models.ProductPriceFixed => p.amount_type === "fixed" && !p.is_archived);
    return {
      price: price ? `${formatAmount(price.price_amount, price.price_currency)} / ${product.recurring_interval ?? "month"}` : null,
      trial: product.trial_interval ? `${product.trial_interval_count ?? 1}-${product.trial_interval} free trial` : null,
    };
  } catch (error) {
    console.error("Couldn't read the plan from Polar", error);
    return NO_PLAN;
  }
}

const formatAmount = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
