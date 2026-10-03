import { headers } from "next/headers";

// This deployment's origin, from the request (until #13 adds a configured site URL).
// Server Action POSTs carry `origin`, which Next has already checked against the host.
export async function getOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
}
