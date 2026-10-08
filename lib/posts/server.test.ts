import { describe, expect, test } from "bun:test";
import { PUBLIC_STATUSES } from "@/lib/billing/status";

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

  // The same rule as isIndexable (the page's noindex): exactly the statuses that publish...
  test("only workspaces whose status publishes (PUBLIC_STATUSES)", () => {
    expect(sql).toContain('"workspaces"."subscription_status" in (');
    expect(params.filter((p) => p !== "published")).toEqual([...PUBLIC_STATUSES]);
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
