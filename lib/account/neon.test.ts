import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

// deleteAuthUser with fetch and the database mocked (`bun test --isolate`).
let userStillThere: boolean;
mock.module("@/db", () => ({
  getDb: () => ({
    select: () => ({ from: () => ({ where: () => ({ limit: async () => (userStillThere ? [{ id: "user-1" }] : []) }) }) }),
  }),
}));
const { deleteAuthUser } = await import("./neon");

const realFetch = globalThis.fetch;
let requests: { url: string; init?: RequestInit }[];

function respond(status: number) {
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    requests.push({ url, init });
    return new Response(status === 200 ? "{}" : "nope", { status });
  }) as typeof fetch;
}

describe("deleteAuthUser", () => {
  beforeEach(() => {
    requests = [];
    userStillThere = false;
    process.env.NEON_API_KEY = "napi_test";
    process.env.NEON_PROJECT_ID = "old-sunset-1";
    process.env.NEON_BRANCH_ID = "br-test-1";
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  test("calls the Neon API for that project, branch and user", async () => {
    respond(200);
    await deleteAuthUser("user-1");
    expect(requests[0].url).toBe("https://console.neon.tech/api/v2/projects/old-sunset-1/branches/br-test-1/auth/users/user-1");
    expect(requests[0].init?.method).toBe("DELETE");
    expect(new Headers(requests[0].init?.headers).get("Authorization")).toBe("Bearer napi_test");
  });

  test("a user that's already gone counts as deleted", async () => {
    respond(404);
    await expect(deleteAuthUser("user-1")).resolves.toBeUndefined();
  });

  test("a 404 while the user still exists (a wrong project or branch id) throws", async () => {
    respond(404);
    userStillThere = true;
    await expect(deleteAuthUser("user-1")).rejects.toThrow("HTTP 404");
  });

  test("any other failure throws", async () => {
    respond(500);
    await expect(deleteAuthUser("user-1")).rejects.toThrow("HTTP 500");
  });

  test("without the env vars it throws before calling Neon", async () => {
    delete process.env.NEON_API_KEY;
    respond(200);
    await expect(deleteAuthUser("user-1")).rejects.toThrow("NEON_API_KEY");
    expect(requests).toEqual([]);
  });
});
