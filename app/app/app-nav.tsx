"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeedbackButton } from "./feedback";

// Each tab and the sections that mark it current, besides its own page. Posts is /app
// itself plus the post pages, never all of /app.
const TABS = [
  { href: "/app", label: "Posts", match: ["/app/posts"] },
  { href: "/app/settings", label: "Settings", match: ["/app/settings"] },
  { href: "/app/billing", label: "Billing", match: ["/app/billing"] },
];

const under = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`);

const ADMIN_TAB = { href: "/app/admin", label: "Admin", match: ["/app/admin"] };

// The app's sections, and Feedback on the right (#28). Client only to mark the current tab.
// Before onboarding there are no tabs yet, but Feedback is still there. The Admin tab is
// display only; /app/admin checks the role itself.
export function AppNav({ tabs, admin }: { tabs: boolean; admin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="App" className="border-b border-hairline bg-canvas">
      <ul className="mx-auto flex max-w-6xl items-center gap-6 overflow-x-auto px-6">
        {[...(tabs ? TABS : []), ...(admin ? [ADMIN_TAB] : [])].map(({ href, label, match }) => (
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
        <li className="ml-auto">
          <FeedbackButton />
        </li>
      </ul>
    </nav>
  );
}
