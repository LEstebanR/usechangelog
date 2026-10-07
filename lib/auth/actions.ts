"use server";

import { redirect } from "next/navigation";
import { getOrigin } from "@/lib/site";
import { canSignIn } from "./early-access";
import { getAuth } from "./server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/sign-in?error=MISSING_EMAIL");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/sign-in?error=INVALID_EMAIL");
  // Before launch, production only sends links to the early access list (#9).
  if (!canSignIn(email)) redirect("/sign-in?error=NOT_OPEN");

  // Absolute: Neon resolves relative URLs against its own domain.
  const origin = await getOrigin();
  const { error } = await getAuth().signIn.magicLink({
    email,
    callbackURL: `${origin}/auth/callback`,
    errorCallbackURL: `${origin}/sign-in`,
  });
  if (error) {
    console.error("[sign-in] magic link failed", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
    redirect("/sign-in?error=SEND_FAILED");
  }
  redirect("/sign-in?sent=1");
}

export async function signOut() {
  await getAuth().signOut();
  redirect("/");
}
