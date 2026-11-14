import { asc, eq, sql } from "drizzle-orm";
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

// The signed-in user's account (#65), or null before onboarding. Cached per request.
export const getCurrentAccount = cache(async () => {
  const user = await requireUser();
  const [account] = await getDb().select().from(accounts).where(eq(accounts.userId, user.id)).limit(1);
  return account ?? null;
});

// The user's account, created the first time it's needed (onboarding, checkout).
export async function ensureAccount(userId: string) {
  const db = getDb();
  await db.insert(accounts).values({ userId }).onConflictDoNothing({ target: accounts.userId });
  const [account] = await db.select().from(accounts).where(eq(accounts.userId, userId)).limit(1);
  return account;
}

// The user's projects, oldest first, each with its rank (1 is the oldest) and the account's
// status: what canPublish needs. Cached per request.
export const listWorkspaces = cache(async () => {
  const user = await requireUser();
  const [rows, account] = await Promise.all([
    getDb()
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerId, user.id))
      .orderBy(asc(workspaces.createdAt), asc(workspaces.id)),
    getCurrentAccount(),
  ]);
  const subscriptionStatus = account?.subscriptionStatus ?? "none";
  return rows.map((workspace, i) => ({ ...workspace, rank: i + 1, subscriptionStatus }));
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

// A project's rank among its account's projects, in SQL: 1 plus how many are older.
// The same order as listWorkspaces (created_at, then id).
const rank = sql<number>`(select count(*)::int + 1 from ${workspaces} as older
  where older.owner_id = ${workspaces.ownerId}
  and (older.created_at, older.id) < (${workspaces.createdAt}, ${workspaces.id}))`;

// The account's status, `none` without an account row (left join).
const status = sql<SubscriptionStatus>`coalesce(${accounts.subscriptionStatus}, 'none')`;

// projectLimit in SQL, built from PLANS and PRO_STATUSES; a test keeps it aligned with canPublish.
export const publishesSql = sql`${rank} <= case when ${status} in ${PRO_STATUSES} then ${PLANS.pro.projects} else ${PLANS.free.projects} end`;

// What canPublish needs, read with a left join on the account: the public page and the widget
// use it without a session.
const publishing = { subscriptionStatus: status, rank };

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
