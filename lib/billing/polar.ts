import { createPolarCore, type Environment, type models } from "@polar-sh/sdk/2026-10";
import { getProducts } from "@polar-sh/sdk/2026-10/services/products";
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

export function webhookSecret() {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) throw new Error("POLAR_WEBHOOK_SECRET is not set");
  return secret;
}

// The plan's price as Polar has it, e.g. "$9 / month". Null when it can't be read: the
// billing page then says "Monthly plan". The price is never written in our code.
export async function getPlanPrice() {
  // Per request, never at build: the billing page reads it alongside the session.
  await connection();
  try {
    const { accessToken, productId, environment } = polarConfig();
    const product = await getProducts(createPolarCore({ accessToken, environment }))(productId);
    const price = product.prices.find((p): p is models.ProductPriceFixed => p.amount_type === "fixed" && !p.is_archived);
    if (!price) return null;
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.price_currency.toUpperCase(),
      minimumFractionDigits: price.price_amount % 100 ? 2 : 0,
    }).format(price.price_amount / 100);
    return `${amount} / ${product.recurring_interval ?? "month"}`;
  } catch (error) {
    console.error("Couldn't read the plan price from Polar", error);
    return null;
  }
}
