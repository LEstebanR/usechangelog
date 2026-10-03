import Link from "next/link";
import { brand } from "./content";

// The landing's logo without its load animation, for the app and auth pages.
export function Wordmark() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 font-display text-lg font-medium tracking-tight"
    >
      <span aria-hidden="true" className="grid size-4 grid-cols-2 gap-px">
        <span className="bg-blue" />
        <span className="bg-blue-soft" />
        <span className="bg-blue-soft" />
        <span className="bg-blue-soft" />
      </span>
      <span translate="no">{brand}</span>
    </Link>
  );
}
