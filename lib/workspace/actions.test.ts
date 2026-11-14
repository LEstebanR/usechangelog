import { beforeEach, describe, expect, mock, test } from "bun:test";
import { formData } from "@/lib/test/form-data";

// createWorkspace and the plan's project limit (#65), with the session, the database,
// cookies and redirect mocked. Needs `bun test --isolate` (the `test` script).
let status: "active" | "past_due" | "canceled" | "none";
let projectCount: number;
let inserted: unknown[];
let cookie: string | undefined;

mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
  notFound: () => {
    throw new Error("notFound");
  },
}));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("next/headers", () => ({
  cookies: async () => ({
    set: (_name: string, value: string) => {
      cookie = value;
    },
    delete: () => {},
  }),
}));
mock.module("@/lib/auth/server", () => ({ requireUser: async () => ({ id: "user-1" }) }));
mock.module("@/db", () => ({
  getDb: () => ({
    insert: () => ({
      values: (row: unknown) => ({
        returning: async () => {
          inserted.push(row);
          return [{ id: "ws-new" }];
        },
      }),
    }),
  }),
}));
mock.module("./server", () => ({
  PROJECT_COOKIE: "uc_project",
  ensureAccount: async () => ({ id: "acct-1", subscriptionStatus: status }),
  listWorkspaces: async () => Array.from({ length: projectCount }, (_, i) => ({ id: `ws-${i + 1}` })),
  requireOwnWorkspace: async () => {
    throw new Error("unused");
  },
}));

const { createWorkspace } = await import("./actions");
const create = () => createWorkspace({ values: { name: "", slug: "", widgetLang: "en" } }, formData({ name: "Acme", slug: "acme" }));

describe("createWorkspace (plan limit)", () => {
  beforeEach(() => {
    status = "none";
    projectCount = 0;
    inserted = [];
    cookie = undefined;
  });

  test("Free creates its first project and opens it", async () => {
    await expect(create()).rejects.toThrow(/^redirect:\/app$/);
    expect(inserted).toEqual([{ ownerId: "user-1", name: "Acme", slug: "acme", widgetLang: "en" }]);
    expect(cookie).toBe("ws-new");
  });

  test("Free with one project is sent to billing, and nothing is created", async () => {
    projectCount = 1;
    await expect(create()).rejects.toThrow("redirect:/app/billing");
    expect(inserted).toEqual([]);
  });

  test("past_due and canceled are Free too", async () => {
    projectCount = 1;
    for (const s of ["past_due", "canceled"] as const) {
      status = s;
      await expect(create()).rejects.toThrow("redirect:/app/billing");
    }
    expect(inserted).toEqual([]);
  });

  test("Pro creates up to three, and the fourth is refused", async () => {
    status = "active";
    for (projectCount = 1; projectCount < 3; projectCount++) {
      await expect(create()).rejects.toThrow(/^redirect:\/app$/);
    }
    expect(inserted).toHaveLength(2);
    projectCount = 3;
    await expect(create()).rejects.toThrow("redirect:/app/billing");
    expect(inserted).toHaveLength(2);
  });
});
