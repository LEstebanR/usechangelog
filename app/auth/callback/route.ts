import { NextResponse, type NextRequest } from "next/server";
import { getAuthHandlers } from "@/lib/auth/server";

const VERIFIER = "neon_auth_session_verifier";

// The magic link and Google sign-in both land here with a one-time verifier.
// Neon's client SDK exchanges it on page load; we have no client SDK, so we
// exchange it here and hand the session cookies to the browser before going
// to /app. For Google, the request also carries the OAuth challenge cookie.
export async function GET(request: NextRequest) {
  // signInWithGoogle adds ?via=google, so a failed Google exchange doesn't
  // show the magic link's "link already used" message.
  const failed = `/sign-in?error=${request.nextUrl.searchParams.get("via") === "google" ? "GOOGLE_FAILED" : "INVALID_TOKEN"}`;
  const verifier = request.nextUrl.searchParams.get(VERIFIER);
  if (!verifier) return redirectTo(request, failed);

  const url = new URL("/api/auth/get-session", request.url);
  url.searchParams.set(VERIFIER, verifier);
  const session = await getAuthHandlers().GET(new Request(url, { headers: request.headers }), {
    params: Promise.resolve({ path: ["get-session"] }),
  });
  const data = session.ok ? await session.json().catch(() => null) : null;

  const response = redirectTo(request, data?.user ? "/app" : failed);
  for (const cookie of session.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}
