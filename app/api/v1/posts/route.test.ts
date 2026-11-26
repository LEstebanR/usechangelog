import { beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { hashApiKey, newApiKey } from "@/lib/api/keys";
import type { DraftInput } from "@/lib/api/input";
import type { DraftResult } from "@/lib/api/server";

// No database: the key lookup and the insert are mocked. Validation and the responses are real.
const { key } = newApiKey();
const keys = new Map([[hashApiKey(key), "project-of-the-key"]]);
let result: DraftResult;
const created: { workspaceId: string; draft: DraftInput }[] = [];
let fail = false;

mock.module("@/lib/api/server", () => ({
  touchApiKey: async (hash: string) => (keys.has(hash) ? [{ workspaceId: keys.get(hash) }] : []),
  createDraft: async (workspaceId: string, draft: DraftInput) => {
    if (fail) throw new Error(`insert failed for ${draft.title} with ${key}`);
    created.push({ workspaceId, draft });
    return result;
  },
}));

const { POST } = await import("./route");

const body = { title: "Faster exports", body: "Details.", category: "improved", source: { repo: "acme/web", pr: 12 } };
const post = (payload: unknown, headers: Record<string, string> = { authorization: `Bearer ${key}` }) =>
  POST(
    new Request("https://www.usechangelog.com/api/v1/posts", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    }),
  );

let log: ReturnType<typeof spyOn>;
beforeEach(() => {
  result = { kind: "created", id: "post-1" };
  created.length = 0;
  fail = false;
  log?.mockRestore();
  log = spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/v1/posts (#86)", () => {
  test("a valid request creates a draft in the key's project: 201", async () => {
    const response = await post({ ...body, workspaceId: "someone-else", status: "published" });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: "post-1", status: "draft", created: true });
    expect(created).toEqual([
      { workspaceId: "project-of-the-key", draft: { title: "Faster exports", body: "Details.", category: "improved", sourceRef: "github:acme/web#12" } },
    ]);
  });

  test("the same pull request again answers 200 with the same post", async () => {
    result = { kind: "exists", id: "post-1" };
    const response = await post(body);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: "post-1", status: "draft", created: false });
  });

  test("a missing, malformed, unknown or revoked key: 401, nothing created", async () => {
    for (const headers of [{} as Record<string, string>, { authorization: "Bearer nope" }, { authorization: `Basic ${key}` }, { authorization: `Bearer ${newApiKey().key}` }]) {
      const response = await post(body, headers);
      expect(response.status).toBe(401);
      expect(response.headers.get("www-authenticate")).toContain("Bearer");
      expect(await response.json()).toMatchObject({ error: "unauthorized" });
    }
    expect(created).toEqual([]);
  });

  test("invalid JSON: 400 invalid_json", async () => {
    const response = await post("{ not json");
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "invalid_json" });
  });

  test("invalid fields: 400 with a message per field", async () => {
    const response = await post({ ...body, title: "", category: "shipped" });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "invalid_request", fields: { title: expect.any(String), category: expect.any(String) } });
    expect(created).toEqual([]);
  });

  test("an oversized request: 413, by header or by real size", async () => {
    const big = { ...body, body: "x".repeat(70 * 1024) };
    expect((await post(big)).status).toBe(413);
    expect((await post(body, { authorization: `Bearer ${key}`, "content-length": String(1024 * 1024) })).status).toBe(413);
    expect(created).toEqual([]);
  });

  test("over the hourly limit: 429 with Retry-After", async () => {
    result = { kind: "limited", retryAfter: 120 };
    const response = await post(body);
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("120");
    expect(await response.json()).toMatchObject({ error: "rate_limited" });
  });

  test("an unexpected error: 500 that leaks nothing, not even to the log", async () => {
    fail = true;
    const response = await post(body);
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).not.toContain(key);
    expect(text).not.toContain("insert failed");
    const logged = log.mock.calls.flat().join(" ");
    expect(logged).not.toContain(key);
    expect(logged).not.toContain("Faster exports");
  });

  test("responses are never cached", async () => {
    expect((await post(body)).headers.get("cache-control")).toBe("no-store");
  });
});
