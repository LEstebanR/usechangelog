"use client";

import { useState } from "react";
import type { Post } from "./content";
import { Tag } from "./tag";

// Cycles through sample posts like a live "What's new" feed. The progress bar's
// animation drives the timing, so pausing it (hover, focus, button, reduced
// motion) also pauses the rotation.
export function Latest({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const post = posts[index];
  const stopped = paused || held;

  return (
    <div
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2.5 font-display text-sm font-medium text-blue">
          <span aria-hidden="true" className="size-2 bg-blue" />
          Latest from Acme
        </p>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play latest updates" : "Pause latest updates"}
          className="grid size-6 place-items-center text-graphite hover:text-ink"
        >
          {paused ? (
            <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
              <path d="M2 1l7 4-7 4z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
              <path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>

      <div className="mt-3 h-[4.75rem] overflow-hidden">
        <div key={index} className="motion-swap">
          <div className="flex items-center gap-2.5 text-sm text-graphite">
            <Tag tag={post.tag} />
            <span className="tabular-nums">{post.date}</span>
          </div>
          <p className="mt-2 font-display text-lg font-medium leading-snug text-ink">
            {post.title}
          </p>
        </div>
      </div>

      <div className="h-px bg-hairline" aria-hidden="true">
        <div
          key={index}
          onAnimationEnd={() => setIndex((i) => (i + 1) % posts.length)}
          className="motion-progress h-px origin-left bg-blue"
          style={{ animationPlayState: stopped ? "paused" : "running" }}
        />
      </div>
    </div>
  );
}
