"use server";

import { redirect } from "next/navigation";
import { clearAuthCookies, requireUser } from "@/lib/auth/server";
import { revokeSubscriptionsInPolar } from "@/lib/billing/polar";
import { getCurrentAccount } from "@/lib/workspace/server";
import { deleteAuthUser } from "./neon";

export type DeleteAccountState = { error?: string };

// Deletes the signed-in user's account (#31): cancel in Polar, then delete the user, whose
// account, projects and posts go by cascade. The typed email is checked here too, not only
// in the form: with several projects (#65) there is no single slug to type.
export async function deleteAccount(_prev: DeleteAccountState, formData: FormData): Promise<DeleteAccountState> {
  const user = await requireUser();
  if (String(formData.get("email") ?? "").trim().toLowerCase() !== user.email.toLowerCase()) {
    return { error: "Type your email exactly as it appears to confirm." };
  }

  // Without an account row there was never a checkout, so nothing to cancel in Polar.
  const account = await getCurrentAccount();
  if (account) {
    try {
      await revokeSubscriptionsInPolar(account.id);
    } catch (error) {
      console.error("[delete-account] Polar cancellation failed", { accountId: account.id, error });
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
      error: account
        ? "Your subscription is cancelled, but we couldn't delete your account. Try again in a minute."
        : "We couldn't delete your account. Try again in a minute.",
    };
  }

  // The user and its sessions are gone; this browser is signed out too.
  await clearAuthCookies();
  redirect("/?deleted=1");
}
