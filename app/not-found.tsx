import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "./wordmark";

export const metadata: Metadata = { title: "Page not found — UseChangelog" };

// Unknown routes and every notFound() in the app, including /{slug} (#7).
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-wash">
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-6 py-16 sm:items-center">
        <div className="w-full max-w-md border border-hairline bg-canvas p-8">
          <p className="font-display text-sm font-medium tracking-tight text-blue">404</p>
          <h1 className="mt-2 font-display text-2xl font-medium tracking-tight">
            This page doesn&apos;t exist
          </h1>
          <p className="mt-3 text-graphite">
            The link may be broken, or the page may have moved. If you were looking for a
            changelog, check the address with whoever shared it.
          </p>
          <Link
            href="/"
            className="motion-press mt-6 inline-block bg-blue px-4 py-2.5 font-medium text-canvas transition-opacity hover:opacity-90"
          >
            Go to UseChangelog
          </Link>
        </div>
      </main>
    </div>
  );
}
