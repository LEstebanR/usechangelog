import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { readPlan } from "@/lib/billing/polar";
import { PLANS, planOf, projectLimit } from "@/lib/billing/plans";
import { canPublish, hasSubscription, type SubscriptionStatus } from "@/lib/billing/status";
import { formatDay, toDay } from "@/lib/posts/form";
import { getCurrentAccount, listWorkspaces } from "@/lib/workspace/server";
import { primaryButtonClass, secondaryButtonClass } from "../../form-styles";

export const metadata: Metadata = { title: "Billing — UseChangelog" };

// The account's plan (#14, #65), its real state from the webhook (#15), how many projects it
// uses, and the way to Pro or to Polar's portal (#17).
export default async function BillingPage({ searchParams }: PageProps<"/app/billing">) {
  // An account page: it reads the account and all its projects, never the open project.
  const [account, projects, { price, trial }, { checkout }] = await Promise.all([
    getCurrentAccount(),
    listWorkspaces(),
    readPlan(),
    searchParams,
  ]);
  // Billing is for after onboarding, like every tab.
  if (!projects.length) redirect("/app/onboarding");
  // No account row before onboarding created it, or before accounts existed: Free.
  const billing = { subscriptionStatus: account?.subscriptionStatus ?? ("none" as const) };
  const status = billing.subscriptionStatus;
  const plan = PLANS[planOf(billing)];
  const limit = projectLimit(billing);
  const pastDue = status === "past_due";
  const backFromCheckout = checkout === "success";
  // Back from the checkout before the webhook has landed, or a free trial.
  const shown = backFromCheckout && !hasSubscription(billing) ? "activating" : status === "active" && account?.trialEndsAt ? "trial" : status;
  const { dot, title, detail } = STATUS[shown];
  const day = (date: Date | null | undefined) => (date ? formatDay(toDay(date)) : "");
  const dates = { periodEnd: day(account?.currentPeriodEnd), trialEnd: day(account?.trialEndsAt), canceling: Boolean(account?.cancelAtPeriodEnd), price };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      <h1 className="font-display text-3xl font-medium tracking-tight">Billing</h1>

      {/* The account's plan and which of its projects it publishes: the oldest ones (#65). */}
      <section className="border border-hairline bg-canvas p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-medium">Your plan: {plan.name}</h2>
          <p className="text-sm text-graphite tabular-nums">
            Publishes {limit} {limit === 1 ? "project" : "projects"}
          </p>
        </div>
        <ul className="mt-4 divide-y divide-hairline border border-hairline text-sm">
          {projects.map((project) => (
            <li key={project.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="truncate font-medium">{project.name}</span>
              {canPublish(project) ? (
                <span className="shrink-0 text-xs text-green">Public</span>
              ) : (
                <span className="shrink-0 text-xs text-clay">Not public</span>
              )}
            </li>
          ))}
        </ul>
        {projects.length > limit && (
          <p className="mt-3 text-sm text-graphite">
            Your oldest {limit === 1 ? "project is" : `${limit} projects are`} public. The others keep their posts and drafts.
          </p>
        )}
      </section>

      <section className="border border-hairline bg-canvas p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-medium">Pro</h2>
          {price && <p className="font-display text-lg tabular-nums">{price}</p>}
        </div>
        {trial && !hasSubscription(billing) && <p className="mt-1 text-sm font-medium text-green">Starts with a {trial}.</p>}
        <p className="mt-2 text-sm text-graphite">
          Up to {PLANS.pro.projects} projects, each with its own public changelog page and widget. Free publishes{" "}
          {PLANS.free.projects}.
        </p>

        <div role="status" className="mt-6 border border-hairline bg-wash p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <span aria-hidden="true" className={`size-2 ${dot}`} />
            {title}
          </p>
          <p className="mt-1 text-graphite">
            {detail(dates)}
          </p>
        </div>

        {/* GET forms, not links: Next would prefetch a link, and these routes open a checkout
            or a portal session. They take everything from the session, never from the form. */}
        {/* Stacked and full width on a phone, side by side from sm. */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto [&_button]:w-full">
          {!hasSubscription(billing) && !backFromCheckout && (
            <form action="/api/polar/checkout">
              <button type="submit" className={primaryButtonClass}>
                Upgrade to Pro
              </button>
            </form>
          )}
          {backFromCheckout && (
            <Link href="/app" className={primaryButtonClass}>
              Go to your posts
            </Link>
          )}
          {account?.polarCustomerId && (
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

type Dates = { periodEnd: string; trialEnd: string; canceling: boolean; price: string | null };

// What the status box says for each state; active and trial add their dates.
const STATUS: Record<SubscriptionStatus | "activating" | "trial", { dot: string; title: string; detail: (d: Dates) => string }> = {
  activating: { dot: "bg-blue", title: "Subscription received, activating…", detail: () => "This takes a few seconds. Reload the page to see it." },
  active: {
    dot: "bg-green",
    title: "Active",
    detail: (d) => (d.periodEnd ? `${d.canceling ? "Ends" : "Renews"} on ${d.periodEnd}.` : ""),
  },
  trial: {
    dot: "bg-green",
    title: "Free trial",
    detail: (d) =>
      d.canceling
        ? `Ends on ${d.trialEnd}.`
        : `Your trial ends on ${d.trialEnd}. Then Pro starts${d.price ? ` at ${d.price}` : ""}.`,
  },
  past_due: { dot: "bg-clay", title: "Payment failed", detail: () => "Update your card to keep Pro. Until then, only your oldest project is public." },
  canceled: { dot: "border border-graphite", title: "No subscription", detail: () => "You're on Free: your oldest project is public. The others keep their posts." },
  none: { dot: "border border-graphite", title: "No subscription", detail: () => "You're on Free: your oldest project is public." },
};
