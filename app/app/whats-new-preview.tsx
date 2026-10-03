"use client";

import { useEffect, useRef, useState } from "react";
import type { Category, PostType } from "@/lib/posts/form";
import { WIDGET_COPY, type WidgetLang } from "@/lib/widget/copy";

type Post = { id: string; title: string; body: string; category: Category; type: PostType; publishedOn: string };

// Category color as a soft pill with strong text. Fixed is green (a resolved problem
// reads as good news); Improved is violet so the two never blur.
const pill = {
  new: "bg-blue-wash text-blue",
  improved: "bg-violet-wash text-violet",
  fixed: "bg-green-wash text-green",
} as const;

// A header button named after the workspace slug that opens the "What's new" panel
// exactly as your users will see it: published posts only, in the workspace's widget language.
export function WhatsNewPreview({ slug, name, lang, allUpdatesUrl, posts }: {
  slug: string;
  name: string;
  lang: WidgetLang;
  allUpdatesUrl: string;
  posts: Post[];
}) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const t = WIDGET_COPY[lang];
  const coming = posts.filter((p) => p.type === "coming");
  const shipped = posts.filter((p) => p.type !== "coming");

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const close = () => {
      setOpen(false);
      trigger.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !trigger.current?.contains(target)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Preview what your users see"
        className="flex items-center gap-2 border border-hairline px-3 py-2 text-sm font-medium transition-colors hover:border-ink"
      >
        <span aria-hidden="true" className="size-2 bg-blue" />
        <span className="max-w-40 truncate">/{slug}</span>
        <span className="tabular-nums text-graphite">{posts.length}</span>
      </button>

      {open && (
        <div
          ref={panel}
          role="dialog"
          aria-label={`${t.title} preview`}
          tabIndex={-1}
          className="absolute right-0 top-full z-50 mt-2 flex max-h-[min(40rem,85dvh)] w-[min(28rem,calc(100vw-2rem))] flex-col border border-hairline bg-canvas shadow-[0_16px_48px_-12px_rgb(14_17_22/0.28)] outline-none"
        >
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
            <div>
              <p className="font-display text-xl font-medium tracking-tight">{t.title}</p>
              <p className="mt-0.5 text-sm text-graphite">{name}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
              aria-label={t.close}
              className="-mr-2 grid size-8 place-items-center text-graphite hover:text-ink"
            >
              <svg viewBox="0 0 10 10" className="size-3" aria-hidden="true">
                <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto border-t border-hairline">
            {posts.length === 0 && <p className="px-6 py-12 text-center text-[0.95rem] text-graphite">{t.empty}</p>}
            {coming.length > 0 && <Section label={t.tags.coming} coming posts={coming} lang={lang} allUpdatesUrl={allUpdatesUrl} />}
            {shipped.length > 0 && <Section label={t.latest} posts={shipped} lang={lang} allUpdatesUrl={allUpdatesUrl} />}
          </div>

          <div className="border-t border-hairline p-3">
            <a
              href={allUpdatesUrl}
              className="block bg-wash px-4 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:bg-blue hover:text-canvas"
            >
              {t.all} →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, posts, coming = false, lang, allUpdatesUrl }: {
  label: string;
  posts: Post[];
  coming?: boolean;
  lang: WidgetLang;
  allUpdatesUrl: string;
}) {
  const t = WIDGET_COPY[lang];
  return (
    <section>
      <h3 className="sticky top-0 z-10 border-b border-hairline bg-canvas/95 px-6 pt-4 pb-2 text-xs font-medium tracking-wide text-graphite uppercase backdrop-blur">
        {label}
      </h3>
      <ol className="divide-y divide-hairline">
        {posts.map((post) => (
          <li key={post.id} className="px-6 py-5">
            <p className="flex flex-wrap items-center gap-2 text-[0.8125rem]">
              <span className={`px-2 py-0.5 font-medium ${pill[post.category]}`}>{t.tags[post.category]}</span>
              {coming && (
                <span className="border border-dashed border-graphite/60 px-2 py-0.5 font-medium text-ink">
                  {t.tags.coming}
                </span>
              )}
              {post.publishedOn && (
                <time dateTime={post.publishedOn} className="ml-auto tabular-nums text-graphite">
                  {formatDay(post.publishedOn, lang)}
                </time>
              )}
            </p>
            <p className="mt-2.5 text-[1.0625rem] font-semibold leading-snug text-ink">{post.title}</p>
            {/* Plain text until #7's renderMarkdown lands. */}
            {post.body && (
              <>
                <p className="mt-1.5 line-clamp-4 text-[0.9375rem] leading-relaxed whitespace-pre-line text-ink/75">
                  {post.body}
                </p>
                <a href={allUpdatesUrl} className="mt-1.5 inline-block text-sm font-medium text-blue hover:underline">
                  {t.more}
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function formatDay(day: string, lang: WidgetLang) {
  return new Intl.DateTimeFormat(lang, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${day}T00:00:00Z`),
  );
}
