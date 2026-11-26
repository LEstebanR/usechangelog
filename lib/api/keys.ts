import { createHash, randomBytes } from "node:crypto";

// A project's API key (#86): "uc_" and 32 random base64url characters (192 bits). Only its
// SHA-256 is stored, so a leaked database doesn't leak usable keys; a fast hash is enough
// for a random key of this size.
export const KEY_PREFIX = "uc_";
const KEY = /^uc_[A-Za-z0-9_-]{32}$/;
// How much of the key settings shows, to tell keys apart: "uc_" and 6 more.
const SHOWN = 9;

export const hashApiKey = (key: string) => createHash("sha256").update(key).digest("hex");

export function newApiKey() {
  const key = KEY_PREFIX + randomBytes(24).toString("base64url");
  return { key, hash: hashApiKey(key), prefix: key.slice(0, SHOWN) };
}

// The key in an `Authorization: Bearer <key>` header, or null when there's none or it
// can't be one of ours (checked before touching the database).
export function bearerKey(header: string | null): string | null {
  const match = header?.match(/^Bearer\s+(\S+)\s*$/i);
  return match && KEY.test(match[1]) ? match[1] : null;
}
