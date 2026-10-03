"use client";

import { useEffect, useRef, useState } from "react";
import type { Category, PostType } from "@/lib/posts/form";
import type { WidgetLang } from "@/lib/workspace/form";
import { Tag } from "../tag";

type Post = { id: string; title: string; body: string; category: Category; type: PostType; publishedOn: string };

// The widget's own words (#8), in the language chosen in settings. Posts are never translated.
const copy = {
  en: { title: "What's new", all: "View all updates", close: "Close", empty: "No published updates yet.",
        tags: { new: "New", improved: "Improved", fixed: "Fixed", coming: "Coming soon" } },
  es: { title: "Novedades", all: "Ver todas", close: "Cerrar", empty: "Todavía no hay novedades publicadas.",
        tags: { new: "Nuevo", improved: "Mejorado", fixed: "Corregido", coming: "Próximamente" } },
} as const;

const tagName = { new: "New", improved: "Improved", fixed: "Fixed" } as const;

// A header button named after the workspace slug that opens the "What's new" panel
// exactly as your users will see it: published posts only, in the workspace's widget language.
export function WhatsNewPreview({ slug, lang, allUpdatesUrl, posts }: { slug: string; lang: WidgetLang; allUpdatesUrl: string; posts: Post[] }) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const t = copy[lang];
  const formatDay = (day: string) =>
    new Intl.DateTimeFormat(lang, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
      .format(new Date(`${day}T00:00:00Z`));

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
          className="absolute right-0 top-full z-50 mt-2 flex max-h-[min(32rem,80dvh)] w-[min(23rem,calc(100vw-2rem))] flex-col border border-hairline bg-canvas shadow-[0_12px_40px_-12px_rgb(14_17_22/0.25)] outline-none"
        >
          <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-3.5">
            <p className="font-display text-base font-medium">{t.title}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  trigger.current?.focus();
                }}
                aria-label={t.close}
                className="ml-1 grid size-7 place-items-center text-graphite hover:text-ink"
              >
                <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
                  <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>

          <ol className="flex-1 divide-y divide-hairline overflow-y-auto">
            {posts.length === 0 && <li className="px-5 py-8 text-center text-sm text-graphite">{t.empty}</li>}
            {posts.map((post) => (
              <li key={post.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-graphite">
                  <Tag tag={tagName[post.category]} label={t.tags[post.category]} />
                  {post.type === "coming" && <Tag tag="Coming soon" label={t.tags.coming} />}
                  {post.publishedOn && <span className="ml-1 tabular-nums">{formatDay(post.publishedOn)}</span>}
                </div>
                <p className="mt-2 font-display font-medium leading-snug">{post.title}</p>
                {/* Plain text until #7's renderMarkdown lands. */}
                {post.body && <p className="mt-1.5 line-clamp-6 text-sm whitespace-pre-line text-graphite">{post.body}</p>}
              </li>
            ))}
          </ol>

          <a href={allUpdatesUrl} className="border-t border-hairline px-5 py-3 text-sm font-medium text-blue hover:underline">
            {t.all} →
          </a>
        </div>
      )}
    </div>
  );
}
