import { dateTime, postsLabel, subscriptionLabel } from "@/lib/admin/format";
import { listUsers, USERS_LIMIT, userCounts } from "@/lib/admin/server";
import { adminMetadata, requireAdmin } from "@/lib/auth/roles";
import { AdminNav } from "../admin-nav";

export const generateMetadata = () => adminMetadata("Users");

function When({ date }: { date: Date }) {
  return (
    <time dateTime={date.toISOString()} className="tabular-nums">
      {dateTime(date)} UTC
    </time>
  );
}

// Who signed up and how far they got (#57), newest first. Admins only: anyone else gets a 404.
// Read here, on the server: no route or action returns this list.
export default async function AdminUsersPage() {
  await requireAdmin();
  const [users, [counts]] = await Promise.all([listUsers(), userCounts()]);
  const totals = [
    { label: "Users", value: counts.total },
    { label: "With a project", value: counts.withProject },
    { label: "Active", value: counts.active, note: `${counts.trialing} on trial` },
    { label: "Past due", value: counts.pastDue },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <AdminNav current="/app/admin/users" />
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Users</h1>
        <p className="mt-2 text-sm text-graphite">
          Everyone who signed up, newest first. Subscriptions as the Polar webhook stored them.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
        {totals.map((t) => (
          <div key={t.label} className="flex flex-col gap-1 bg-canvas px-5 py-4">
            <dt className="text-xs font-medium uppercase tracking-wider text-graphite">{t.label}</dt>
            <dd className="font-display text-2xl tabular-nums">
              {t.value}
              {t.note && <span className="ml-2 font-sans text-sm text-graphite">{t.note}</span>}
            </dd>
          </div>
        ))}
      </dl>

      {counts.total > USERS_LIMIT && (
        <p className="text-sm text-graphite">
          Showing the newest {USERS_LIMIT} of {counts.total}.
        </p>
      )}

      {users.length === 0 ? (
        <p className="border border-dashed border-hairline bg-canvas px-6 py-12 text-center text-graphite">No users yet.</p>
      ) : (
        <ul className="divide-y divide-hairline border border-hairline bg-canvas">
          {users.map((u) => (
            <li key={u.id} className="flex flex-col gap-2 px-5 py-5 sm:px-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <a href={`mailto:${u.email}`} className="text-blue underline underline-offset-4 [overflow-wrap:anywhere]">
                  {u.email}
                </a>
                {u.projects.length ? (
                  u.projects.map((slug) => (
                    <a key={slug} href={`/${slug}`} target="_blank" rel="noopener" className="text-sm underline underline-offset-4">
                      /{slug}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-graphite">No project yet</span>
                )}
                <span className="border border-hairline px-1.5 py-0.5 text-xs font-medium text-ink sm:ml-auto">
                  {u.account ? subscriptionLabel(u.account) : "none"}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-graphite">
                <span>
                  Signed up <When date={u.createdAt} />
                </span>
                <span>Last sign-in {u.lastSignInAt ? <When date={u.lastSignInAt} /> : "no session on record"}</span>
                {u.projects.length > 0 && <span>{postsLabel(u.posts, u.published)}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
