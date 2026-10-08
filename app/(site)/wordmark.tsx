import type { CSSProperties } from "react";
import { brand } from "./content";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

// The brand mark. `animated` lights the squares up in sequence on the landing.
// `compact` keeps only the mark on phones (the name stays for screen readers), for headers
// that need the room.
export function Wordmark({ href = "/", animated = false, compact = false }: { href?: string; animated?: boolean; compact?: boolean }) {
  const cell = (color: string, ms: number) => (
    <span
      style={animated ? delay(ms) : undefined}
      className={animated ? `motion-light ${color}` : color}
    />
  );

  return (
    <a
      href={href}
      className="flex items-center gap-2.5 font-display text-lg font-medium tracking-tight"
    >
      <span aria-hidden="true" className="grid size-4 grid-cols-2 gap-px">
        {cell("bg-blue", 300)}
        {cell("bg-blue-soft", 450)}
        {cell("bg-blue-soft", 600)}
        {cell("bg-blue-soft", 750)}
      </span>
      <span translate="no" className={compact ? "max-sm:sr-only" : undefined}>
        {brand}
      </span>
    </a>
  );
}

// The top bar of the app and auth pages.
export function SiteHeader({ home = "/", compact = false, children }: { home?: string; compact?: boolean; children?: React.ReactNode }) {
  return (
    <header className="border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-(--header-h) max-w-6xl items-center justify-between gap-3 px-6 sm:gap-6">
        <Wordmark href={home} compact={compact} />
        {children}
      </div>
    </header>
  );
}
