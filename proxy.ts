import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

let authMiddleware: ReturnType<ReturnType<typeof getAuth>["middleware"]> | undefined;

// Redirects to /sign-in without a session and refreshes the session cookie.
// Pages under /app still check the session themselves.
export function proxy(request: NextRequest) {
  // Server Actions (sign out) check the session themselves; a redirect here
  // would break the action response. Same as Neon's Next.js guide.
  if (request.headers.has("Next-Action")) return;
  authMiddleware ??= getAuth().middleware({ loginUrl: "/sign-in" });
  return authMiddleware(request);
}

// Only the app needs a session. The landing and public pages never run auth.
export const config = {
  matcher: ["/app", "/app/:path*"],
};
