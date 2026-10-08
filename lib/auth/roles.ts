import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { userRoles } from "@/db/schema";
import { requireUser } from "./server";

// Our staff role (#28), stored in user_roles; customers never have one. The query is
// returned unrun, so its rule is tested from its SQL.
export const adminRoleQuery = (userId: string) =>
  getDb()
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.role, "admin")))
    .limit(1);

// Cached per request: the layout (for the Admin tab) and the page both ask.
export const isAdmin = cache(async (userId: string) => (await adminRoleQuery(userId)).length > 0);

// For every admin page and action. Anyone else gets a 404, so the page doesn't even show
// it exists. The layout's tab is display only; this is the check that counts.
export async function requireAdmin() {
  const user = await requireUser();
  if (!(await isAdmin(user.id))) notFound();
  return user;
}
