import { createPolarCore, type Environment, type models } from "@polar-sh/sdk/2026-10";
import { getProducts } from "@polar-sh/sdk/2026-10/services/products";
import { listSubscriptions } from "@polar-sh/sdk/2026-10/services/subscriptions";
import { connection } from "next/server";

// Read on first use, not at import, so `next build` runs without env vars.
// Previews point to Polar's sandbox and production to production (`POLAR_SERVER`).
export function polarConfig() {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  const productId = process.env.POLAR_PRODUCT_ID;
  const server = process.env.POLAR_SERVER;
  if (!accessToken || !productId || (server !== "sandbox" && server !== "production")) {
    throw new Error("POLAR_ACCESS_TOKEN, POLAR_PRODUCT_ID and POLAR_SERVER (sandbox or production) must be set");
  }
  const environment: Environment = server;
  return { accessToken, productId, environment };
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

// Off: no coupons in the MVP. Only while Polar reviews the account, POLAR_ALLOW_DISCOUNT_CODES=true
// lets their team use a 100% code to go through the checkout. Remove it once approved.
export const discountCodesAllowed = () => process.env.POLAR_ALLOW_DISCOUNT_CODES === "true";

export function webhookSecret() {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) throw new Error("POLAR_WEBHOOK_SECRET is not set");
  return secret;
}

// The plan as Polar has it: its price ("$9.99 / month") and free trial ("15-day free trial"),
// each null when there is none or it can't be read. Pages then say only "Monthly plan".
// Neither is ever written in our code.
// For the billing page: per request, never at build.
export async function getPlan() {
  await connection();
  return readPlan();
}

// For the landing, which caches it for an hour (#9). Without Polar's env vars (CI builds,
// a fresh clone) it quietly gives nothing.
export async function readPlan() {
  if (!process.env.POLAR_ACCESS_TOKEN || !process.env.POLAR_PRODUCT_ID) return { price: null, trial: null };
  try {
    const { accessToken, productId, environment } = polarConfig();
    const product = await getProducts(createPolarCore({ accessToken, environment }))(productId);
    const price = product.prices.find((p): p is models.ProductPriceFixed => p.amount_type === "fixed" && !p.is_archived);
    return {
      price: price ? `${formatAmount(price.price_amount, price.price_currency)} / ${product.recurring_interval ?? "month"}` : null,
      trial: product.trial_interval ? `${product.trial_interval_count ?? 1}-${product.trial_interval} free trial` : null,
    };
  } catch (error) {
    console.error("Couldn't read the plan from Polar", error);
    return { price: null, trial: null };
  }
}

const formatAmount = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
