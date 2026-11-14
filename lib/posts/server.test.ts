import { describe, expect, test } from "bun:test";
import { PLANS, PRO_STATUSES } from "@/lib/billing/plans";
import { canPublish, SUBSCRIPTION_STATUSES } from "@/lib/billing/status";

// The query is only built, never run: no database in CI. The client needs a URL to exist.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
const { listPublicChangelogs, listPublishedPosts } = await import("./server");

const workspaceId = "00000000-0000-0000-0000-000000000000";

describe("listPublishedPosts", () => {
  test("only the workspace's published posts", () => {
    const { sql, params } = listPublishedPosts(workspaceId).toSQL();
    expect(sql).toContain('"posts"."workspace_id" = $1');
    expect(sql).toContain('"posts"."status" = $2');
    expect(params).toEqual([workspaceId, "published"]);
  });

  test("Coming soon first, then the newest date, then the newest created", () => {
    const { sql } = listPublishedPosts(workspaceId).toSQL();
    expect(sql).toMatch(
      /order by "posts"\."type" = 'coming' desc, "posts"\."published_on" desc, "posts"\."created_at" desc/,
    );
  });

  test("never more than the limit, and no limit without one", () => {
    expect(listPublishedPosts(workspaceId, { limit: 10 }).toSQL()).toMatchObject({ params: [workspaceId, "published", 10] });
    expect(listPublishedPosts(workspaceId).toSQL().sql).not.toContain("limit");
  });

  test("the body is selected (the page and the widget render it)", () => {
    expect(listPublishedPosts(workspaceId).toSQL().sql).toContain('"body"');
  });
});

describe("listPublicChangelogs (sitemap)", () => {
  const { sql, params } = listPublicChangelogs().toSQL();

  // The same rule as canPublish (and so isIndexable, the page's noindex): the project's rank
  // among its account's projects, against a limit built from PRO_STATUSES and PLANS...
  // The limits are cast: Postgres would infer the CASE's params as text and refuse `int <= text`.
  test("only projects the account's plan publishes, by age", () => {
    expect(sql).toContain('left join "accounts" on "accounts"."user_id" = "workspaces"."owner_id"');
    expect(sql).toMatch(/\(select count\(\*\)::int \+ 1 from "workspaces" as older\s+where older\.owner_id = "workspaces"\."owner_id"\s+and \(older\.created_at, older\.id\) < \("workspaces"\."created_at", "workspaces"\."id"\)\) <= case when coalesce\("accounts"\."subscription_status", 'none'\) in \(\$\d+\) then \$\d+::int else \$\d+::int end/);
    expect(params).toEqual(["published", ...PRO_STATUSES, PLANS.pro.projects, PLANS.free.projects]);
  });

  // ...which gives the same answer as canPublish for every status and rank.
  test("the SQL limit matches canPublish", () => {
    const sqlLimit = (status: string) => ((PRO_STATUSES as readonly string[]).includes(status) ? PLANS.pro.projects : PLANS.free.projects);
    for (const subscriptionStatus of SUBSCRIPTION_STATUSES) {
      for (let rank = 1; rank <= 4; rank++) {
        expect(canPublish({ subscriptionStatus, rank })).toBe(rank <= sqlLimit(subscriptionStatus));
      }
    }
  });

  // ...and at least one published post.
  test("only with at least one published post, joined per workspace", () => {
    expect(sql).toMatch(/inner join "posts" on \("posts"\."workspace_id" = "workspaces"\."id" and "posts"\."status" = \$\d\)/);
    expect(params).toContain("published");
  });

  test("one row per slug, with its newest publish date", () => {
    expect(sql).toContain('max("posts"."published_on")');
    expect(sql).toContain('group by "workspaces"."slug"');
  });
});
