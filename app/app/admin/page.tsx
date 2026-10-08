import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin, requireAdmin } from "@/lib/auth/roles";
import { getUser } from "@/lib/auth/server";
import { FEEDBACK_KINDS, FEEDBACK_LABELS } from "@/lib/feedback/form";
import { listFeedback } from "@/lib/feedback/server";

// The title only names the page for admins; anyone else gets the 404's, so nothing hints it exists.
export async function generateMetadata(): Promise<Metadata> {
  const user = await getUser();
  return user && (await isAdmin(user.id)) ? { title: "Admin — UseChangelog" } : { title: "Page not found — UseChangelog" };
}

const dateTime = (date: Date) =>
  date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

// What users send us from the app (#28), newest first. Admins only: anyone else gets a 404.
export default async function AdminPage({ searchParams }: PageProps<"/app/admin">) {
  await requireAdmin();
  const raw = (await searchParams).kind;
  // Unknown or missing: every kind.
  const kind = FEEDBACK_KINDS.find((k) => k === raw);
  const items = await listFeedback({ kind });
  const filters = [undefined, ...FEEDBACK_KINDS].map((k) => ({
    href: k ? `/app/admin?kind=${k}` : "/app/admin",
    label: k ? FEEDBACK_LABELS[k] : "All",
    current: kind === k,
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Feedback</h1>
        <p className="mt-2 text-sm text-graphite">What users send from the app, newest first. Answer them by email.</p>
      </div>

      <nav aria-label="Filter by kind" className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            aria-current={f.current ? "page" : undefined}
            className="border border-hairline px-3 py-1 text-sm text-graphite hover:text-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-canvas"
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="border border-dashed border-hairline bg-canvas px-6 py-12 text-center text-graphite">
          No feedback{kind ? ` of this kind` : ""} yet.
        </p>
      ) : (
        <ul className="divide-y divide-hairline border border-hairline bg-canvas">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-graphite">
                <span className="border border-hairline px-1.5 py-0.5 text-xs font-medium uppercase tracking-wider text-ink">
                  {FEEDBACK_LABELS[item.kind]}
                </span>
                <a href={`mailto:${item.email}`} className="text-blue underline underline-offset-4 [overflow-wrap:anywhere]">
                  {item.email}
                </a>
                <span>{item.workspace ? `/${item.workspace}` : "no workspace yet"}</span>
                <span className="font-mono text-xs">{item.page}</span>
                <time dateTime={item.createdAt.toISOString()} className="tabular-nums sm:ml-auto">
                  {dateTime(item.createdAt)} UTC
                </time>
              </div>
              <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{item.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
