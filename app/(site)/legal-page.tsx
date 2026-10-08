import { legal } from "./content";
import { Grid } from "./grid";
import { container } from "./layout-styles";
import { markdownClass } from "./markdown-styles";
import { SectionLabel } from "./section-label";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./wordmark";

// The shell of /privacy and /terms (#18): the landing's grid and type, a label on the left
// and the text in the content column, like the landing's sections.
// `updated` is the day this page's text last changed; each page keeps its own.
export function LegalPage({ label, title, updated, children }: {
  label: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
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
              <p className="mt-4 text-sm text-graphite">Last updated {updated}</p>
              <div
                className={`mt-10 max-w-2xl text-graphite ${markdownClass} [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-ink`}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

// The contact address, as a mailto link, for the text of the legal pages.
export const LegalMail = () => <a href={`mailto:${legal.contact}`}>{legal.contact}</a>;
