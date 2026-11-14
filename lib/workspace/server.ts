import { asc, eq, getTableColumns, type SQL, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { accounts, workspaces } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";
import { PLANS, PRO_STATUSES } from "@/lib/billing/plans";
import type { SubscriptionStatus } from "@/lib/billing/status";
import { UUID } from "@/lib/uuid";

// The project open in /app (#65), by id. A cookie and not the path, so /app's routes stay
// as they are; two tabs share it, which is why actions on a post use the post's own project.
export const PROJECT_COOKIE = "uc_project";

// A project's rank among its account's projects, in SQL: 1 plus how many are older.
// By created_at, then id. The one definition of "oldest": /app, the public page, the
// widget and the sitemap all read it.
const rank = sql<number>`(select count(*)::int + 1 from ${workspaces} as older
  where older.owner_id = ${workspaces.ownerId}
  and (older.created_at, older.id) < (${workspaces.createdAt}, ${workspaces.id}))`;

// The account's status, `none` without an account row (left join).
const status = sql<SubscriptionStatus>`coalesce(${accounts.subscriptionStatus}, 'none')`;

// projectLimit in SQL, built from PLANS and PRO_STATUSES; a test keeps it aligned with canPublish.
// The limits are cast: Postgres would type the CASE's params as text.
const limitFor = (subscriptionStatus: SQL) =>
  sql`case when ${subscriptionStatus} in ${PRO_STATUSES} then ${PLANS.pro.projects}::int else ${PLANS.free.projects}::int end`;

export const publishesSql = sql`${rank} <= ${limitFor(status)}`;

// A user's project limit and project count, for writes that must respect them under
// concurrency: run after lockProjects, in the same db.batch (one transaction).
export const projectLimitSql = (userId: string) =>
  limitFor(sql`coalesce((select ${accounts.subscriptionStatus} from ${accounts} where ${accounts.userId} = ${userId}), 'none')`);
export const projectCountSql = (userId: string) =>
  sql`(select count(*) from ${workspaces} where ${workspaces.ownerId} = ${userId})`;

// Serializes a user's project creates and deletes, so two requests can't both pass the limit,
// or both delete the second-to-last project.
export const lockProjects = (userId: string) => sql`select pg_advisory_xact_lock(hashtext(${`projects:${userId}`}))`;

// Opens a project in /app: the cookie every /app page reads. A year, like a preference.
export async function openProject(id: string) {
  (await cookies()).set(PROJECT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

// What canPublish needs, read with a left join on the account (no row means `none`).
const publishing = { subscriptionStatus: status, rank };

// The signed-in user's account (#65), or null before onboarding. Cached per request.
export const getCurrentAccount = cache(async () => {
  const user = await requireUser();
  const [account] = await getDb().select().from(accounts).where(eq(accounts.userId, user.id)).limit(1);
  return account ?? null;
});

// The user's account, created the first time it's needed (onboarding, checkout).
// One statement: the no-op update makes `returning` give back an existing row too.
export async function ensureAccount(userId: string) {
  const [account] = await getDb()
    .insert(accounts)
    .values({ userId })
    .onConflictDoUpdate({ target: accounts.userId, set: { userId: sql`excluded.user_id` } })
    .returning();
  return account;
}

// The user's projects, oldest first, each with its rank (1 is the oldest) and the account's
// status: what canPublish needs. Cached per request.
export const listWorkspaces = cache(async () => {
  const user = await requireUser();
  return getDb()
    .select({ ...getTableColumns(workspaces), ...publishing })
    .from(workspaces)
    .leftJoin(accounts, eq(accounts.userId, workspaces.ownerId))
    .where(eq(workspaces.ownerId, user.id))
    .orderBy(asc(workspaces.createdAt), asc(workspaces.id));
});

export type Workspace = Awaited<ReturnType<typeof listWorkspaces>>[number];

// The project open in /app: the cookie's, if it's still the user's, else the oldest. Null
// before onboarding. Cached per request.
export const getCurrentWorkspace = cache(async () => {
  const [projects, store] = await Promise.all([listWorkspaces(), cookies()]);
  const chosen = store.get(PROJECT_COOKIE)?.value;
  return projects.find((p) => p.id === chosen) ?? projects[0] ?? null;
});

// For pages that need a workspace: without one, the user goes to onboarding.
export async function requireWorkspace() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/app/onboarding");
  return workspace;
}

// One of the user's projects by id, whatever the cookie says. Anything else is a 404.
export async function requireOwnWorkspace(id: string) {
  const workspace = UUID.test(id) ? (await listWorkspaces()).find((p) => p.id === id) : undefined;
  if (!workspace) notFound();
  return workspace;
}

// A workspace by its public slug, for the public page (#7).
// Cached per request: the page and its metadata both read it.
export const getWorkspaceBySlug = cache(async (slug: string) => {
  const [workspace] = await getDb()
    .select({ id: workspaces.id, name: workspaces.name, widgetLang: workspaces.widgetLang, ...publishing })
    .from(workspaces)
    .leftJoin(accounts, eq(accounts.userId, workspaces.ownerId))
    .where(eq(workspaces.slug, slug))
    .limit(1);
  return workspace ?? null;
});

// A workspace by its widget key, for the widget (#8).
export async function getWorkspaceByWidgetKey(key: string) {
  const [workspace] = await getDb()
    .select({
      id: workspaces.id,
      name: workspaces.name,
      slug: workspaces.slug,
      widgetLang: workspaces.widgetLang,
      widgetEnabled: workspaces.widgetEnabled,
      ...publishing,
    })
    .from(workspaces)
    .leftJoin(accounts, eq(accounts.userId, workspaces.ownerId))
    .where(eq(workspaces.widgetKey, key))
    .limit(1);
  return workspace ?? null;
}
