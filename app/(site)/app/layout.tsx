import type { Metadata } from "next";
import { signOut } from "@/lib/auth/actions";
import { billingFix, canPublish } from "@/lib/billing/status";
import { isAdmin } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/server";
import { renderMarkdown } from "@/lib/markdown";
import { countPublishedPosts, listPublishedPosts } from "@/lib/posts/server";
import { publicUrl } from "@/lib/site";
import { getCurrentWorkspace, listWorkspaces } from "@/lib/workspace/server";
import { EnterSubmits } from "../enter-submits";
import { secondaryButtonClass } from "../form-styles";
import { SubmitButton } from "../submit-button";
import { SiteHeader } from "../wordmark";
import { AppNav } from "./app-nav";
import { ProjectPicker } from "./project-picker";
import { WhatsNewPreview } from "./whats-new-preview";

export const metadata: Metadata = { title: "UseChangelog" };

// Shell for /app. Access checks live in each page (requireUser / requireWorkspace):
// layouts don't re-run on client navigation.
export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();
  // Display only (not an access check): what the workspace's users will see.
  const [projects, workspace, admin] = await Promise.all([listWorkspaces(), getCurrentWorkspace(), isAdmin(user.id)]);
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
          {workspace && <ProjectPicker projects={projects} current={workspace} />}
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
      <AppNav hasWorkspace={Boolean(workspace)} admin={admin} />
      {workspace && (!canPublish(workspace) || workspace.subscriptionStatus === "past_due") && (
        <BillingBanner {...billingFix(workspace.subscriptionStatus)} publishes={canPublish(workspace)} />
      )}
      <main className="mx-auto max-w-6xl px-6 py-16">{children}</main>
    </div>
  );
}

// A project the plan doesn't publish (#16, #65): its page and widget are off until the account
// moves to Pro. A failed payment shows too, also on a project that still publishes as Free.
function BillingBanner({ problem, href, cta, publishes }: ReturnType<typeof billingFix> & { publishes: boolean }) {
  return (
    <div role="status" className="border-b border-clay/40 bg-clay-wash">
      <p className="mx-auto max-w-6xl px-6 py-3 text-sm text-clay">
        {publishes
          ? `${problem}. Until it's fixed, only your oldest project is public.`
          : `${problem}, so this project's page and widget aren't showing anything in public. Its posts are safe.`}{" "}
        <a href={href} className="font-medium underline underline-offset-4">
          {cta}
        </a>
      </p>
    </div>
  );
}
