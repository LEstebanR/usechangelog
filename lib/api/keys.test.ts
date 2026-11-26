import { describe, expect, test } from "bun:test";
import { bearerKey, hashApiKey, newApiKey } from "./keys";

describe("API keys (#86)", () => {
  test("a new key is uc_ and 32 random characters, stored only as its SHA-256", () => {
    const { key, hash, prefix } = newApiKey();
    expect(key).toMatch(/^uc_[A-Za-z0-9_-]{32}$/);
    expect(hash).toBe(hashApiKey(key));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toContain(key.slice(3));
    expect(prefix).toBe(key.slice(0, 9));
    expect(newApiKey().key).not.toBe(key);
  });

  test("only a Bearer header with one of our keys is read", () => {
    const { key } = newApiKey();
    expect(bearerKey(`Bearer ${key}`)).toBe(key);
    expect(bearerKey(`bearer ${key} `)).toBe(key);
    for (const header of [null, "", key, `Basic ${key}`, "Bearer uc_short", `Bearer ${key}x`, `Bearer ${key} extra`]) {
      expect(bearerKey(header)).toBeNull();
    }
  });
});
