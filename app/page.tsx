import {
  audience,
  brand,
  closing,
  example,
  footer,
  hero,
  how,
  posts,
  problem,
  publicPath,
  shippedPosts,
  widget,
} from "./content";
import { Latest } from "./latest";
import { Reveal } from "./reveal";
import { SectionLabel } from "./section-label";
import { Grid } from "./grid";
import { Tag, tagDots } from "./tag";
import { Wordmark } from "./wordmark";
import type { CSSProperties } from "react";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;
// One rhythm for every list that reveals item by item.
const stagger = (i: number) => delay(i * 120);

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const h2 =
  "text-balance font-display font-medium tracking-[-0.025em] text-3xl leading-[1.1] md:text-[2.6rem]";
const h2Small =
  "text-balance font-display font-medium tracking-[-0.025em] text-3xl leading-tight md:text-4xl";

const navLinks = [
  { href: "#how", label: "How it works" },
  { href: "#changelog", label: "Example" },
  { href: "#widget", label: "Widget" },
];

// Places content on columns 4–12 of the 12-column grid, like section headings.
function Indented({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`md:grid md:grid-cols-12 ${className}`}>
      <div className="min-w-0 md:col-span-9 md:col-start-4">{children}</div>
    </div>
  );
}

function Section({
  id,
  label,
  title,
  aside,
  marker,
  small = false,
  className = "border-t border-hairline",
  padding = "py-20 md:py-28",
  children,
}: {
  id: string;
  label: string;
  title: string;
  aside?: string;
  marker?: "outline" | "dashed";
  small?: boolean;
  className?: string;
  padding?: string;
  children: React.ReactNode;
}) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={className}>
      <div className={`${container} ${padding}`}>
        <div className="grid gap-y-6 md:grid-cols-12">
          <SectionLabel marker={marker} className="md:col-span-3 md:pt-2">
            {label}
          </SectionLabel>
          <div className="md:col-span-9">
            <h2 id={titleId} className={`${small ? h2Small : h2} max-w-2xl`}>
              {title}
            </h2>
            {aside && (
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-graphite">
                {aside}
              </p>
            )}
          </div>
        </div>
        {children}
      </div>
    </section>
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

      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
        <div
          className={`${container} flex h-(--header-h) items-center justify-between gap-6`}
        >
          <Wordmark href="#" animated />
          <nav aria-label="Main" className="flex items-center gap-8 text-sm">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hidden text-graphite hover:text-ink md:inline"
              >
                {link.label}
              </a>
            ))}
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
              <Latest
                label={`Latest from ${example.product}`}
                posts={shippedPosts}
              />
            </div>
            <div className="md:col-span-9">
              <h1
                style={delay(250)}
                className="motion-lift text-balance font-display text-[2.75rem] font-medium leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-[5.25rem]"
              >
                {hero.headline}
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
            {hero.facts.map((fact, i) => (
              <div
                key={fact.term}
                className={`py-5 pr-4 ${i % 2 === 1 ? "pl-4 md:pl-0" : ""} ${i < 2 ? "border-b border-hairline md:border-b-0" : ""}`}
              >
                <dt className="text-sm text-graphite">{fact.term}</dt>
                <dd className="mt-1 font-display text-base font-medium [overflow-wrap:anywhere]">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <Section
          id="problem"
          label={problem.label}
          title={problem.title}
          aside={problem.intro}
        >
          <Indented className="mt-14">
            <ul className="grid border-t border-ink md:grid-cols-3">
              {problem.places.map((place, i) => (
                <li
                  key={place.name}
                  data-reveal
                  style={stagger(i)}
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
              className="mt-10 max-w-2xl border-l-2 border-blue pl-5 text-lg leading-relaxed"
            >
              {problem.outcome}
            </p>
          </Indented>
        </Section>

        <Section id="how" label={how.label} title={how.title}>
          <ol className="mt-14 grid border border-hairline bg-canvas md:grid-cols-3">
            {how.steps.map((step, i) => (
              <li
                key={step.title}
                data-reveal
                style={stagger(i)}
                className="flex flex-col border-hairline p-6 not-last:border-b md:p-8 md:not-last:border-b-0 md:not-last:border-r"
              >
                <span className="font-display text-sm tabular-nums text-blue">
                  {i + 1}/{how.steps.length}
                </span>
                <h3 className="mt-8 font-display text-2xl font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-graphite">
                  {step.text}
                </p>
                <p className="mt-8 border-t border-hairline pt-4 font-display text-sm text-graphite">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section
          id="changelog"
          label={example.label}
          title={example.title}
          aside={example.aside}
          className="border-t border-hairline bg-blue-wash/85"
        >
          <div className="mt-14 border border-ink bg-canvas">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-ink px-5 py-4 md:px-8">
              <p className="font-display text-lg font-medium">
                {example.product} / Changelog
              </p>
              <p className="font-display text-sm text-graphite">{publicPath}</p>
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
              {posts.map((post, i) => (
                <article
                  key={post.title}
                  data-reveal
                  style={stagger(i)}
                  className={`grid gap-3 px-5 py-7 md:grid-cols-12 md:gap-0 md:px-8 ${post.tag === "Coming soon" ? "bg-wash" : ""}`}
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
              ))}
            </div>
          </div>
        </Section>

        <Section
          id="widget"
          label={widget.label}
          title={widget.title}
          aside={widget.text}
        >
          <Indented className="mt-14">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-9">
              <figure
                data-reveal
                className="border border-hairline bg-wash lg:col-span-5"
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
                aria-label="Mock of the What’s new widget, showing the latest posts"
                data-reveal="open"
                style={delay(250)}
                className="border border-ink bg-canvas lg:col-span-4"
              >
                <div className="border-b border-ink px-4 py-3">
                  <span className="font-display font-medium">What’s new</span>
                </div>
                <div className="divide-y divide-hairline">
                  {shippedPosts.slice(0, 2).map((post) => (
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
            <p className="mt-6 text-sm text-graphite">{widget.note}</p>
          </Indented>
        </Section>

        <Section id="audience" label={audience.label} title={audience.title}>
          <Indented className="mt-14">
            <div className="grid border-t border-ink md:grid-cols-2">
              {audience.groups.map((group, i) => (
                <div
                  key={group.title}
                  data-reveal
                  style={stagger(i)}
                  className={`py-6 ${i === 0 ? "border-b border-hairline md:border-b-0 md:pr-8" : "md:pl-8"}`}
                >
                  <h3 className="font-display text-2xl font-medium tracking-tight">
                    {group.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-graphite">
                    {group.text}
                  </p>
                </div>
              ))}
            </div>
          </Indented>
        </Section>

        <Section
          id="get-started"
          label={closing.label}
          title={closing.title}
          aside={closing.plan}
          marker="dashed"
          small
          className="border-t border-ink"
          padding="py-16 md:py-20"
        >
          <Indented className="mt-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="button"
                disabled
                aria-describedby="signup-status"
                className="cursor-not-allowed border border-hairline bg-wash px-6 py-3.5 font-medium text-graphite"
              >
                {hero.primaryCta.label}
              </button>
              <p id="signup-status" className="text-graphite">
                {closing.status}
              </p>
            </div>
          </Indented>
        </Section>
      </main>

      <footer className="border-t border-hairline bg-canvas">
        <div
          className={`${container} flex flex-col gap-2 py-8 text-sm text-graphite sm:flex-row sm:items-center sm:justify-between`}
        >
          <span translate="no" className="font-display font-medium text-ink">
            {brand}
          </span>
          <span className="tabular-nums">
            © {footer.year} {brand}
          </span>
        </div>
      </footer>
    </div>
  );
}
