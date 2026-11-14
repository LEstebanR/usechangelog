// The palette of app/globals.css as hex, for places that can't read Tailwind classes (the
// share image, drawn by Satori). colors.test.ts fails if a value drifts from globals.css.
export const COLORS = {
  canvas: "#ffffff",
  ink: "#0e1116",
  graphite: "#5a6170",
  hairline: "#e4e7ec",
  gridline: "#f0f2f5",
  blue: "#1d3a8f",
  green: "#17694a",
  "green-wash": "#eaf5ef",
  violet: "#5b3fa8",
  "violet-wash": "#f1edfa",
} as const;

// The tag styles of tag.tsx (TAG_PALETTE) in those colors. "/40" there is 40% opacity: hex 66.
export const TAG_COLORS = {
  new: { color: COLORS.canvas, background: COLORS.blue, border: `1px solid ${COLORS.blue}` },
  improved: { color: COLORS.violet, background: COLORS["violet-wash"], border: `1px solid ${COLORS.violet}66` },
  fixed: { color: COLORS.green, background: COLORS["green-wash"], border: `1px solid ${COLORS.green}66` },
  coming: { color: COLORS.graphite, background: "transparent", border: `1px dashed ${COLORS.graphite}` },
} as const;
