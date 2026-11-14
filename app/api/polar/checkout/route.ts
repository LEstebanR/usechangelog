import { Checkout } from "@polar-sh/nextjs";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { discountCodesAllowed, hasActiveSubscriptionInPolar, polarConfig } from "@/lib/billing/polar";
import { hasSubscription } from "@/lib/billing/status";
import { getOrigin } from "@/lib/site";
import { ensureAccount, getCurrentAccount, requireWorkspace } from "@/lib/workspace/server";

// Subscribe (#14). The helper reads the checkout from the query string, so we never pass
// it the incoming one: the product (Pro), the account and the email come from the session and
// the env, and an edited URL changes nothing. Discount codes stay off (see discountCodesAllowed).
export async function GET(request: NextRequest) {
  // Only after onboarding: Pro with nothing to publish makes no sense, and /app/billing
  // (where the checkout returns) needs a project too.
  const [user] = await Promise.all([requireUser(), requireWorkspace()]);
  // The subscription is the account's, not a project's (#65). Onboarding created the row;
  // ensureAccount covers a project made before accounts existed.
  const account = (await getCurrentAccount()) ?? (await ensureAccount(user.id));
  // One subscription per account: an active or failing one is managed in the portal,
  // so billing shows its real state. Polar is asked too, for a payment whose webhook
  // hasn't landed yet: that one is still activating.
  if (hasSubscription(account)) redirect("/app/billing");
  if (await hasActiveSubscriptionInPolar(account.id)) redirect("/app/billing?checkout=success");

  const { accessToken, productId, environment } = polarConfig();
  const origin = await getOrigin();
  const url = new URL(request.nextUrl.pathname, origin);
  url.searchParams.set("products", productId);
  // The webhook (#15) finds the account by this id, never by email.
  url.searchParams.set("external_customer_id", account.id);
  url.searchParams.set("customer_email", user.email);
  url.searchParams.set("allow_discount_codes", String(discountCodesAllowed()));

  return Checkout({
    accessToken,
    environment,
    successUrl: `${origin}/app/billing?checkout=success`,
    returnUrl: `${origin}/app/billing`,
    includeCheckoutId: false,
  })(new NextRequest(url));
}
