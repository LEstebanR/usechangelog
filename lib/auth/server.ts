import { createNeonAuth } from "@neondatabase/auth/next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

// Everything here is created on first use, not at import: createNeonAuth
// validates the secret, and `next build` runs without env vars.
function lazy<T>(create: () => T) {
  let value: T | undefined;
  return () => (value ??= create());
}

// Set by Neon Auth after sign-in (the SDK doesn't export the name).
const SESSION_COOKIE = "__Secure-neon-auth.session_token";

export const getAuth = lazy(() => {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret) {
    throw new Error("NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set");
  }
  return createNeonAuth({ baseUrl, cookies: { secret } });
});

export const getAuthHandlers = lazy(() => getAuth().handler());
export const getAuthMiddleware = lazy(() => getAuth().middleware({ loginUrl: "/sign-in" }));

// The current user, or null. Rendered per request, never prerendered, and
// deduped across a layout and page in the same request.
export const getUser = cache(async () => {
  await connection();
  // No session token, no session: skip the round trip to Neon.
  if (!(await cookies()).has(SESSION_COOKIE)) return null;
  const { data } = await getAuth().getSession();
  return data?.user ?? null;
});

// For every page and Server Action under /app: the proxy skips Server Actions,
// so this is the check that counts.
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/sign-in");
  return user;
}
