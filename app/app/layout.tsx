import type { Metadata } from "next";
import { signOut } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/server";
import { listPublishedPosts } from "@/lib/posts/server";
import { publicUrl } from "@/lib/site";
import { getCurrentWorkspace } from "@/lib/workspace/server";
import { EnterSubmits } from "../enter-submits";
import { secondaryButtonClass } from "../form-styles";
import { SubmitButton } from "../submit-button";
import { SiteHeader } from "../wordmark";
import { WhatsNewPreview } from "./whats-new-preview";

export const metadata: Metadata = { title: "UseChangelog" };

// Shell for /app. Access checks live in each page (requireUser / requireWorkspace):
// layouts don't re-run on client navigation.
export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();
  // Display only (not an access check): what the workspace's users will see.
  const workspace = await getCurrentWorkspace();
  const [posts, url] = workspace
    ? await Promise.all([listPublishedPosts(workspace.id, { bodyChars: 300 }), publicUrl(workspace.slug)])
    : [[], ""];

  return (
    <div className="min-h-dvh bg-wash">
      <EnterSubmits />
      <SiteHeader>
        <div className="flex items-center gap-3">
          {workspace && (
            <WhatsNewPreview
              slug={workspace.slug}
              name={workspace.name}
              lang={workspace.widgetLang}
              allUpdatesUrl={url}
              posts={posts.map((p) => ({ ...p, publishedOn: p.publishedOn ?? "" }))}
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
      <main className="mx-auto max-w-6xl px-6 py-16">{children}</main>
    </div>
  );
}
