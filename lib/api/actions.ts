"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { apiKeys } from "@/db/schema";
import { requireOwnWorkspace } from "@/lib/workspace/server";
import { newApiKey } from "./keys";

// What the key form shows after creating or rotating: the key, this once.
export type ApiKeyState = { key?: string };

// Creates the project's API key, or rotates it: the old one stops working at once (#86).
// Bound to the project's id from the page, never the cookie (#65). The form's previous state
// and fields aren't read: useActionState passes them.
export async function createApiKey(workspaceId: string): Promise<ApiKeyState> {
  const workspace = await requireOwnWorkspace(workspaceId);
  const { key, hash, prefix } = newApiKey();
  await getDb()
    .insert(apiKeys)
    .values({ workspaceId: workspace.id, hash, prefix })
    .onConflictDoUpdate({
      target: apiKeys.workspaceId,
      set: { hash, prefix, createdAt: sql`now()`, lastUsedAt: null },
    });
  revalidatePath("/app/settings");
  return { key };
}

// Revokes the project's API key: requests with it get 401 from then on.
export async function revokeApiKey(workspaceId: string) {
  const workspace = await requireOwnWorkspace(workspaceId);
  await getDb().delete(apiKeys).where(eq(apiKeys.workspaceId, workspace.id));
  revalidatePath("/app/settings");
}
