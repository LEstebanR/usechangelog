import { describe, expect, test } from "bun:test";

// The query is only built, never run: no database in CI. The client needs a URL to exist.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost/test";
const { publishedPostsQuery } = await import("./server");

const workspaceId = "00000000-0000-0000-0000-000000000000";

describe("publishedPostsQuery (listPublishedPosts)", () => {
  test("only the workspace's published posts", () => {
    const { sql, params } = publishedPostsQuery(workspaceId).toSQL();
    expect(sql).toContain('"posts"."workspace_id" = $1');
    expect(sql).toContain('"posts"."status" = $2');
    expect(params).toEqual([workspaceId, "published"]);
  });

  test("Coming soon first, then the newest date, then the newest created", () => {
    const { sql } = publishedPostsQuery(workspaceId).toSQL();
    expect(sql).toMatch(
      /order by "posts"\."type" = 'coming' desc, "posts"\."published_on" desc, "posts"\."created_at" desc/,
    );
  });

  test("never more than the limit, and no limit without one", () => {
    expect(publishedPostsQuery(workspaceId, { limit: 10 }).toSQL()).toMatchObject({ params: [workspaceId, "published", 10] });
    expect(publishedPostsQuery(workspaceId).toSQL().sql).not.toContain("limit");
  });

  test("the body is selected (the page and the widget render it)", () => {
    expect(publishedPostsQuery(workspaceId).toSQL().sql).toContain('"body"');
  });
});
