import type { Metadata } from "next";
import { getPlan } from "@/lib/billing/polar";
import { hasSubscription, type SubscriptionStatus } from "@/lib/billing/status";
import { formatDay, toDay } from "@/lib/posts/form";
import { requireWorkspace } from "@/lib/workspace/server";
import { primaryButtonClass, secondaryButtonClass } from "../../form-styles";

export const metadata: Metadata = { title: "Billing — UseChangelog" };

// The plan (#14), its real state from the webhook (#15) and the way to Polar's portal (#17).
export default async function BillingPage({ searchParams }: PageProps<"/app/billing">) {
  // The price doesn't depend on the workspace: read both at once.
  const [workspace, { price, trial }, { checkout }] = await Promise.all([requireWorkspace(), getPlan(), searchParams]);
  const status = workspace.subscriptionStatus;
  const pastDue = status === "past_due";
  const periodEnd = workspace.currentPeriodEnd && formatDay(toDay(workspace.currentPeriodEnd));
  const trialEnd = workspace.trialEndsAt && formatDay(toDay(workspace.trialEndsAt));
  // Back from the checkout before the webhook has landed.
  const shown = checkout === "success" && status !== "active" ? "activating" : status;
  const activeDates = workspace.cancelAtPeriodEnd
    ? periodEnd && `Ends on ${periodEnd}.`
    : trialEnd
      ? `Your trial ends on ${trialEnd}. Then the monthly plan starts${price ? ` at ${price}` : ""}.`
      : periodEnd && `Renews on ${periodEnd}.`;
  const { dot, title, detail } = STATUS[shown === "active" && trialEnd ? "trial" : shown];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      <h1 className="font-display text-3xl font-medium tracking-tight">Billing</h1>

      <section className="border border-hairline bg-canvas p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-medium">Monthly plan</h2>
          {price && <p className="font-display text-lg tabular-nums">{price}</p>}
        </div>
        {trial && !hasSubscription(workspace) && <p className="mt-1 text-sm font-medium text-green">Starts with a {trial}.</p>}
        <p className="mt-2 text-sm text-graphite">
          Publish posts, your public changelog page and the widget on your site.
        </p>

        <div role="status" className="mt-6 border border-hairline bg-wash p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <span aria-hidden="true" className={`size-2 ${dot}`} />
            {title}
          </p>
          <p className="mt-1 text-graphite">
            {shown === "active" ? activeDates : detail}
          </p>
        </div>

        {/* GET forms, not links: Next would prefetch a link, and these routes open a checkout
            or a portal session. They take everything from the session, never from the form. */}
        <div className="mt-6 flex flex-wrap gap-3">
          {!hasSubscription(workspace) && shown !== "activating" && (
            <form action="/api/polar/checkout">
              <button type="submit" className={primaryButtonClass}>
                Subscribe
              </button>
            </form>
          )}
          {workspace.polarCustomerId && (
            <form action="/api/polar/portal">
              <button type="submit" className={pastDue ? primaryButtonClass : secondaryButtonClass}>
                {pastDue ? "Update payment method" : "Manage subscription"}
              </button>
            </form>
          )}
        </div>
        <p className="mt-4 text-xs text-graphite">
          Payments, invoices and taxes are handled by Polar, our merchant of record.
        </p>
      </section>
    </div>
  );
}

// What the status box says for each state. Active and trial add their dates.
const STATUS = {
  activating: { dot: "bg-blue", title: "Subscription received, activating…", detail: "This takes a few seconds. Reload the page to see it." },
  active: { dot: "bg-green", title: "Active", detail: "" },
  trial: { dot: "bg-green", title: "Free trial", detail: "" },
  past_due: { dot: "bg-clay", title: "Payment failed", detail: "Update your card to keep publishing. Until then, nothing shows in public." },
  canceled: { dot: "border border-graphite", title: "No subscription", detail: "Subscribe to publish. Your drafts stay here meanwhile." },
  none: { dot: "border border-graphite", title: "No subscription", detail: "Subscribe to publish. Your drafts stay here meanwhile." },
} satisfies Record<SubscriptionStatus | "activating" | "trial", { dot: string; title: string; detail: string }>;
