// `bun run polar:state <slug>`: a workspace's subscription as our database stores it, next to
// what Polar has, so a webhook that didn't land (or landed wrong) is easy to spot. Read only:
// it never writes to the database or to Polar. Uses the env of wherever it runs (.env.local
// locally: the develop branch and Polar sandbox).
import { createPolarCore } from "@polar-sh/sdk/2026-10";
import { getSubscriptions, listSubscriptions } from "@polar-sh/sdk/2026-10/services/subscriptions";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { workspaces } from "@/db/schema";
import { polarConfig } from "@/lib/billing/polar";
import { mapPolarStatus, trialEnd } from "@/lib/billing/status";

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: bun run polar:state <slug>");
  process.exit(1);
}

const [workspace] = await getDb().select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1);
if (!workspace) {
  console.error(`No workspace with slug "${slug}".`);
  process.exit(1);
}

const { accessToken, environment } = polarConfig();
const polar = createPolarCore({ accessToken, environment });
const day = (date: Date | string | null | undefined) => (date ? new Date(date).toISOString() : null);

const ours = {
  status: workspace.subscriptionStatus,
  periodEnd: day(workspace.currentPeriodEnd),
  cancelAtPeriodEnd: workspace.cancelAtPeriodEnd,
  trialEndsAt: day(workspace.trialEndsAt),
  subscription: workspace.polarSubscriptionId,
  updatedAt: day(workspace.subscriptionUpdatedAt),
};
console.log(`Workspace ${slug} (${workspace.id}), Polar ${environment}`);
console.log("Database:", ours);

const { items } = await listSubscriptions(polar)({ external_customer_id: workspace.id, limit: 10 });
console.log(`Polar subscriptions for this workspace: ${items.map((s) => `${s.id} ${s.status}`).join(", ") || "none"}`);
if (!workspace.polarSubscriptionId) process.exit(0);

const s = await getSubscriptions(polar)(workspace.polarSubscriptionId);
const theirs = {
  status: mapPolarStatus(s.status),
  periodEnd: day(s.current_period_end),
  cancelAtPeriodEnd: s.cancel_at_period_end,
  trialEndsAt: day(trialEnd(s)),
  subscription: s.id,
  updatedAt: day(s.modified_at ?? s.created_at),
};
console.log(`Polar (raw status ${s.status}):`, theirs);

const differs = (Object.keys(ours) as (keyof typeof ours)[]).filter((k) => ours[k] !== theirs[k]);
console.log(differs.length ? `Differs: ${differs.join(", ")}. A webhook may not have landed.` : "In sync.");
