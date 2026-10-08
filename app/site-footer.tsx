import Link from "next/link";
import { brand, legal } from "./content";
import { container } from "./layout-styles";

// The footer of the landing, the public page and the legal pages: the brand, Privacy · Terms
// (#18), and whatever the page adds after them (the landing's copyright and credit).
// `prefix` reads before the brand, e.g. "Powered by" under a workspace's changelog.
export function SiteFooter({ prefix, children }: { prefix?: string; children?: React.ReactNode }) {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div
        className={`${container} flex flex-col gap-2 py-8 text-sm text-graphite sm:flex-row sm:items-center sm:justify-between`}
      >
        <Link href="/" className="hover:text-ink">
          {prefix && `${prefix} `}
          <span translate="no" className="font-display font-medium text-ink">
            {brand}
          </span>
        </Link>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {legal.links.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-ink">
              {label}
            </Link>
          ))}
          {children}
        </span>
      </div>
    </footer>
  );
}
