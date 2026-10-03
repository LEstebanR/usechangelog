import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { getUser } from "@/lib/auth/server";
import { SubmitButton } from "../submit-button";
import { Wordmark } from "../wordmark";

export const metadata: Metadata = { title: "UseChangelog" };

// Placeholder app shell. The workspace (#5) and posts (#6) come next.
export default async function AppPage() {
  // The proxy already redirects without a session; this is the real check.
  const user = await getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-dvh bg-wash">
      <header className="border-b border-hairline bg-canvas">
        <div className="mx-auto flex h-(--header-h) max-w-6xl items-center justify-between gap-6 px-6">
          <Wordmark />
          <form action={signOut} className="flex items-center gap-4">
            <span className="hidden text-sm text-graphite sm:inline">{user.email}</span>
            <SubmitButton
              pendingLabel="Signing out…"
              className="motion-press border border-ink px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-canvas disabled:opacity-50"
            >
              Sign out
            </SubmitButton>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="font-display text-3xl font-medium tracking-tight">Welcome</h1>
        <p className="mt-3 text-graphite">
          Signed in as <span className="text-ink">{user.email}</span>.
        </p>
      </main>
    </div>
  );
}
