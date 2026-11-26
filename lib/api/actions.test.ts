import { beforeEach, describe, expect, mock, test } from "bun:test";

// createApiKey and revokeApiKey (#86) only touch the signed-in user's own projects.
// The session and the database are mocked. Needs `bun test --isolate` (the `test` script).
const writes: { op: string; values?: Record<string, unknown> }[] = [];

mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("@/lib/workspace/server", () => ({
  requireOwnWorkspace: async (id: string) => {
    if (id !== "own-project") throw new Error("notFound");
    return { id };
  },
}));
mock.module("@/db", () => ({
  getDb: () => ({
    insert: () => ({
      values: (values: Record<string, unknown>) => ({
        onConflictDoUpdate: async () => void writes.push({ op: "upsert", values }),
      }),
    }),
    delete: () => ({ where: async () => void writes.push({ op: "delete" }) }),
  }),
}));

const { createApiKey, revokeApiKey } = await import("./actions");
const { hashApiKey } = await import("./keys");

beforeEach(() => {
  writes.length = 0;
});

describe("API key actions (#86)", () => {
  test("creating or rotating returns the key once and stores only its hash", async () => {
    const { key } = await createApiKey("own-project");
    expect(key).toMatch(/^uc_/);
    expect(writes).toEqual([{ op: "upsert", values: { workspaceId: "own-project", hash: hashApiKey(key!), prefix: key!.slice(0, 9) } }]);
  });

  test("another user's project is a 404, and nothing is written", async () => {
    await expect(createApiKey("someone-elses")).rejects.toThrow("notFound");
    await expect(revokeApiKey("someone-elses")).rejects.toThrow("notFound");
    expect(writes).toEqual([]);
  });

  test("revoking deletes the project's key", async () => {
    await revokeApiKey("own-project");
    expect(writes).toEqual([{ op: "delete" }]);
  });
});
