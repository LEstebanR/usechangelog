import { and, count, desc, eq, isNotNull, type SQL, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { session, user } from "@/db/neon-auth";
import { posts, workspaces } from "@/db/schema";

const countWhere = (condition: SQL | undefined) => sql<number>`count(*) filter (where ${condition})`.mapWith(Number);

// Everyone who signed up, newest first, with how far they got (#57): workspace (onboarding),
// subscription as the webhook stored it, posts, and the latest sign-in still on record.
// One user owns at most one workspace. Returns the query, which runs when awaited.
export function listUsers({ limit = 200 }: { limit?: number } = {}) {
  return getDb()
    .select({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      lastSignInAt: sql<Date | null>`(select max(${session.createdAt}) from ${session} where ${session.userId} = ${user.id})`.mapWith(
        session.createdAt,
      ),
      workspace: workspaces.slug,
      subscriptionStatus: workspaces.subscriptionStatus,
      trialEndsAt: workspaces.trialEndsAt,
      cancelAtPeriodEnd: workspaces.cancelAtPeriodEnd,
      currentPeriodEnd: workspaces.currentPeriodEnd,
      posts: count(posts.id),
      published: countWhere(eq(posts.status, "published")),
    })
    .from(user)
    .leftJoin(workspaces, eq(workspaces.ownerId, user.id))
    .leftJoin(posts, eq(posts.workspaceId, workspaces.id))
    .groupBy(user.id, workspaces.id)
    .orderBy(desc(user.createdAt))
    .limit(limit);
}

// The totals above the list (#57). A trial is stored as `active`, so it counts there too.
export function userCounts() {
  return getDb()
    .select({
      total: count(),
      withWorkspace: count(workspaces.id),
      active: countWhere(eq(workspaces.subscriptionStatus, "active")),
      trialing: countWhere(and(eq(workspaces.subscriptionStatus, "active"), isNotNull(workspaces.trialEndsAt))),
      pastDue: countWhere(eq(workspaces.subscriptionStatus, "past_due")),
    })
    .from(user)
    .leftJoin(workspaces, eq(workspaces.ownerId, user.id));
}
