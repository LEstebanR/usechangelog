import type { CSSProperties } from "react";

const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as CSSProperties;

// The faint 12-column grid behind the landing hero and the 404, drawn in on load.
export function Grid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {/* Below md the grid sits in the gutter so text never starts on a line. */}
      <div className="mx-auto h-full w-full max-w-6xl px-2 md:px-8">
        <div className="grid h-full grid-cols-4 border-r border-gridline md:grid-cols-12 max-md:[&>:nth-child(n+5)]:hidden">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              style={delay(i === 0 ? 0 : 200 + i * 45)}
              className="motion-draw border-l border-gridline"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
