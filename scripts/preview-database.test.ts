import { afterEach, describe, expect, test } from "bun:test";
import { endpointId, previewDatabaseProblem } from "./preview-database";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const env = {
  DATABASE_URL_UNPOOLED: "postgresql://u:secret@ep-flat-salad-b4pzn1fv.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require",
  NEON_API_KEY: "napi_test",
  NEON_PROJECT_ID: "old-sunset-1",
  NEON_BRANCH_ID: "br-develop",
};

let requested: string[];
function neon(branchId: string, branch: { name: string; default: boolean }, status = 200) {
  requested = [];
  globalThis.fetch = (async (url: string) => {
    requested.push(url);
    if (status !== 200) return new Response("nope", { status });
    const body = url.includes("/endpoints/") ? { endpoint: { branch_id: branchId } } : { branch };
    return Response.json(body);
  }) as typeof fetch;
}

describe("endpointId", () => {
  test("reads the endpoint from a direct or a pooled host", () => {
    expect(endpointId(env.DATABASE_URL_UNPOOLED)).toBe("ep-flat-salad-b4pzn1fv");
    expect(endpointId("postgresql://u:p@ep-flat-salad-b4pzn1fv-pooler.c-6.us-east-2.aws.neon.tech/db")).toBe("ep-flat-salad-b4pzn1fv");
  });

  test("an @ in the password doesn't confuse it", () => {
    expect(endpointId("postgresql://u:p%40ss@ep-flat-salad-b4pzn1fv.c-6.us-east-2.aws.neon.tech/db")).toBe("ep-flat-salad-b4pzn1fv");
    expect(endpointId("postgresql://u:p@ep-fake.x@db.example.com/db")).toBeUndefined();
  });

  test("anything that isn't a Neon host has none", () => {
    expect(endpointId("postgresql://u:p@localhost:5432/db")).toBeUndefined();
    expect(endpointId("")).toBeUndefined();
  });
});

describe("previewDatabaseProblem", () => {
  test("develop, matching NEON_BRANCH_ID, passes", async () => {
    neon("br-develop", { name: "develop", default: false });
    expect(await previewDatabaseProblem(env)).toBeUndefined();
    expect(requested).toEqual([
      "https://console.neon.tech/api/v2/projects/old-sunset-1/endpoints/ep-flat-salad-b4pzn1fv",
      "https://console.neon.tech/api/v2/projects/old-sunset-1/branches/br-develop",
    ]);
  });

  test("the default (production) branch fails", async () => {
    neon("br-production", { name: "production", default: true });
    expect(await previewDatabaseProblem(env)).toContain("default (production) branch");
  });

  test("a branch other than NEON_BRANCH_ID fails", async () => {
    neon("br-other", { name: "other", default: false });
    expect(await previewDatabaseProblem(env)).toContain("NEON_BRANCH_ID is another branch");
  });

  test("a failed Neon call fails the check instead of letting the migration run", async () => {
    neon("br-develop", { name: "develop", default: false }, 401);
    expect(await previewDatabaseProblem(env)).toContain("HTTP 401");
  });

  test("a URL without a Neon endpoint fails, and the message never includes it", async () => {
    const problem = await previewDatabaseProblem({ ...env, DATABASE_URL_UNPOOLED: "postgresql://u:secret@db.example.com/x" });
    expect(problem).toContain("no Neon endpoint");
    expect(problem).not.toContain("secret");
  });
});
