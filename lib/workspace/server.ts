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

// A workspace by its public slug, for the public page (#7). No session needed.
export async function getWorkspaceBySlug(slug: string) {
  const [workspace] = await getDb()
    .select({ id: workspaces.id, name: workspaces.name })
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);
  return workspace ?? null;
}

// A workspace by its widget key, for the widget (#8). No session needed.
export async function getWorkspaceByWidgetKey(key: string) {
  const [workspace] = await getDb()
    .select({ id: workspaces.id, name: workspaces.name, slug: workspaces.slug, widgetLang: workspaces.widgetLang })
    .from(workspaces)
    .where(eq(workspaces.widgetKey, key))
    .limit(1);
  return workspace ?? null;
}
