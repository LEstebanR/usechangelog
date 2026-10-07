// Before launch (#9), production signs in only the emails in SIGN_IN_ALLOWED_EMAILS
// (comma-separated, any case). Without the variable, nobody gets a link there.
// Previews and local stay open. At launch, delete this file and its two callers.
type Env = Record<string, string | undefined>;

export const signInIsRestricted = (env: Env = process.env) => env.VERCEL_ENV === "production";

export function canSignIn(email: string, env: Env = process.env) {
  if (!signInIsRestricted(env)) return true;
  const allowed = (env.SIGN_IN_ALLOWED_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
