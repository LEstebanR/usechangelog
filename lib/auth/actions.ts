"use server";

import { redirect } from "next/navigation";
import { getAuth } from "./server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/sign-in?error=MISSING_EMAIL");

  // The link lands back on /sign-in: with a session it forwards to /app,
  // and with an expired or used link it shows the `error` param.
  const { error } = await getAuth().signIn.magicLink({
    email,
    callbackURL: "/sign-in",
  });
  redirect(error ? "/sign-in?error=SEND_FAILED" : "/sign-in?sent=1");
}

export async function signOut() {
  await getAuth().signOut();
  redirect("/");
}
