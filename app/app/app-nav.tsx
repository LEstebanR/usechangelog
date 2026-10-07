"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/app", label: "Posts" },
  { href: "/app/settings", label: "Settings" },
  { href: "/app/billing", label: "Billing" },
] as const;

// The app's sections. Client only to mark the current tab; Posts covers the post pages too.
export function AppNav() {
  const pathname = usePathname();
  const current = (href: string) =>
    href === "/app" ? pathname === "/app" || pathname.startsWith("/app/posts") : pathname.startsWith(href);

  return (
    <nav aria-label="App" className="border-b border-hairline bg-canvas">
      <ul className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6">
        {TABS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={current(href) ? "page" : undefined}
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
