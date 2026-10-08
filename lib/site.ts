import { headers } from "next/headers";

// The canonical URL, for metadata (#13): NEXT_PUBLIC_SITE_URL on Production; on a preview,
// that deployment's own URL; locally, localhost. Read when called, never at import.
export function siteUrl(env: Record<string, string | undefined> = process.env) {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  return "http://localhost:3000";
}

// This deployment's origin, from the request. Links we hand out (public pages, Polar's
// return URLs) follow whatever host was used, so every preview points to itself.
// Server Action POSTs carry `origin`, which Next has already checked against the host.
export async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
}

// A workspace's public changelog URL.
export async function publicUrl(slug: string) {
  return `${await getOrigin()}/${slug}`;
}
