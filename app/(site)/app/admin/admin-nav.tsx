import Link from "next/link";

const PAGES = [
  { href: "/app/admin", label: "Feedback" },
  { href: "/app/admin/users", label: "Users" },
] as const;

// The admin pages (#57). Each page says which one it is, so this stays a server component.
export function AdminNav({ current }: { current: (typeof PAGES)[number]["href"] }) {
  return (
    <nav aria-label="Admin" className="flex items-center gap-2 text-sm">
      {PAGES.map(({ href, label }, i) => (
        <span key={href} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true" className="text-graphite">·</span>}
          <Link
            href={href}
            aria-current={href === current ? "page" : undefined}
            className="text-graphite hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink"
          >
            {label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
