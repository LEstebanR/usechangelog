// Section labels carry a small square from the brand mark: filled for the live
// hero feed, outlined for sections, dashed for what's next.
const markers = {
  filled: "bg-blue",
  outline: "border border-blue bg-canvas",
  dashed: "border border-dashed border-blue bg-canvas",
};

export function SectionLabel({
  marker = "outline",
  children,
  className = "",
}: {
  marker?: keyof typeof markers;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-2.5 font-display text-sm font-medium text-blue ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 shrink-0 ${markers[marker]}`}
      />
      {children}
    </p>
  );
}
