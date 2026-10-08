import Link from "next/link";
import { brand, legal } from "./content";
import { Grid } from "./grid";
import { markdownClass } from "./markdown-styles";
import { SectionLabel } from "./section-label";
import { SiteHeader } from "./wordmark";

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

// The shell of /privacy and /terms (#18): the landing's grid and type, a label on the left
// and the text in the content column, like the landing's sections.
export function LegalPage({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="relative isolate flex-1">
        <Grid />
        <div className={`${container} pb-20 pt-16 md:pb-28 md:pt-24`}>
          <div className="grid gap-y-4 md:grid-cols-12">
            <SectionLabel className="self-start md:col-span-3 md:pt-4">{label}</SectionLabel>
            <div className="md:col-span-9">
              <h1 className="text-balance font-display text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 text-sm text-graphite">Last updated {legal.updated}</p>
              <div
                className={`mt-10 max-w-2xl text-graphite ${markdownClass} [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-ink`}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-hairline bg-canvas">
        <div className={`${container} flex flex-wrap gap-x-6 gap-y-2 py-8 text-sm text-graphite`}>
          <Link href="/" className="hover:text-ink">
            <span translate="no" className="font-display font-medium text-ink">
              {brand}
            </span>
          </Link>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}

// Privacy · Terms, for every footer that needs them: the landing, /sign-in and the public page.
export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <span className={`flex gap-4 ${className}`}>
      {legal.links.map(({ href, label }) => (
        <Link key={href} href={href} className="hover:text-ink">
          {label}
        </Link>
      ))}
    </span>
  );
}
