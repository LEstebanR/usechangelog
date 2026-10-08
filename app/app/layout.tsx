import type { Metadata } from "next";
import { signOut } from "@/lib/auth/actions";
import { billingFix } from "@/lib/billing/status";
import { requireUser } from "@/lib/auth/server";
import { renderMarkdown } from "@/lib/markdown";
import { countPublishedPosts, listPublishedPosts } from "@/lib/posts/server";
import { publicUrl } from "@/lib/site";
import { getCurrentWorkspace } from "@/lib/workspace/server";
import { EnterSubmits } from "../enter-submits";
import { secondaryButtonClass } from "../form-styles";
import { SubmitButton } from "../submit-button";
import { SiteHeader } from "../wordmark";
import { AppNav } from "./app-nav";
import { WhatsNewPreview } from "./whats-new-preview";

export const metadata: Metadata = { title: "UseChangelog" };

// Shell for /app. Access checks live in each page (requireUser / requireWorkspace):
// layouts don't re-run on client navigation.
export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();
  // Display only (not an access check): what the workspace's users will see.
  const workspace = await getCurrentWorkspace();
  const [posts, total, url] = workspace
    ? await Promise.all([
        listPublishedPosts(workspace.id, { limit: 10 }),
        countPublishedPosts(workspace.id),
        publicUrl(workspace.slug),
      ])
    : [[], 0, ""];

  return (
    <div className="min-h-dvh bg-wash">
      <EnterSubmits />
      <SiteHeader home="/app" compact>
        <div className="flex items-center gap-2 sm:gap-3">
          {workspace && (
            <WhatsNewPreview
              slug={workspace.slug}
              name={workspace.name}
              lang={workspace.widgetLang}
              enabled={workspace.widgetEnabled}
              total={total}
              allUpdatesUrl={url}
              posts={posts.map(({ body, ...p }) => ({ ...p, html: renderMarkdown(body), publishedOn: p.publishedOn ?? "" }))}
            />
          )}
          <form action={signOut} className="flex items-center gap-4">
          <span className="hidden text-sm text-graphite sm:inline">{user.email}</span>
          <SubmitButton
            pendingLabel="Signing out…"
            className={`${secondaryButtonClass} py-2 text-sm`}
          >
            Sign out
          </SubmitButton>
          </form>
        </div>
      </SiteHeader>
      <AppNav tabs={Boolean(workspace)} />
      {(workspace?.subscriptionStatus === "past_due" || workspace?.subscriptionStatus === "canceled") && (
        <BillingBanner {...billingFix(workspace.subscriptionStatus)} />
      )}
      <main className="mx-auto max-w-6xl px-6 py-16">{children}</main>
    </div>
  );
}

// A paid workspace that stopped paying (#16): its page and widget are off until it's fixed.
// A workspace that never subscribed (`none`) gets no banner; it learns on its first publish.
function BillingBanner({ problem, href, cta }: ReturnType<typeof billingFix>) {
  return (
    <div role="status" className="border-b border-clay/40 bg-clay-wash">
      <p className="mx-auto max-w-6xl px-6 py-3 text-sm text-clay">
        {problem}, so your changelog page and widget aren&apos;t showing anything in public. Your posts are
        safe.{" "}
        <a href={href} className="font-medium underline underline-offset-4">
          {cta}
        </a>
      </p>
    </div>
  );
}
