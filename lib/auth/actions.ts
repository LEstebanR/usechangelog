"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/sign-in?error=MISSING_EMAIL");

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

// The site's origin, from the request: the Server Action POST carries `origin`.
async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
}

export async function signOut() {
  await getAuth().signOut();
  redirect("/");
}
