import type { Metadata } from "next";
import { signOut } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/server";
import { EnterSubmits } from "../enter-submits";
import { SubmitButton } from "../submit-button";
import { SiteHeader } from "../wordmark";

export const metadata: Metadata = { title: "UseChangelog" };

// Shell for /app. Access checks live in each page (requireUser / requireWorkspace):
// layouts don't re-run on client navigation.
export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-wash">
      <EnterSubmits />
      <SiteHeader>
        <form action={signOut} className="flex items-center gap-4">
          <span className="hidden text-sm text-graphite sm:inline">{user.email}</span>
          <SubmitButton
            pendingLabel="Signing out…"
            className="motion-press border border-ink px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-canvas disabled:opacity-50"
          >
            Sign out
          </SubmitButton>
        </form>
      </SiteHeader>
      <main className="mx-auto max-w-6xl px-6 py-16">{children}</main>
    </div>
  );
}
