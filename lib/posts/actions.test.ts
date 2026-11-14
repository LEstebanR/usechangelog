import { beforeEach, describe, expect, mock, test } from "bun:test";
import { formData } from "@/lib/test/form-data";

// savePost with several projects (#65): a post is saved in its own project, never in the one
// another tab switched to. The session, the database and redirect are mocked. Needs
// `bun test --isolate` (the `test` script).
const oldest = { id: "ws-1", rank: 1, subscriptionStatus: "none" as const };
const second = { id: "ws-2", rank: 2, subscriptionStatus: "none" as const };
let calls: { op: string; row?: Record<string, unknown> }[];

mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
  notFound: () => {
    throw new Error("notFound");
  },
}));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("@/db", () => ({
  getDb: () => ({
    insert: () => ({ values: async (row: Record<string, unknown>) => calls.push({ op: "insert", row }) }),
    update: () => ({ set: (row: Record<string, unknown>) => ({ where: async () => calls.push({ op: "update", row }) }) }),
  }),
}));
// The cookie's project would be `oldest`; these ignore it, as the actions must.
mock.module("@/lib/workspace/server", () => ({
  listWorkspaces: async () => [oldest, second],
  requireOwnWorkspace: async (id: string) => [oldest, second].find((p) => p.id === id),
}));
mock.module("./server", () => ({
  requirePost: async (id: string) => ({
    post: { id, workspaceId: "ws-2", status: "draft", publishedOn: null },
    workspace: second,
  }),
}));

const { savePost } = await import("./actions");
const form = (intent: string) =>
  formData({ title: "Dark mode", body: "", category: "new", type: "shipped", intent, today: "2026-11-13" });

describe("savePost across projects", () => {
  beforeEach(() => {
    calls = [];
  });

  test("a new post goes to the project bound by the page", async () => {
    await expect(savePost({ workspaceId: "ws-2" }, { values: {} as never }, form("save"))).rejects.toThrow("redirect:/app?done=drafted");
    expect(calls).toEqual([{ op: "insert", row: expect.objectContaining({ workspaceId: "ws-2", title: "Dark mode" }) }]);
  });

  test("editing a post checks its own project: on Free, the second project can't publish", async () => {
    const state = await savePost({ postId: "post-1" }, { values: {} as never }, form("publish"));
    expect(state).toMatchObject({ blocked: "none" });
    expect(calls).toEqual([]);
  });

  test("saving a draft of a post in a project that doesn't publish still works", async () => {
    const state = await savePost({ postId: "post-1" }, { values: {} as never }, form("save"));
    expect(state).toMatchObject({ notice: "Draft saved." });
    expect(calls).toEqual([{ op: "update", row: expect.objectContaining({ title: "Dark mode", status: "draft" }) }]);
  });
});
