import { createPublicKey, verify, type JsonWebKey } from "node:crypto";

// Verifies Neon Auth's webhook signature (#83), following Neon's guide: a detached JWS
// (EdDSA, Ed25519) over base64url(`${timestamp}.${base64url(rawBody)}`), signed with the
// key in `${NEON_AUTH_BASE_URL}/.well-known/jwks.json` whose kid is X-Neon-Signature-Kid.
// https://neon.com/docs/auth/guides/webhooks

export type Jwk = JsonWebKey & { kid?: string };
type HeaderReader = { get(name: string): string | null };

// Neon recommends rejecting anything older than 5 minutes.
const MAX_AGE_MS = 5 * 60_000;
// An unknown kid refetches the JWKS at most this often, so forged kids can't make us hammer Neon.
const REFRESH_INTERVAL_MS = 30_000;

async function fetchNeonJwks(): Promise<Jwk[]> {
  const base = process.env.NEON_AUTH_BASE_URL;
  if (!base) throw new Error("NEON_AUTH_BASE_URL is not set");
  const response = await fetch(`${base}/.well-known/jwks.json`, { cache: "no-store" });
  if (!response.ok) throw new Error(`JWKS request failed: ${response.status}`);
  const { keys } = (await response.json()) as { keys?: Jwk[] };
  return keys ?? [];
}

// Each verifier keeps its own JWKS in memory and refetches it only for a kid it doesn't know.
// Tests inject the keys instead of the network.
export function createWebhookVerifier(fetchJwks: () => Promise<Jwk[]> = fetchNeonJwks) {
  let keys: Jwk[] | undefined;
  let fetchedAt = 0;

  async function keyFor(kid: string, now: number) {
    let jwk = keys?.find((k) => k.kid === kid);
    if (!jwk && (!keys || now - fetchedAt >= REFRESH_INTERVAL_MS)) {
      keys = await fetchJwks();
      fetchedAt = now;
      jwk = keys.find((k) => k.kid === kid);
    }
    return jwk;
  }

  // True only for a valid, fresh signature over this exact body. Throws only when the JWKS
  // can't be fetched, so the caller can answer 5xx and Neon retries.
  return async function verifyNeonWebhook(rawBody: string, headers: HeaderReader, now = Date.now()) {
    const signature = headers.get("x-neon-signature");
    const kid = headers.get("x-neon-signature-kid");
    const timestamp = headers.get("x-neon-timestamp");
    if (!signature || !kid || !timestamp || !/^\d+$/.test(timestamp)) return false;
    if (Math.abs(now - Number(timestamp)) > MAX_AGE_MS) return false;

    const parts = signature.split(".");
    if (parts.length !== 3 || parts[1] !== "") return false;
    const [header, , sig] = parts;

    const jwk = await keyFor(kid, now);
    if (!jwk) return false;
    let publicKey;
    try {
      publicKey = createPublicKey({ key: jwk, format: "jwk" });
    } catch {
      return false;
    }
    // Only Ed25519: a key of another type never verifies, whatever the JWS header says.
    if (publicKey.asymmetricKeyType !== "ed25519") return false;

    const payload = Buffer.from(`${timestamp}.${Buffer.from(rawBody, "utf8").toString("base64url")}`, "utf8").toString("base64url");
    return verify(null, Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(sig, "base64url"));
  };
}

export const verifyNeonWebhook = createWebhookVerifier();
