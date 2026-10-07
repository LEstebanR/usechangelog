"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Each tab and the sections that mark it current, besides its own page. Posts is /app
// itself plus the post pages, never all of /app.
const TABS = [
  { href: "/app", label: "Posts", match: ["/app/posts"] },
  { href: "/app/settings", label: "Settings", match: ["/app/settings"] },
  { href: "/app/billing", label: "Billing", match: ["/app/billing"] },
];

const under = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`);

// The app's sections. Client only to mark the current tab.
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="App" className="border-b border-hairline bg-canvas">
      <ul className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6">
        {TABS.map(({ href, label, match }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={pathname === href || match.some((path) => under(pathname, path)) ? "page" : undefined}
              className="-mb-px block border-b-2 border-transparent py-3 text-sm font-medium text-graphite transition-colors hover:text-ink aria-[current=page]:border-blue aria-[current=page]:text-ink"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
