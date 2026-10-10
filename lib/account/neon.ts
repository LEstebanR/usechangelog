import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/neon-auth";

// Deletes a user from Neon Auth through the Neon API (#31). Managed Better Auth has its own
// `/delete-user` turned off, so the server does it with an API key. Read on first use, not
// at import, so `next build` runs without env vars. The database then deletes the user's
// workspace, posts, feedback and role by cascade.
function neonApiConfig() {
  const apiKey = process.env.NEON_API_KEY;
  const projectId = process.env.NEON_PROJECT_ID;
  const branchId = process.env.NEON_BRANCH_ID;
  if (!apiKey || !projectId || !branchId) {
    throw new Error("NEON_API_KEY, NEON_PROJECT_ID and NEON_BRANCH_ID must be set");
  }
  return { apiKey, projectId, branchId };
}

export async function deleteAuthUser(userId: string) {
  const { apiKey, projectId, branchId } = neonApiConfig();
  const url = `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/auth/users/${encodeURIComponent(userId)}`;
  const response = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${apiKey}` } });
  if (response.ok) return;
  // A 404 is fine only if the user is really gone (a retry after a timeout must still sign
  // them out). A wrong project or branch id also answers 404, with the user still there.
  if (response.status === 404 && !(await userExists(userId))) return;
  throw new Error(`Neon API: deleting the user failed (HTTP ${response.status}): ${(await response.text()).slice(0, 200)}`);
}

async function userExists(userId: string) {
  const rows = await getDb().select({ id: user.id }).from(user).where(eq(user.id, userId)).limit(1);
  return rows.length > 0;
}
