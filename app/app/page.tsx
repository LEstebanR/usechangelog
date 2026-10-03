import type { Metadata } from "next";
import { signOut } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/server";
import { SubmitButton } from "../submit-button";
import { SiteHeader } from "../wordmark";

export const metadata: Metadata = { title: "UseChangelog" };

// Placeholder app shell. The workspace (#5) and posts (#6) come next.
export default async function AppPage() {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-wash">
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
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-3xl font-medium tracking-tight">Welcome</h1>
        <p className="mt-3 text-graphite">
          Signed in as <span className="text-ink">{user.email}</span>.
        </p>
      </main>
    </div>
  );
}
