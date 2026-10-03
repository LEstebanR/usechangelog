import { Webhooks } from "@polar-sh/nextjs";
import type { NextRequest } from "next/server";
import { webhookSecret } from "@/lib/billing/polar";
import { applySubscription } from "@/lib/billing/webhook";

// Polar's webhook (#15), the only writer of the subscription state. The helper checks the
// signature first: a missing or invalid one gets 403 and never reaches the handlers.
// subscription.updated comes with every change (cancel, revoke, past due…); created too.
export async function POST(request: NextRequest) {
  return Webhooks({
    webhookSecret: webhookSecret(),
    onSubscriptionCreated: ({ data }) => applySubscription(data),
    onSubscriptionUpdated: ({ data }) => applySubscription(data),
  })(request);
}
