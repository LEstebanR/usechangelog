"use server";

import { redirect } from "next/navigation";
import { getOrigin } from "@/lib/site";
import { getAuth } from "./server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/sign-in?error=MISSING_EMAIL");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/sign-in?error=INVALID_EMAIL");

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

// Google sends the browser back to Neon, which lands it on /auth/callback like a
// magic link. The SDK stores the OAuth challenge cookie the callback needs.
export async function signInWithGoogle() {
  const origin = await getOrigin();
  const callbackURL = `${origin}/auth/callback?via=google`;
  const { data, error } = await getAuth().signIn.social({
    provider: "google",
    callbackURL,
    // Neon sends new users to its own default ("/") without this.
    newUserCallbackURL: callbackURL,
    errorCallbackURL: `${origin}/sign-in`,
  });
  if (error || !data?.url) {
    console.error("[sign-in] google failed", {
      status: error?.status,
      code: error?.code,
      message: error?.message,
    });
    redirect("/sign-in?error=GOOGLE_FAILED");
  }
  redirect(data.url);
}

export async function signOut() {
  await getAuth().signOut();
  redirect("/");
}
