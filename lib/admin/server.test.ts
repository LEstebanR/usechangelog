import { describe, expect, test } from "bun:test";

// Built, never run: no database in CI.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
const { listUsers, userCounts } = await import("./server");

describe("listUsers", () => {
  const { sql, params } = listUsers().toSQL();

  test("every user, with their account and projects if they have them", () => {
    expect(sql).toContain('from "neon_auth"."user"');
    expect(sql).toContain('left join "accounts" on "accounts"."user_id" = "neon_auth"."user"."id"');
    expect(sql).toContain('left join "workspaces" on "workspaces"."owner_id" = "neon_auth"."user"."id"');
    expect(sql).toContain('left join "posts" on "posts"."workspace_id" = "workspaces"."id"');
  });

  test("one row per user, whatever their number of projects, with the slugs oldest first", () => {
    expect(sql).toContain('group by "neon_auth"."user"."id", "accounts"."id"');
    expect(sql).toContain('array(select "workspaces"."slug" from "workspaces" where "workspaces"."owner_id" = "neon_auth"."user"."id" order by "workspaces"."created_at", "workspaces"."id")');
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

  test("every user, and the ones with a project (each counted once)", () => {
    expect(sql).toContain('from "neon_auth"."user" left join "accounts"');
    expect(sql).toContain('exists (select 1 from "workspaces" where "workspaces"."owner_id" = "neon_auth"."user"."id")');
  });

  test("active (trials included) and past_due counted separately", () => {
    expect(sql.match(/count\(\*\) filter/g)).toHaveLength(4);
    expect(sql).toContain('"accounts"."trial_ends_at" is not null');
    expect(params).toEqual(["active", "active", "past_due"]);
  });
});
