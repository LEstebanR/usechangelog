import type { NextRequest } from "next/server";
import { getAuthMiddleware } from "@/lib/auth/server";

// Redirects to /sign-in without a session and refreshes the session cookie.
export function proxy(request: NextRequest) {
  // Server Actions call requireUser() themselves; a redirect here would break
  // the action response. Same as Neon's Next.js guide.
  if (request.headers.has("Next-Action")) return;
  return getAuthMiddleware()(request);
}

// Only the app needs a session. The landing and public pages never run auth.
export const config = {
  matcher: ["/app", "/app/:path*"],
};
