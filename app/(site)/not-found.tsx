import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Grid } from "./grid";
import { SectionLabel } from "./section-label";
import { TAG_PALETTE, Tag } from "./tag";
import { SiteHeader } from "./wordmark";

export const metadata: Metadata = { title: "Page not found — UseChangelog" };

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

// Unknown routes and every notFound() in the app, including /{slug} (#7).
// Written as a release note, because that's what we do.
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="relative isolate flex flex-1 items-center">
        <Grid />
        <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8">
          <div className="max-w-xl">
            <div style={delay(300)} className="motion-rise">
              <SectionLabel marker="dashed">Release notes · 404</SectionLabel>
            </div>
            <h1
              style={delay(380)}
              className="motion-lift mt-5 font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl"
            >
              This page never shipped.
            </h1>
            <p style={delay(460)} className="motion-rise mt-5 text-lg text-graphite">
              We went through every release and found nothing at this address. The link may
              have a typo, or whatever lived here moved on.
            </p>

            <ol className="mt-10 border-l border-hairline">
              <li style={delay(560)} className="motion-rise relative pb-8 pl-6">
                <span
                  aria-hidden="true"
                  className="absolute top-1.5 -left-[5px] size-2.5 border border-dashed border-graphite bg-canvas"
                />
                <div className="flex items-center gap-2.5 text-sm text-graphite">
                  <Tag tag="Coming soon" />
                  <span>Not scheduled</span>
                </div>
                <p className="mt-2 font-display text-lg font-medium text-ink">
                  The page you were looking for
                </p>
                <p className="mt-1 text-sm text-graphite">Not on the roadmap. Yet.</p>
              </li>
              <li style={delay(660)} className="motion-rise relative pl-6">
                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 -left-[5px] size-2.5 ${TAG_PALETTE.Fixed.dot}`}
                />
                <div className="flex items-center gap-2.5 text-sm text-graphite">
                  <Tag tag="Fixed" />
                  <span>Today</span>
                </div>
                <p className="mt-2 font-display text-lg font-medium text-ink">A way back home</p>
                <Link
                  href="/"
                  className="motion-press mt-4 inline-block bg-ink px-4 py-2.5 font-medium text-canvas transition-colors hover:bg-blue"
                >
                  Back to UseChangelog
                </Link>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
