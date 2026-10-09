"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { revokeSubscriptionsInPolar } from "@/lib/billing/polar";
import { getCurrentWorkspace } from "@/lib/workspace/server";
import { deleteAuthUser } from "./neon";

export type DeleteAccountState = { error?: string };

// Every cookie Neon Auth sets starts with this (the SDK doesn't export it from the Next entry).
const AUTH_COOKIE_PREFIX = "__Secure-neon-auth";

// Deletes the signed-in user's account (#31): cancel in Polar, then delete the user, whose
// workspace and posts go by cascade. The typed slug is checked here too, not only in the form.
export async function deleteAccount(_prev: DeleteAccountState, formData: FormData): Promise<DeleteAccountState> {
  const user = await requireUser();
  const workspace = await getCurrentWorkspace();

  if (workspace) {
    if (String(formData.get("slug") ?? "").trim() !== workspace.slug) {
      return { error: "Type your workspace's slug exactly as it appears to confirm." };
    }
    try {
      await revokeSubscriptionsInPolar(workspace.id);
    } catch (error) {
      console.error("[delete-account] Polar cancellation failed", { workspaceId: workspace.id, error });
      return {
        error: "We couldn't cancel your subscription in Polar, so nothing was deleted. Try again in a minute.",
      };
    }
  }

  try {
    await deleteAuthUser(user.id);
  } catch (error) {
    console.error("[delete-account] Neon user deletion failed", { userId: user.id, error });
    return {
      error: workspace
        ? "Your subscription is cancelled, but we couldn't delete your account. Try again in a minute."
        : "We couldn't delete your account. Try again in a minute.",
    };
  }

  // The user and its sessions are gone; drop the cookies so this browser is signed out too.
  const jar = await cookies();
  for (const { name } of jar.getAll()) {
    // Browsers only clear a __Secure- cookie from a Secure Set-Cookie.
    if (name.startsWith(AUTH_COOKIE_PREFIX)) jar.delete({ name, path: "/", secure: true });
  }
  redirect("/?deleted=1");
}
