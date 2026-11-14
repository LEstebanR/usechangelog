import { describe, expect, mock, test } from "bun:test";
import { generateKeyPairSync, sign, type KeyObject } from "node:crypto";
import { createWebhookVerifier, type Jwk } from "./webhook";

// Signs a body the way Neon does: a detached JWS over base64url(`${ts}.${base64url(body)}`).
// No network: the JWKS is injected.
function neonPair(kid: string) {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return { privateKey, jwk: { ...publicKey.export({ format: "jwk" }), kid, alg: "EdDSA" } as Jwk };
}

function signedHeaders(body: string, privateKey: KeyObject, kid: string, timestamp: number) {
  const header = Buffer.from(JSON.stringify({ alg: "EdDSA", kid })).toString("base64url");
  const payload = Buffer.from(`${timestamp}.${Buffer.from(body).toString("base64url")}`).toString("base64url");
  const signature = sign(null, Buffer.from(`${header}.${payload}`), privateKey).toString("base64url");
  return new Headers({
    "x-neon-signature": `${header}..${signature}`,
    "x-neon-signature-kid": kid,
    "x-neon-timestamp": String(timestamp),
  });
}

const now = 1_800_000_000_000;
const body = JSON.stringify({ event_id: "e-1", event_type: "send.magic_link" });

describe("verifyNeonWebhook", () => {
  const { privateKey, jwk } = neonPair("kid-1");

  test("a valid signature passes", async () => {
    const verify = createWebhookVerifier(async () => [jwk]);
    expect(await verify(body, signedHeaders(body, privateKey, "kid-1", now), now)).toBe(true);
  });

  test("an altered body fails", async () => {
    const verify = createWebhookVerifier(async () => [jwk]);
    const headers = signedHeaders(body, privateKey, "kid-1", now);
    expect(await verify(body.replace("e-1", "e-2"), headers, now)).toBe(false);
  });

  test("a different timestamp than the one signed fails", async () => {
    const verify = createWebhookVerifier(async () => [jwk]);
    const headers = signedHeaders(body, privateKey, "kid-1", now);
    headers.set("x-neon-timestamp", String(now - 1000));
    expect(await verify(body, headers, now)).toBe(false);
  });

  test("an unknown kid fails, and refetches the JWKS at most once per interval", async () => {
    const fetchJwks = mock(async () => [jwk]);
    const verify = createWebhookVerifier(fetchJwks);
    const other = neonPair("kid-2");
    expect(await verify(body, signedHeaders(body, other.privateKey, "kid-2", now), now)).toBe(false);
    expect(await verify(body, signedHeaders(body, other.privateKey, "kid-2", now), now)).toBe(false);
    expect(fetchJwks).toHaveBeenCalledTimes(1);
  });

  test("a rotated key is picked up by refetching on its new kid", async () => {
    const rotated = neonPair("kid-2");
    let keys = [jwk];
    const verify = createWebhookVerifier(async () => keys);
    expect(await verify(body, signedHeaders(body, privateKey, "kid-1", now), now)).toBe(true);
    keys = [jwk, rotated.jwk];
    const later = now + 60_000;
    expect(await verify(body, signedHeaders(body, rotated.privateKey, "kid-2", later), later)).toBe(true);
  });

  test("a key signed by someone else under a known kid fails", async () => {
    const verify = createWebhookVerifier(async () => [jwk]);
    const forger = neonPair("kid-1");
    expect(await verify(body, signedHeaders(body, forger.privateKey, "kid-1", now), now)).toBe(false);
  });

  test("a timestamp older (or newer) than 5 minutes fails", async () => {
    const verify = createWebhookVerifier(async () => [jwk]);
    const old = now - 5 * 60_000 - 1;
    expect(await verify(body, signedHeaders(body, privateKey, "kid-1", old), now)).toBe(false);
    const future = now + 5 * 60_000 + 1;
    expect(await verify(body, signedHeaders(body, privateKey, "kid-1", future), now)).toBe(false);
  });

  test("missing headers or a non-detached JWS fail without fetching keys", async () => {
    const fetchJwks = mock(async () => [jwk]);
    const verify = createWebhookVerifier(fetchJwks);
    expect(await verify(body, new Headers(), now)).toBe(false);
    const headers = signedHeaders(body, privateKey, "kid-1", now);
    headers.set("x-neon-signature", headers.get("x-neon-signature")!.replace("..", ".abc."));
    expect(await verify(body, headers, now)).toBe(false);
    expect(fetchJwks).not.toHaveBeenCalled();
  });

  test("a JWKS that can't be fetched throws, so the route answers 5xx", async () => {
    const verify = createWebhookVerifier(async () => {
      throw new Error("JWKS request failed: 503");
    });
    await expect(verify(body, signedHeaders(body, privateKey, "kid-1", now), now)).rejects.toThrow("503");
  });
});
