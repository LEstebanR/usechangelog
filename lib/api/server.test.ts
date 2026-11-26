import { describe, expect, test } from "bun:test";
import { PgDialect } from "drizzle-orm/pg-core";

// The SQL is only built, never run: no database in CI.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
const { afterInsertSql, API_DRAFTS_PER_HOUR, insertDraftSql, touchApiKey } = await import("./server");

const dialect = new PgDialect();
const workspaceId = "00000000-0000-0000-0000-000000000001";
const draft = { title: "T", body: "B", category: "fixed" as const, sourceRef: "github:acme/web#7" };

describe("insertDraftSql (#86)", () => {
  const { sql, params } = dialect.sqlToQuery(insertDraftSql(workspaceId, draft));

  test("always a Shipped draft in the key's project", () => {
    expect(sql).toMatch(/select \$1::uuid, \$2, \$3, \$4::post_category, 'shipped', 'draft', \$5/);
    expect(params.slice(0, 5)).toEqual([workspaceId, "T", "B", "fixed", "github:acme/web#7"]);
  });

  test("only under the hourly limit, counting the project's API drafts", () => {
    expect(sql).toContain('"posts"."source_ref" is not null and "posts"."created_at" > now() - interval \'1 hour\'');
    expect(params.at(-1)).toBe(API_DRAFTS_PER_HOUR);
  });

  test("one post per pull request", () => {
    expect(sql).toContain("on conflict (workspace_id, source_ref) do nothing");
  });
});

test("afterInsertSql finds the pull request's post in the same project", () => {
  const { sql, params } = dialect.sqlToQuery(afterInsertSql(workspaceId, draft.sourceRef));
  expect(sql).toContain('"posts"."workspace_id" = $1 and "posts"."source_ref" = $2');
  expect(params.slice(0, 2)).toEqual([workspaceId, draft.sourceRef]);
});

test("touchApiKey looks the key up by hash and marks it used", () => {
  const { sql, params } = touchApiKey("abc").toSQL();
  expect(sql).toMatch(/update "api_keys" set "last_used_at" = now\(\) where "api_keys"\."hash" = \$1 returning "workspace_id"/);
  expect(params).toEqual(["abc"]);
});
