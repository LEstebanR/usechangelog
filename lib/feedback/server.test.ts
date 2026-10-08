import { describe, expect, test } from "bun:test";

// Built, never run: no database in CI.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
const { listFeedback } = await import("./server");
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
});
