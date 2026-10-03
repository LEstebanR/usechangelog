"use client";

import { useState } from "react";
import type { Post } from "./content";
import { SectionLabel } from "./section-label";
import { Tag } from "./tag";

// Cycles through sample posts like a live "What's new" feed. The progress bar's
// animation drives the timing, so pausing it (button here; hover and reduced
// motion in CSS) also pauses the rotation.
export function Latest({ label, posts }: { label: string; posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <SectionLabel marker="filled">{label}</SectionLabel>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play latest updates" : "Pause latest updates"}
          className="grid size-6 place-items-center text-graphite hover:text-ink motion-reduce:hidden"
        >
          <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
            <path
              d={paused ? "M2 1l7 4-7 4z" : "M2 1h2v8H2zM6 1h2v8H6z"}
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className="latest-posts">
        {/* All posts share one grid cell, so the box fits the tallest one. */}
        <div className="mt-3 grid pb-4">
          {posts.map((post, i) => {
            const active = i === index;
            return (
              <div
                key={post.title}
                aria-hidden={!active}
                className={`[grid-area:1/1] ${active ? "motion-swap" : "invisible"}`}
              >
                <div className="flex items-center gap-2.5 text-sm text-graphite">
                  <Tag tag={post.tag} />
                  <span className="tabular-nums">{post.date}</span>
                </div>
                <p className="mt-2 font-display text-lg font-medium leading-snug text-ink">
                  {post.title}
                </p>
              </div>
            );
          })}
        </div>

        <div className="h-px bg-hairline" aria-hidden="true">
          <div
            key={index}
            onAnimationEnd={() => setIndex((i) => (i + 1) % posts.length)}
            data-paused={paused || undefined}
            className="motion-progress h-px origin-left bg-blue"
          />
        </div>
      </div>
    </div>
  );
}
