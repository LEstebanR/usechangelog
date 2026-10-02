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

const tagStyles: Record<PostTag, string> = {
  New: "border-signal bg-signal text-void",
  Improved: "border-text/60 text-text",
  Fixed: "border-muted/60 text-muted",
  "Coming soon": "border-dashed border-muted/70 text-muted",
};

const dotStyles: Record<PostTag, string> = {
  New: "bg-signal ring-4 ring-signal/15",
  Improved: "bg-text",
  Fixed: "bg-muted",
  "Coming soon": "border border-dashed border-muted bg-panel",
};

const versions: Record<string, string> = {
  "Scheduled posts": "v2.4.0",
  "Lighter widget": "v2.3.2",
  "RSS dates": "v2.3.1",
  "Email digests": "next",
};

const placePaths: Record<string, string> = {
  Notion: "notion.so/acme/releases",
  Slack: "#shipped",
  GitHub: "github.com/acme/app/releases",
};

function Tag({ tag }: { tag: PostTag }) {
  return (
    <span
      className={`inline-block rounded-[3px] border px-1.5 py-px font-mono text-[0.68rem] font-medium uppercase tracking-wider ${tagStyles[tag]}`}
    >
      {tag}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">
      {children}
    </p>
  );
}

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const h2 =
  "mt-4 font-mono text-3xl font-medium leading-[1.12] tracking-[-0.03em] md:text-[2.75rem]";

function ChangelogPanel() {
  return (
    <section
      id="changelog"
      aria-labelledby="changelog-title"
      className="scroll-mt-6 overflow-hidden rounded-lg border border-line bg-panel shadow-[0_40px_120px_-40px_rgba(242,169,59,0.12)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 font-mono text-xs text-muted">
        <span className="truncate">acme.usechangelog.com</span>
        <span className="flex shrink-0 items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-signal" />
          RSS
        </span>
      </div>
      <div className="px-5 pb-2 pt-6 sm:px-7">
        <h2
          id="changelog-title"
          className="font-mono text-lg font-medium tracking-tight"
        >
          Acme changelog
        </h2>
        <p className="mt-1 text-sm text-muted">
          Example of a public page on UseChangelog.
        </p>
      </div>
      <ol className="px-5 pb-4 sm:px-7">
        {posts.map((post, i) => (
          <li key={post.title} className="relative py-5 pl-8">
            {i < posts.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute -bottom-[1.65rem] left-1 top-[1.65rem] w-px bg-line"
              />
            )}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-[1.65rem] size-[9px] rounded-full ${dotStyles[post.tag]}`}
            />
            <article>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs text-muted">
                <Tag tag={post.tag} />
                <span>{versions[post.title]}</span>
                <span aria-hidden="true">·</span>
                {post.dateTime ? (
                  <time dateTime={post.dateTime}>{post.date}</time>
                ) : (
                  <span>{post.date}</span>
                )}
              </div>
              <h3 className="mt-2.5 text-lg font-semibold tracking-tight">
                {post.title}
              </h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">
                {post.body}
              </p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-signal focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-void"
      >
        Skip to content
      </a>

      <header className="border-b border-line">
        <div
          className={`${container} flex items-center justify-between gap-6 py-4`}
        >
          <a
            href="#"
            className="flex items-center gap-2.5 font-mono text-sm font-medium"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-signal ring-4 ring-signal/15"
            />
            usechangelog
          </a>
          <nav
            aria-label="Main"
            className="flex items-center gap-7 font-mono text-xs text-muted"
          >
            <a href="#how" className="hidden hover:text-text md:inline">
              how it works
            </a>
            <a href="#changelog" className="hidden hover:text-text md:inline">
              example
            </a>
            <a href="#widget" className="hidden hover:text-text md:inline">
              widget
            </a>
            <a
              href={hero.primaryCta.href}
              className="rounded-md border border-line bg-panel px-3.5 py-2 text-text transition-colors hover:border-signal"
            >
              {hero.primaryCta.label}
            </a>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* Hero + changelog */}
        <div className={`${container} pb-20 pt-14 md:pb-28 md:pt-20`}>
          <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="lg:sticky lg:top-12 lg:col-span-5">
              <Label>Changelog · Announcements</Label>
              <h1 className="mt-6 font-mono text-[2.5rem] font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl md:text-[3.75rem]">
                Tell your users what shipped
                <span className="text-signal">.</span>
              </h1>
              <p className="mt-7 max-w-md text-lg leading-relaxed text-muted">
                {hero.subhead}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href={hero.primaryCta.href}
                  className="rounded-md bg-signal px-5 py-3 font-mono text-sm font-medium text-void transition-colors hover:bg-[#f7bf66]"
                >
                  {hero.primaryCta.label}
                </a>
                <a
                  href={hero.secondaryCta.href}
                  className="rounded-md border border-line px-5 py-3 font-mono text-sm text-text transition-colors hover:border-muted"
                >
                  {hero.secondaryCta.label}{" "}
                  <span aria-hidden="true" className="text-muted">
                    ↓
                  </span>
                </a>
              </div>
              <dl className="mt-12 grid max-w-sm grid-cols-3 gap-4 border-t border-line pt-6 font-mono">
                <div>
                  <dt className="text-[0.7rem] uppercase tracking-wider text-muted">
                    Setup
                  </dt>
                  <dd className="mt-1 text-sm">1 script tag</dd>
                </div>
                <div>
                  <dt className="text-[0.7rem] uppercase tracking-wider text-muted">
                    Editor
                  </dt>
                  <dd className="mt-1 text-sm">Markdown</dd>
                </div>
                <div>
                  <dt className="text-[0.7rem] uppercase tracking-wider text-muted">
                    Feed
                  </dt>
                  <dd className="mt-1 text-sm">RSS</dd>
                </div>
              </dl>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <ChangelogPanel />
            </div>
          </div>
        </div>

        {/* Problem */}
        <section
          aria-labelledby="problem-title"
          className="border-y border-line bg-panel/60"
        >
          <div
            className={`${container} grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-12`}
          >
            <div className="lg:col-span-5">
              <Label>The problem</Label>
              <h2 id="problem-title" className={h2}>
                {problem.title}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                {problem.intro}
              </p>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-void">
                {problem.places.map((place) => (
                  <li key={place.name} className="px-5 py-5 sm:px-6">
                    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm">
                      <span className="font-medium">{place.name}</span>
                      <span className="truncate text-xs text-muted">
                        {placePaths[place.name]}
                      </span>
                    </p>
                    <p className="mt-2 leading-relaxed text-muted">
                      {place.text}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 flex gap-3 text-lg leading-relaxed">
                <span aria-hidden="true" className="font-mono text-signal">
                  →
                </span>
                <span>{problem.outcome}</span>
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          aria-labelledby="how-title"
          className={`${container} scroll-mt-6 py-20 md:py-28`}
        >
          <Label>How it works</Label>
          <h2 id="how-title" className={`${h2} max-w-2xl`}>
            Write once. Show it everywhere.
          </h2>
          <ol className="mt-14 grid overflow-hidden rounded-lg border border-line md:grid-cols-3">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="border-line p-6 not-last:border-b md:p-8 md:not-last:border-b-0 md:not-last:border-r"
              >
                <span className="font-mono text-sm text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Widget */}
        <section
          id="widget"
          aria-labelledby="widget-title"
          className="scroll-mt-6 border-t border-line"
        >
          <div
            className={`${container} grid gap-14 py-20 md:py-28 lg:grid-cols-12 lg:gap-12`}
          >
            <div className="lg:col-span-5">
              <Label>The widget</Label>
              <h2 id="widget-title" className={h2}>
                {widget.title}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                {widget.text}
              </p>
              <p className="mt-6 font-mono text-xs text-muted">
                {"// "}
                {widget.note}
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
              <figure className="overflow-hidden rounded-lg border border-line bg-panel">
                <figcaption className="flex items-center justify-between border-b border-line px-5 py-3 font-mono text-xs text-muted">
                  <span>index.html</span>
                  <span>html</span>
                </figcaption>
                <pre
                  tabIndex={0}
                  aria-label="Widget embed snippet"
                  className="overflow-x-auto p-5 font-mono text-[0.82rem] leading-relaxed"
                >
                  <code>
                    <span className="text-muted">&lt;</span>script
                    {"\n  "}src<span className="text-muted">=</span>
                    <span className="text-signal">
                      &quot;https://usechangelog.com/widget.js&quot;
                    </span>
                    {"\n  "}data-project<span className="text-muted">=</span>
                    <span className="text-signal">&quot;acme&quot;</span>
                    {"\n  "}data-trigger<span className="text-muted">=</span>
                    <span className="text-signal">&quot;#whats-new&quot;</span>
                    {"\n  "}defer
                    {"\n"}
                    <span className="text-muted">&gt;&lt;/</span>script
                    <span className="text-muted">&gt;</span>
                  </code>
                </pre>
              </figure>

              <div
                role="img"
                aria-label="Mock of an app with the What's new widget open, showing two unread posts"
                className="overflow-hidden rounded-lg border border-line bg-panel"
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <div className="flex items-center gap-4">
                    <span className="size-5 rounded bg-line" />
                    <span className="hidden h-2 w-16 rounded-full bg-line sm:block" />
                    <span className="hidden h-2 w-12 rounded-full bg-line sm:block" />
                  </div>
                  <span className="flex items-center gap-2 rounded-md border border-line px-2.5 py-1 font-mono text-xs">
                    What’s new
                    <span className="rounded-full bg-signal px-1.5 text-[0.65rem] font-semibold text-void">
                      2
                    </span>
                  </span>
                </div>
                <div className="grid p-5 sm:grid-cols-[1fr_17rem]">
                  <div className="hidden flex-col gap-3 pr-6 sm:flex">
                    <span className="h-2 w-3/4 rounded-full bg-line" />
                    <span className="h-2 w-1/2 rounded-full bg-line" />
                    <span className="mt-4 h-20 rounded-md bg-line/60" />
                    <span className="h-2 w-2/3 rounded-full bg-line" />
                  </div>
                  <div className="rounded-md border border-line bg-void p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted">
                      Latest from Acme
                    </p>
                    <div className="mt-3 divide-y divide-line">
                      {posts.slice(0, 2).map((post) => (
                        <div key={post.title} className="py-3">
                          <div className="flex items-center gap-2 font-mono text-[0.7rem] text-muted">
                            <Tag tag={post.tag} />
                            <span>{post.date}</span>
                          </div>
                          <p className="mt-1.5 text-sm font-semibold">
                            {post.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audience */}
        <section
          aria-labelledby="audience-title"
          className="border-t border-line"
        >
          <div className={`${container} py-20 md:py-28`}>
            <Label>Who it’s for</Label>
            <h2 id="audience-title" className={`${h2} max-w-2xl`}>
              Small teams that ship often.
            </h2>
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {audiences.map((a) => (
                <div
                  key={a.title}
                  className="rounded-lg border border-line bg-panel p-6 md:p-8"
                >
                  <h3 className="font-mono text-lg font-medium">{a.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{a.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-20 flex flex-col items-start gap-6 rounded-lg border border-line p-6 md:flex-row md:items-center md:justify-between md:p-10">
              <p className="font-mono text-2xl font-medium tracking-[-0.03em] md:text-3xl">
                Ship it. Then say so<span className="text-signal">.</span>
              </p>
              <a
                href={hero.primaryCta.href}
                className="shrink-0 rounded-md bg-signal px-5 py-3 font-mono text-sm font-medium text-void transition-colors hover:bg-[#f7bf66]"
              >
                {hero.primaryCta.label}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div
          className={`${container} flex flex-col gap-2 py-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between`}
        >
          <span className="text-text">{footer.name}</span>
          <span>
            © {footer.year} {footer.name}
          </span>
        </div>
      </footer>
    </>
  );
}
