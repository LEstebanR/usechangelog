import {
  audiences,
  footer,
  hero,
  posts,
  problem,
  steps,
  widget,
} from "./content";
import { Latest } from "./latest";
import { Reveal } from "./reveal";
import { Tag, tagDots } from "./tag";
import type { CSSProperties } from "react";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

const stepDetails = ["Markdown editor", "usechangelog.com/acme", "widget.js"];

type NodeKind = "entry" | "next";

const nodeStyles: Record<NodeKind, string> = {
  entry: "border border-blue bg-canvas",
  next: "border border-dashed border-blue bg-canvas",
};

// Section labels carry a small square from the brand mark: outlined for
// sections, dashed for what's next (the filled one belongs to the hero feed).
function SpineLabel({
  kind,
  children,
  className = "",
}: {
  kind: NodeKind;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 font-display text-sm font-medium text-blue ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 ${nodeStyles[kind]}`}
      />
      {children}
    </p>
  );
}

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const h2 =
  "text-balance font-display text-3xl font-medium leading-[1.1] tracking-[-0.025em] md:text-[2.6rem]";

function SectionHead({
  label,
  id,
  title,
  aside,
  node = "entry",
}: {
  label: string;
  id: string;
  title: string;
  aside?: string;
  node?: NodeKind;
}) {
  return (
    <div className="grid gap-y-6 md:grid-cols-12">
      <SpineLabel kind={node} className="md:col-span-3 md:pt-2">
        {label}
      </SpineLabel>
      <div className="md:col-span-9">
        <h2 id={id} className={`${h2} max-w-2xl`}>
          {title}
        </h2>
        {aside && (
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-graphite">
            {aside}
          </p>
        )}
      </div>
    </div>
  );
}

function Grid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <div className={`${container} grid h-full grid-cols-4 md:grid-cols-12`}>
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            style={delay(i === 0 ? 0 : 200 + i * 45)}
            className={`motion-draw border-l border-gridline ${i === 3 ? "border-r border-r-gridline md:border-r-0" : ""} ${i === 11 ? "md:border-r md:border-r-gridline" : ""} ${i >= 4 ? "hidden md:block" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative isolate">
      <Grid />
      <Reveal />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-blue focus:px-4 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>

      <header className="border-b border-hairline">
        <div
          className={`${container} flex items-center justify-between gap-6 py-4`}
        >
          <a
            href="#"
            className="flex items-center gap-2.5 font-display text-lg font-medium tracking-tight"
          >
            <span aria-hidden="true" className="grid size-4 grid-cols-2 gap-px">
              <span style={delay(300)} className="motion-light bg-blue" />
              <span style={delay(450)} className="motion-light bg-blue-soft" />
              <span style={delay(600)} className="motion-light bg-blue-soft" />
              <span style={delay(750)} className="motion-light bg-blue-soft" />
            </span>
            <span translate="no">UseChangelog</span>
          </a>
          <nav aria-label="Main" className="flex items-center gap-8 text-sm">
            <a
              href="#how"
              className="hidden text-graphite hover:text-ink md:inline"
            >
              How it works
            </a>
            <a
              href="#changelog"
              className="hidden text-graphite hover:text-ink md:inline"
            >
              Example
            </a>
            <a
              href="#widget"
              className="hidden text-graphite hover:text-ink md:inline"
            >
              Widget
            </a>
            <a
              href={hero.primaryCta.href}
              className="motion-press border border-ink px-4 py-2 font-medium transition-colors hover:bg-ink hover:text-canvas"
            >
              {hero.primaryCta.label}
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <div className={`${container} pb-20 pt-16 md:pb-28 md:pt-24`}>
          <div className="grid gap-y-6 md:grid-cols-12">
            <div
              style={delay(700)}
              className="motion-rise order-last mt-8 md:order-none md:col-span-3 md:mt-0 md:pt-4 md:pr-10"
            >
              <Latest posts={posts.filter((p) => p.tag !== "Coming soon")} />
            </div>
            <div className="md:col-span-9">
              <h1
                style={delay(250)}
                className="motion-rise text-balance font-display text-[2.75rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-[5.25rem]"
              >
                Tell your users what shipped.
              </h1>
              <p
                style={delay(370)}
                className="motion-rise mt-8 max-w-xl text-lg leading-relaxed text-graphite md:text-xl"
              >
                {hero.subhead}
              </p>
              <div
                style={delay(490)}
                className="motion-rise mt-10 flex flex-wrap gap-3"
              >
                <a
                  href={hero.primaryCta.href}
                  className="motion-press bg-blue px-6 py-3.5 text-base font-medium text-canvas transition-colors hover:bg-ink"
                >
                  {hero.primaryCta.label}
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="motion-press border border-hairline bg-canvas px-6 py-3.5 text-base font-medium transition-colors hover:border-ink"
                >
                  {hero.secondaryCta.label}
                </a>
              </div>
            </div>
          </div>

          <dl
            style={delay(610)}
            className="motion-rise mt-20 grid grid-cols-2 border-y border-hairline md:mt-28 md:grid-cols-4"
          >
            {[
              ["Setup", "One script tag"],
              ["Editor", "Markdown"],
              ["Tags", "New, Improved, Fixed"],
              ["Public page", "usechangelog.com/acme"],
            ].map(([term, value], i) => (
              <div
                key={term}
                className={`py-5 pr-4 ${i % 2 === 1 ? "pl-4 md:pl-0" : ""} ${i < 2 ? "border-b border-hairline md:border-b-0" : ""}`}
              >
                <dt className="text-sm text-graphite">{term}</dt>
                <dd className="mt-1 font-display text-base font-medium [overflow-wrap:anywhere]">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Problem */}
        <section
          aria-labelledby="problem-title"
          className="border-t border-hairline"
        >
          <div className={`${container} py-20 md:py-28`}>
            <SectionHead
              label="The problem"
              id="problem-title"
              title={problem.title}
              aside={problem.intro}
            />
            <ul className="mt-14 grid border-t border-ink md:ml-[25%] md:grid-cols-3">
              {problem.places.map((place, i) => (
                <li
                  key={place.name}
                  data-reveal
                  style={delay(i * 110)}
                  className="border-b border-hairline py-6 md:border-b-0 md:pr-8"
                >
                  <h3 className="font-display text-xl font-medium">
                    {place.name}
                  </h3>
                  <p className="mt-2 leading-relaxed text-graphite">
                    {place.text}
                  </p>
                </li>
              ))}
            </ul>
            <p
              data-reveal
              className="mt-10 max-w-2xl border-l-2 border-blue pl-5 text-lg leading-relaxed md:ml-[25%]"
            >
              {problem.outcome}
            </p>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          aria-labelledby="how-title"
          className="scroll-mt-6 border-t border-hairline"
        >
          <div className={`${container} py-20 md:py-28`}>
            <SectionHead
              label="How it works"
              id="how-title"
              title="Three steps from release to readers."
            />
            <ol className="mt-14 grid border border-hairline bg-canvas md:grid-cols-3">
              {steps.map((step, i) => (
                <li
                  key={step.title}
                  data-reveal
                  style={delay(i * 120)}
                  className="flex flex-col border-hairline p-6 not-last:border-b md:p-8 md:not-last:border-b-0 md:not-last:border-r"
                >
                  <span className="font-display text-sm tabular-nums text-blue">
                    {i + 1}/3
                  </span>
                  <h3 className="mt-8 font-display text-2xl font-medium tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed text-graphite">
                    {step.text}
                  </p>
                  <p className="mt-8 border-t border-hairline pt-4 font-display text-sm text-graphite">
                    {stepDetails[i]}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Example changelog */}
        <section
          id="changelog"
          aria-labelledby="changelog-title"
          className="scroll-mt-6 border-t border-hairline bg-blue-wash/85"
        >
          <div className={`${container} py-20 md:py-28`}>
            <SectionHead
              label="Example"
              id="changelog-title"
              title="What your readers see."
              aside="A public page with every post dated and tagged. Here is a sample for a product called Acme."
            />
            <div className="mt-14 border border-ink bg-canvas">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink px-5 py-4 md:px-8">
                <p className="font-display text-lg font-medium">
                  Acme / Changelog
                </p>
                <p className="font-display text-sm text-graphite">
                  usechangelog.com/acme
                </p>
              </div>
              <div
                aria-hidden="true"
                className="hidden grid-cols-12 border-b border-hairline px-8 py-3 text-sm text-graphite md:grid"
              >
                <span className="col-span-2">Date</span>
                <span className="col-span-2">Type</span>
                <span className="col-span-8">Entry</span>
              </div>
              <div className="divide-y divide-hairline">
                {posts.map((post, i) => {
                  const soon = post.tag === "Coming soon";
                  return (
                    <article
                      key={post.title}
                      data-reveal
                      style={delay(i * 130)}
                      className={`grid gap-3 px-5 py-7 md:grid-cols-12 md:gap-0 md:px-8 ${soon ? "bg-wash" : ""}`}
                    >
                      <div className="flex items-center gap-3 md:contents">
                        <div className="font-display text-sm tabular-nums text-graphite md:col-span-2 md:pt-1">
                          {post.dateTime ? (
                            <time dateTime={post.dateTime}>{post.date}</time>
                          ) : (
                            post.date
                          )}
                        </div>
                        <div className="md:col-span-2 md:pt-0.5">
                          <Tag tag={post.tag} />
                        </div>
                      </div>
                      <div className="md:col-span-8">
                        <h3 className="font-display text-xl font-medium tracking-tight md:text-2xl">
                          {post.title}
                        </h3>
                        <p className="mt-2 max-w-2xl leading-relaxed text-graphite">
                          {post.body}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Widget */}
        <section
          id="widget"
          aria-labelledby="widget-title"
          className="scroll-mt-6 border-t border-hairline"
        >
          <div className={`${container} py-20 md:py-28`}>
            <SectionHead
              label="Widget"
              id="widget-title"
              title={widget.title}
              aside={widget.text}
            />
            <div className="mt-14 grid gap-6 md:ml-[25%] lg:grid-cols-9">
              <figure
                data-reveal
                className="min-w-0 border border-hairline bg-wash lg:col-span-5"
              >
                <figcaption className="flex items-center justify-between border-b border-hairline px-5 py-3 text-sm text-graphite">
                  <span>Embed snippet</span>
                  <span>HTML</span>
                </figcaption>
                <pre
                  tabIndex={0}
                  aria-label="Widget embed snippet"
                  className="overflow-x-auto p-5 font-mono text-[0.82rem] leading-relaxed"
                >
                  <code translate="no">{widget.snippet}</code>
                </pre>
              </figure>

              <div
                role="img"
                aria-label="Mock of the What’s new widget, showing two unread posts"
                data-reveal="open"
                style={delay(250)}
                className="border border-ink bg-canvas lg:col-span-4"
              >
                <div className="flex items-center justify-between border-b border-ink px-4 py-3">
                  <span className="font-display font-medium">What’s new</span>
                  <span className="bg-blue px-2 py-0.5 font-display text-xs font-medium tabular-nums text-canvas">
                    2 unread
                  </span>
                </div>
                <div className="divide-y divide-hairline">
                  {posts.slice(0, 2).map((post) => (
                    <div key={post.title} className="flex gap-3 px-4 py-4">
                      <span
                        className={`mt-1.5 size-2 shrink-0 ${tagDots[post.tag]}`}
                      />
                      <div>
                        <p className="text-sm text-graphite">
                          {post.tag}, {post.date}
                        </p>
                        <p className="mt-0.5 font-display font-medium">
                          {post.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="border-t border-hairline px-4 py-3 text-sm text-blue">
                  View all updates
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm text-graphite md:ml-[25%]">
              {widget.note}
            </p>
          </div>
        </section>

        {/* Audience */}
        <section
          aria-labelledby="audience-title"
          className="border-t border-hairline"
        >
          <div className={`${container} py-20 md:py-28`}>
            <SectionHead
              label="Who it’s for"
              id="audience-title"
              title="Made for teams of one to twenty."
            />
            <div className="mt-14 grid border-t border-ink md:ml-[25%] md:grid-cols-2">
              {audiences.map((a, i) => (
                <div
                  key={a.title}
                  data-reveal
                  style={delay(i * 120)}
                  className={`py-6 ${i === 0 ? "border-b border-hairline md:border-b-0 md:pr-8" : "md:pl-8"}`}
                >
                  <h3 className="font-display text-2xl font-medium tracking-tight">
                    {a.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-graphite">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section
          id="get-started"
          aria-labelledby="get-started-title"
          className="scroll-mt-6 border-t border-ink"
        >
          <div
            className={`${container} grid gap-y-6 py-16 md:grid-cols-12 md:py-20`}
          >
            <SpineLabel kind="next" className="md:col-span-3 md:pt-2">
              Next
            </SpineLabel>
            <div className="md:col-span-9">
              <h2
                id="get-started-title"
                className="text-balance font-display text-3xl font-medium leading-tight tracking-[-0.025em] md:text-4xl"
              >
                Start your changelog.
              </h2>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <button
                  type="button"
                  disabled
                  aria-describedby="signup-status"
                  className="cursor-not-allowed border border-hairline bg-wash px-6 py-3.5 font-medium text-graphite"
                >
                  {hero.primaryCta.label}
                </button>
                <p id="signup-status" className="text-graphite">
                  Sign-up isn’t open yet. We’re building the first version.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline bg-canvas">
        <div
          className={`${container} flex flex-col gap-2 py-8 text-sm text-graphite sm:flex-row sm:items-center sm:justify-between`}
        >
          <span translate="no" className="font-display font-medium text-ink">
            {footer.name}
          </span>
          <span className="tabular-nums">
            © {footer.year} {footer.name}
          </span>
        </div>
      </footer>
    </div>
  );
}
