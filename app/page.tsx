import {
  audiences,
  footer,
  hero,
  posts,
  problem,
  steps,
  widget,
  type PostTag,
} from "./content";

const numerals = ["i.", "ii.", "iii."];

const tagStyles: Record<PostTag, string> = {
  New: "bg-terracotta text-paper border-terracotta",
  Improved: "border-ink text-ink",
  Fixed: "border-ink-soft text-ink-soft",
  "Coming soon": "border-dashed border-ink-soft text-ink-soft italic",
};

function Tag({ tag }: { tag: PostTag }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] ${tagStyles[tag]}`}
    >
      {tag}
    </span>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">
      {children}
    </p>
  );
}

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      <header className={container}>
        <div className="flex items-center justify-between gap-6 py-5">
          <a
            href="#"
            className="font-display text-2xl font-semibold tracking-tight"
          >
            UseChangelog
          </a>
          <nav aria-label="Main" className="flex items-center gap-7 text-sm">
            <a href="#how" className="hidden hover:text-terracotta md:inline">
              How it works
            </a>
            <a
              href="#changelog"
              className="hidden hover:text-terracotta md:inline"
            >
              Example
            </a>
            <a href="#widget" className="hidden hover:text-terracotta md:inline">
              Widget
            </a>
            <a
              href={hero.primaryCta.href}
              className="rounded-full border border-ink px-4 py-1.5 font-medium transition-colors hover:bg-ink hover:text-paper"
            >
              {hero.primaryCta.label}
            </a>
          </nav>
        </div>
        <div className="border-t-2 border-ink" />
        <div className="mt-[3px] border-t border-ink" />
      </header>

      <main id="main">
        {/* Hero */}
        <section className={`${container} pb-20 pt-14 md:pb-28 md:pt-20`}>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-8">
              <Kicker>Changelog &amp; product announcements</Kicker>
              <h1 className="mt-6 font-display text-[2.75rem] font-medium leading-[1.02] tracking-[-0.02em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
                Tell your users what{" "}
                <em className="font-normal text-terracotta">shipped.</em>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
                {hero.subhead}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <a
                  href={hero.primaryCta.href}
                  className="rounded-full bg-ink px-7 py-3.5 text-base font-medium text-paper transition-colors hover:bg-terracotta"
                >
                  {hero.primaryCta.label}
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="group text-base font-medium underline decoration-rule decoration-2 underline-offset-[6px] hover:decoration-terracotta"
                >
                  {hero.secondaryCta.label}{" "}
                  <span
                    aria-hidden="true"
                    className="inline-block transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </a>
              </div>
            </div>

            <aside
              aria-label="Latest updates preview"
              className="border-t border-ink pt-5 lg:col-span-4 lg:mt-3 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                In this issue
              </p>
              <ol className="mt-4 divide-y divide-rule">
                {posts.map((post) => (
                  <li key={post.title} className="py-4">
                    <div className="flex items-baseline justify-between gap-3 text-xs text-ink-soft">
                      <span className="uppercase tracking-[0.12em]">
                        {post.tag}
                      </span>
                      <span>{post.date}</span>
                    </div>
                    <p className="mt-1.5 font-display text-xl leading-snug">
                      {post.title}
                    </p>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        {/* Problem */}
        <section
          aria-labelledby="problem-title"
          className="border-y border-rule bg-paper-deep"
        >
          <div className={`${container} py-20 md:py-28`}>
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5">
                <Kicker>The problem</Kicker>
                <h2
                  id="problem-title"
                  className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-[-0.015em] md:text-5xl"
                >
                  {problem.title}
                </h2>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
                  {problem.intro}
                </p>
              </div>
              <ul className="divide-y divide-rule border-y border-rule lg:col-span-7">
                {problem.places.map((place) => (
                  <li
                    key={place.name}
                    className="grid gap-2 py-6 sm:grid-cols-[8rem_1fr] sm:gap-6"
                  >
                    <span className="font-display text-2xl italic">
                      {place.name}
                    </span>
                    <span className="text-base leading-relaxed text-ink-soft sm:pt-1.5">
                      {place.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <blockquote className="mx-auto mt-16 max-w-3xl border-l-2 border-terracotta pl-6 md:mt-20 md:pl-10">
              <p className="font-display text-2xl italic leading-snug md:text-[2rem]">
                {problem.outcome}
              </p>
            </blockquote>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          aria-labelledby="how-title"
          className={`${container} scroll-mt-6 py-20 md:py-28`}
        >
          <Kicker>How it works</Kicker>
          <h2
            id="how-title"
            className="mt-5 max-w-2xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.015em] md:text-5xl"
          >
            Three steps, one source of truth.
          </h2>
          <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {steps.map((step, i) => (
              <li key={step.title} className="border-t border-ink pt-6">
                <span
                  aria-hidden="true"
                  className="font-display text-5xl italic text-terracotta"
                >
                  {numerals[i]}
                </span>
                <h3 className="mt-5 font-display text-2xl font-medium">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Example changelog */}
        <section
          id="changelog"
          aria-labelledby="changelog-title"
          className="scroll-mt-6 border-t border-rule"
        >
          <div className={`${container} py-20 md:py-28`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <Kicker>Example</Kicker>
                <h2
                  id="changelog-title"
                  className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-[-0.015em] md:text-5xl"
                >
                  A changelog people actually read.
                </h2>
              </div>
              <p className="max-w-sm text-ink-soft">
                This is what your public page looks like. Dated, tagged, and
                written for customers.
              </p>
            </div>

            <div className="mt-12 rounded-sm border border-ink/80 bg-[#fbf8f2] shadow-[6px_6px_0_0_var(--color-paper-deep)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule px-6 py-5 md:px-12">
                <p className="font-display text-2xl font-semibold">
                  Acme <span className="font-normal italic">Changelog</span>
                </p>
                <p className="text-sm text-ink-soft">acme.usechangelog.com</p>
              </div>
              <div className="divide-y divide-rule px-6 md:px-12">
                {posts.map((post) => {
                  const soon = post.tag === "Coming soon";
                  return (
                    <article
                      key={post.title}
                      className={`grid gap-4 py-10 md:grid-cols-[11rem_1fr] md:gap-10 ${soon ? "opacity-90" : ""}`}
                    >
                      <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-3">
                        {post.dateTime ? (
                          <time
                            dateTime={post.dateTime}
                            className="text-sm text-ink-soft"
                          >
                            {post.date}
                          </time>
                        ) : (
                          <span className="text-sm text-ink-soft">
                            {post.date}
                          </span>
                        )}
                        <Tag tag={post.tag} />
                      </div>
                      <div>
                        <h3
                          className={`font-display text-2xl font-medium md:text-3xl ${soon ? "italic" : ""}`}
                        >
                          {post.title}
                        </h3>
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
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
          className="scroll-mt-6 bg-ink text-paper"
        >
          <div
            className={`${container} grid gap-14 py-20 md:py-28 lg:grid-cols-12 lg:gap-10`}
          >
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e39a74]">
                The widget
              </p>
              <h2
                id="widget-title"
                className="mt-5 font-display text-4xl font-medium leading-[1.08] tracking-[-0.015em] md:text-5xl"
              >
                {widget.title}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/75">
                {widget.text}
              </p>
              <p className="mt-6 text-sm italic text-paper/65">
                {widget.note}
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
              <figure className="overflow-hidden rounded-sm border border-paper/20">
                <figcaption className="border-b border-paper/20 px-5 py-3 text-xs uppercase tracking-[0.16em] text-paper/65">
                  index.html
                </figcaption>
                <pre
                  tabIndex={0}
                  aria-label="Widget embed snippet"
                  className="overflow-x-auto p-5 text-sm leading-relaxed"
                >
                  <code>{widget.snippet}</code>
                </pre>
              </figure>

              <div
                role="img"
                aria-label="Mock of the What's new widget open inside an app, showing two unread posts"
                className="self-end w-full max-w-sm rounded-md bg-paper p-5 text-ink shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-semibold">
                    What’s new
                  </span>
                  <span className="rounded-full bg-terracotta px-2 py-0.5 text-xs font-semibold text-paper">
                    2 new
                  </span>
                </div>
                <div className="mt-4 divide-y divide-rule border-t border-rule">
                  {posts.slice(0, 2).map((post) => (
                    <div key={post.title} className="py-3">
                      <div className="flex items-center gap-2 text-xs text-ink-soft">
                        <span className="uppercase tracking-[0.12em]">
                          {post.tag}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{post.date}</span>
                      </div>
                      <p className="mt-1 font-display text-base font-medium">
                        {post.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audience */}
        <section
          aria-labelledby="audience-title"
          className={`${container} py-20 md:py-28`}
        >
          <Kicker>Who it’s for</Kicker>
          <h2
            id="audience-title"
            className="mt-5 max-w-2xl font-display text-4xl font-medium leading-[1.08] tracking-[-0.015em] md:text-5xl"
          >
            Built for teams that ship more than they announce.
          </h2>
          <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-0 md:divide-x md:divide-rule">
            {audiences.map((a, i) => (
              <div
                key={a.title}
                className={`border-t border-ink pt-6 md:border-t-0 md:pt-0 ${i === 0 ? "md:pr-12" : "md:pl-12"}`}
              >
                <h3 className="font-display text-3xl font-medium italic">
                  {a.title}
                </h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
                  {a.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-24 flex flex-col items-start gap-6 border-t-2 border-ink pt-10 md:flex-row md:items-center md:justify-between">
            <p className="font-display text-3xl font-medium leading-tight md:text-4xl">
              Your next release deserves{" "}
              <em className="font-normal text-terracotta">a page.</em>
            </p>
            <a
              href={hero.primaryCta.href}
              className="shrink-0 rounded-full bg-ink px-7 py-3.5 text-base font-medium text-paper transition-colors hover:bg-terracotta"
            >
              {hero.primaryCta.label}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div
          className={`${container} flex flex-col gap-2 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between`}
        >
          <span className="font-display text-base font-semibold text-ink">
            {footer.name}
          </span>
          <span>
            © {footer.year} {footer.name}
          </span>
        </div>
      </footer>
    </>
  );
}
