import { describe, expect, test } from "bun:test";

// Built, never run: no database in CI.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
const { listUsers, userCounts } = await import("./server");

describe("listUsers", () => {
  const { sql, params } = listUsers().toSQL();

  test("every user, with their workspace if they have one", () => {
    expect(sql).toContain('from "neon_auth"."user"');
    expect(sql).toContain('left join "workspaces" on "workspaces"."owner_id" = "neon_auth"."user"."id"');
    expect(sql).toContain('left join "posts" on "posts"."workspace_id" = "workspaces"."id"');
  });

  test("counts all posts, and only published ones as published", () => {
    expect(sql).toContain('count("posts"."id")');
    expect(sql).toMatch(/count\(\*\) filter \(where "posts"\."status" = \$\d+\)/);
    expect(params).toContain("published");
  });

  test("latest sign-in from that user's sessions", () => {
    expect(sql).toContain('(select max("neon_auth"."session"."createdAt") from "neon_auth"."session" where "neon_auth"."session"."userId" = "neon_auth"."user"."id")');
  });

  test("newest first, capped", () => {
    expect(sql).toContain('order by "neon_auth"."user"."createdAt" desc');
    expect(params.at(-1)).toBe(200);
    expect(listUsers({ limit: 5 }).toSQL().params.at(-1)).toBe(5);
  });
});

describe("userCounts", () => {
  const { sql, params } = userCounts().toSQL();

  test("every user, and the ones with a workspace", () => {
    expect(sql).toContain('from "neon_auth"."user" left join "workspaces"');
    expect(sql).toContain('count("workspaces"."id")');
  });

  test("active (trials included) and past_due counted separately", () => {
    expect(sql.match(/count\(\*\) filter/g)).toHaveLength(3);
    expect(sql).toContain('"workspaces"."trial_ends_at" is not null');
    expect(params).toEqual(["active", "active", "past_due"]);
  });
});
