import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb } from "@/db";
import { workspaces } from "@/db/schema";
import { requireUser } from "@/lib/auth/server";

// The signed-in user's workspace, or null. Cached per request. Used by #6, #14 and #17.
export const getCurrentWorkspace = cache(async () => {
  const user = await requireUser();
  const [workspace] = await getDb()
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerId, user.id))
    .limit(1);
  return workspace ?? null;
});

// For pages that need a workspace: without one, the user goes to onboarding.
export async function requireWorkspace() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/app/onboarding");
  return workspace;
}

// The unique constraint a failed write hit, if any. Drizzle wraps the Postgres error in `cause`.
export function violatedUniqueConstraint(error: unknown): string | undefined {
  const pg = (error as { cause?: { code?: string; constraint?: string } })?.cause;
  return pg?.code === "23505" ? pg.constraint : undefined;
}
