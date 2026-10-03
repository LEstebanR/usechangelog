import type { webhooks } from "@polar-sh/sdk/2026-10";
import { and, eq, isNull, lte, or } from "drizzle-orm";
import { getDb } from "@/db";
import { workspaces } from "@/db/schema";
import { UUID } from "@/lib/posts/server";
import { mapPolarStatus } from "./status";

type Subscription = webhooks.WebhookSubscriptionUpdatedPayload["data"];

// Stores the state a subscription event carries. Idempotent and in order: one UPDATE that
// only applies when the event is as new as, or newer than, the last one stored, so retries
// and late deliveries never overwrite a newer state.
// A workspace that doesn't exist (deleted, or another app's customer) is logged and skipped:
// throwing would make Polar retry for days.
export async function applySubscription(subscription: Subscription) {
  const workspaceId = subscription.customer.external_id;
  const at = new Date(subscription.modified_at ?? subscription.created_at);

  const applied =
    workspaceId && UUID.test(workspaceId)
      ? await getDb()
          .update(workspaces)
          .set({
            polarCustomerId: subscription.customer_id,
            polarSubscriptionId: subscription.id,
            subscriptionStatus: mapPolarStatus(subscription.status),
            currentPeriodEnd: new Date(subscription.current_period_end),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            subscriptionUpdatedAt: at,
          })
          .where(
            and(
              eq(workspaces.id, workspaceId),
              or(isNull(workspaces.subscriptionUpdatedAt), lte(workspaces.subscriptionUpdatedAt, at)),
            ),
          )
          .returning({ id: workspaces.id })
      : [];

  if (!applied.length) {
    console.warn(
      `Polar subscription ${subscription.id} (${subscription.status}) skipped: no workspace ${workspaceId ?? "(no external_id)"}, or a newer event is already stored.`,
    );
  }
}
