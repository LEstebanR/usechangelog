import { and, count, desc, eq, isNotNull, type SQL, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { session, user } from "@/db/neon-auth";
import { accounts, posts, workspaces } from "@/db/schema";

const countWhere = (condition: SQL | undefined) => sql<number>`count(*) filter (where ${condition})`.mapWith(Number);

export const USERS_LIMIT = 200;

// Everyone who signed up, newest first, with how far they got (#57): their projects
// (onboarding), the account's subscription as the webhook stored it (#65), posts across all
// their projects, and the latest sign-in still on record. Returns the query, which runs when awaited.
export function listUsers({ limit = USERS_LIMIT }: { limit?: number } = {}) {
  return getDb()
    .select({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      lastSignInAt: sql<Date | null>`(select max(${session.createdAt}) from ${session} where ${session.userId} = ${user.id})`.mapWith(
        session.createdAt,
      ),
      // Oldest first, like the publishing order; empty until onboarding.
      projects: sql<string[]>`array(select ${workspaces.slug} from ${workspaces} where ${workspaces.ownerId} = ${user.id} order by ${workspaces.createdAt}, ${workspaces.id})`,
      // Null without an account row: Free, no subscription.
      account: {
        subscriptionStatus: accounts.subscriptionStatus,
        trialEndsAt: accounts.trialEndsAt,
        cancelAtPeriodEnd: accounts.cancelAtPeriodEnd,
        currentPeriodEnd: accounts.currentPeriodEnd,
      },
      posts: count(posts.id),
      published: countWhere(eq(posts.status, "published")),
    })
    .from(user)
    .leftJoin(accounts, eq(accounts.userId, user.id))
    .leftJoin(workspaces, eq(workspaces.ownerId, user.id))
    .leftJoin(posts, eq(posts.workspaceId, workspaces.id))
    .groupBy(user.id, accounts.id)
    .orderBy(desc(user.createdAt))
    .limit(limit);
}

// The totals above the list (#57). A trial is stored as `active`, so it counts there too.
export function userCounts() {
  return getDb()
    .select({
      total: count(),
      withProject: countWhere(sql`exists (select 1 from ${workspaces} where ${workspaces.ownerId} = ${user.id})`),
      active: countWhere(eq(accounts.subscriptionStatus, "active")),
      trialing: countWhere(and(eq(accounts.subscriptionStatus, "active"), isNotNull(accounts.trialEndsAt))),
      pastDue: countWhere(eq(accounts.subscriptionStatus, "past_due")),
    })
    .from(user)
    .leftJoin(accounts, eq(accounts.userId, user.id));
}
