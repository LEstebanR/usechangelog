"use server";

import { redirect } from "next/navigation";
import { getAuth } from "./server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/sign-in?error=MISSING_EMAIL");

  // An expired or used link comes back to /sign-in with an `error` param.
  const { error } = await getAuth().signIn.magicLink({
    email,
    callbackURL: "/app",
    errorCallbackURL: "/sign-in",
  });
  redirect(error ? "/sign-in?error=SEND_FAILED" : "/sign-in?sent=1");
}

export async function signOut() {
  await getAuth().signOut();
  redirect("/");
}
