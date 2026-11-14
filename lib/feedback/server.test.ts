import { describe, expect, test } from "bun:test";

// Built, never run: no database in CI.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
const { listFeedback, openCounts, setFeedbackStatus } = await import("./server");
const { adminRoleQuery } = await import("@/lib/auth/roles");

describe("adminRoleQuery", () => {
  test("only that user's admin role", () => {
    const { sql, params } = adminRoleQuery("u1").toSQL();
    expect(sql).toContain('"user_roles"."user_id" = $1');
    expect(sql).toContain('"user_roles"."role" = $2');
    expect(params).toEqual(["u1", "admin", 1]);
  });
});

describe("listFeedback", () => {
  test("newest first, with the sender's email and the workspace (if any)", () => {
    const { sql } = listFeedback().toSQL();
    expect(sql).toContain('inner join "neon_auth"."user"');
    expect(sql).toContain('left join "workspaces"');
    expect(sql).toContain('order by "feedback"."created_at" desc');
  });

  test("filters by kind only when asked, and caps the list", () => {
    expect(listFeedback().toSQL().sql).not.toContain('"feedback"."kind" =');
    const filtered = listFeedback({ kind: "bug", limit: 50 }).toSQL();
    expect(filtered.sql).toContain('"feedback"."kind" = $1');
    expect(filtered.params).toEqual(["bug", 50]);
  });

  test("filters by status and kind together", () => {
    const { sql, params } = listFeedback({ kind: "idea", status: "open" }).toSQL();
    expect(sql).toContain('("feedback"."kind" = $1 and "feedback"."status" = $2)');
    expect(params).toEqual(["idea", "open", 200]);
  });
});

describe("openCounts", () => {
  test("open messages, grouped by kind", () => {
    const { sql, params } = openCounts().toSQL();
    expect(sql).toContain('where "feedback"."status" = $1 group by "feedback"."kind"');
    expect(params).toEqual(["open"]);
  });
});

describe("setFeedbackStatus", () => {
  test("resolving stamps resolved_at once, keeping an earlier one", () => {
    const { sql, params } = setFeedbackStatus("f1", "done").toSQL();
    expect(sql).toContain('"resolved_at" = coalesce("feedback"."resolved_at", now())');
    expect(params).toEqual(["done", "f1"]);
  });

  test("reopening clears resolved_at", () => {
    const { sql, params } = setFeedbackStatus("f1", "open").toSQL();
    expect(sql).toContain('"resolved_at" = $2');
    expect(params).toEqual(["open", null, "f1"]);
  });
});
