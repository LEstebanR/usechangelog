import type { webhooks } from "@polar-sh/sdk/2026-10";
import { and, eq, isNull, lte, or } from "drizzle-orm";
import { getDb } from "@/db";
import { workspaces } from "@/db/schema";
import { UUID } from "@/lib/posts/server";
import { hasSubscription, mapPolarStatus, trialEnd } from "./status";

type Subscription = webhooks.WebhookSubscriptionUpdatedPayload["data"];

// Stores the state a subscription event carries. Idempotent and in order: one UPDATE that
// only applies when the event is as new as, or newer than, the last one stored, so retries
// and late deliveries never overwrite a newer state.
// A workspace that doesn't exist (deleted, or another app's customer) is logged and skipped:
// throwing would make Polar retry for days.
export async function applySubscription(subscription: Subscription) {
  const workspaceId = subscription.customer.external_id;
  const at = new Date(subscription.modified_at ?? subscription.created_at);

  if (!workspaceId || !UUID.test(workspaceId)) {
    console.warn(`Polar subscription ${subscription.id} skipped: its customer has no workspace id.`);
    return;
  }

  const status = mapPolarStatus(subscription.status);
  const isLive = hasSubscription({ subscriptionStatus: status });
  const applied = await getDb()
    .update(workspaces)
    .set({
      polarCustomerId: subscription.customer_id,
      polarSubscriptionId: subscription.id,
      subscriptionStatus: status,
      currentPeriodEnd: new Date(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEndsAt: trialEnd(subscription),
      subscriptionUpdatedAt: at,
    })
    .where(
      and(
        eq(workspaces.id, workspaceId),
        or(isNull(workspaces.subscriptionUpdatedAt), lte(workspaces.subscriptionUpdatedAt, at)),
        // One subscription per workspace. If the customer ever has a second one, a live event
        // (active or past due) takes over, but an ended one never turns off the one we track.
        isLive ? undefined : or(isNull(workspaces.polarSubscriptionId), eq(workspaces.polarSubscriptionId, subscription.id)),
      ),
    )
    .returning({ id: workspaces.id });

  if (!applied.length) {
    console.warn(
      `Polar subscription ${subscription.id} (${subscription.status}) skipped: no workspace ${workspaceId}, a newer event is already stored, or it ended and isn't the workspace's subscription.`,
    );
  }
}
