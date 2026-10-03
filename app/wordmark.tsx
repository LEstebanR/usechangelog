import type { CSSProperties } from "react";
import { brand } from "./content";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

// The brand mark. `animated` lights the squares up in sequence on the landing.
export function Wordmark({ href = "/", animated = false }: { href?: string; animated?: boolean }) {
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
      <span translate="no">{brand}</span>
    </a>
  );
}

// The top bar of the app and auth pages.
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-(--header-h) max-w-6xl items-center justify-between gap-6 px-6">
        <Wordmark />
        {children}
      </div>
    </header>
  );
}
