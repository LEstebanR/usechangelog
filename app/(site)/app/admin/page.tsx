import Link from "next/link";
import { dateTime } from "@/lib/admin/format";
import { adminMetadata, requireAdmin } from "@/lib/auth/roles";
import { setStatus } from "@/lib/feedback/actions";
import {
  adminHref,
  FEEDBACK_KINDS,
  FEEDBACK_LABELS,
  FEEDBACK_STATUSES,
  parseAdminFilters,
  STATUS_FILTER_LABELS,
  STATUS_NAMES,
} from "@/lib/feedback/form";
import { listFeedback, openCounts } from "@/lib/feedback/server";
import { AdminNav } from "./admin-nav";

export const generateMetadata = () => adminMetadata("Admin");

// What users send us from the app (#28), newest first, open by default (#75). Admins only:
// anyone else gets a 404.
export default async function AdminPage({ searchParams }: PageProps<"/app/admin">) {
  await requireAdmin();
  const { kind, status } = parseAdminFilters(await searchParams);
  const [items, counts] = await Promise.all([listFeedback({ kind, status }), openCounts()]);
  const open = Object.fromEntries(counts.map((c) => [c.kind, c.open]));
  const totalOpen = counts.reduce((sum, c) => sum + c.open, 0);

  const kindFilters = [undefined, ...FEEDBACK_KINDS].map((k) => ({
    href: adminHref(k, status),
    label: k ? FEEDBACK_LABELS[k] : "All",
    open: k ? (open[k] ?? 0) : totalOpen,
    current: kind === k,
  }));
  const statusFilters = [...FEEDBACK_STATUSES, undefined].map((s) => ({
    href: adminHref(kind, s),
    label: s ? STATUS_FILTER_LABELS[s] : "All",
    current: status === s,
  }));

  return (
    // As wide as /app/admin/users, so switching pages doesn't shift the nav.
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <AdminNav current="/app/admin" />
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Feedback</h1>
        <p className="mt-2 text-sm text-graphite">
          What users send from the app, newest first. Answer them by email. The counts are open messages.
        </p>
      </div>

      {/* One toolbar: the kind as tabs, like the app's nav, with each kind's open count, and
          the status as a segmented control on the right. On a phone the status drops below. */}
      <div className="flex flex-col gap-3 border-b border-hairline sm:flex-row sm:items-end sm:justify-between">
        <nav aria-label="Filter by kind" className="-mb-px overflow-x-auto">
          <ul className="flex gap-6">
            {kindFilters.map((f) => (
              <li key={f.href}>
                <Link
                  href={f.href}
                  aria-current={f.current ? "page" : undefined}
                  className="group flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent py-3 text-sm font-medium text-graphite transition-colors hover:text-ink aria-[current=page]:border-blue aria-[current=page]:text-ink"
                >
                  {f.label}
                  <span className="border border-hairline px-1.5 text-xs tabular-nums text-graphite group-aria-[current=page]:border-ink group-aria-[current=page]:text-ink">
                    {f.open}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Filter by status" className="mb-3 flex self-start border border-hairline sm:self-auto">
          {statusFilters.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              aria-current={f.current ? "page" : undefined}
              className="border-l border-hairline px-3 py-1 text-sm text-graphite transition-colors first:border-l-0 hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-canvas"
            >
              {f.label}
            </Link>
          ))}
        </nav>
      </div>

      {items.length === 0 ? (
        <p className="border border-dashed border-hairline bg-canvas px-6 py-12 text-center text-graphite">
          No {status ? `${STATUS_FILTER_LABELS[status].toLowerCase()} ` : ""}feedback{kind ? " of this kind" : ""}.
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
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                <span className={item.status === "open" ? "font-medium text-ink" : "text-graphite"}>
                  {STATUS_NAMES[item.kind][item.status].label}
                  {item.resolvedAt && (
                    <>
                      {" · "}
                      <time dateTime={item.resolvedAt.toISOString()} className="tabular-nums">
                        {dateTime(item.resolvedAt)} UTC
                      </time>
                    </>
                  )}
                </span>
                <form action={setStatus} className="flex flex-wrap gap-1.5 sm:ml-auto">
                  <input type="hidden" name="id" value={item.id} />
                  {FEEDBACK_STATUSES.filter((s) => s !== item.status).map((s) => (
                    <button
                      key={s}
                      type="submit"
                      name="status"
                      value={s}
                      className="border border-hairline px-3 py-1 text-graphite hover:border-ink hover:text-ink"
                    >
                      {STATUS_NAMES[item.kind][s].action}
                    </button>
                  ))}
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
