import { Checkout } from "@polar-sh/nextjs";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/server";
import { hasActiveSubscriptionInPolar, polarConfig } from "@/lib/billing/polar";
import { hasSubscription } from "@/lib/billing/status";
import { getOrigin } from "@/lib/site";
import { requireWorkspace } from "@/lib/workspace/server";

// Subscribe (#14). The helper reads the checkout from the query string, so we never pass
// it the incoming one: the product, the workspace and the email come from the session and
// the env, and an edited URL changes nothing.
export async function GET(request: NextRequest) {
  const [user, workspace] = await Promise.all([requireUser(), requireWorkspace()]);
  // One subscription per workspace: an active or failing one is managed in the portal,
  // so billing shows its real state. Polar is asked too, for a payment whose webhook
  // hasn't landed yet: that one is still activating.
  if (hasSubscription(workspace)) redirect("/app/billing");
  if (await hasActiveSubscriptionInPolar(workspace.id)) redirect("/app/billing?checkout=success");

  const { accessToken, productId, environment } = polarConfig();
  const origin = await getOrigin();
  const url = new URL(request.nextUrl.pathname, origin);
  url.searchParams.set("products", productId);
  // The webhook (#15) finds the workspace by this id, never by email.
  url.searchParams.set("external_customer_id", workspace.id);
  url.searchParams.set("customer_email", user.email);
  url.searchParams.set("allow_discount_codes", "false");

  return Checkout({
    accessToken,
    environment,
    successUrl: `${origin}/app/billing?checkout=success`,
    returnUrl: `${origin}/app/billing`,
    includeCheckoutId: false,
  })(new NextRequest(url));
}
