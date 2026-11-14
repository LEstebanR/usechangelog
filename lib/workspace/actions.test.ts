import { beforeEach, describe, expect, mock, test } from "bun:test";
import { formData } from "@/lib/test/form-data";

// createWorkspace and the plan's project limit (#65), with the session, the database,
// cookies and redirect mocked. Needs `bun test --isolate` (the `test` script).
let status: "active" | "past_due" | "canceled" | "none";
let projectCount: number;
// What the guarded insert returns: no row when the database refused it (the limit, under a lock).
let dbAllows: boolean;
let inserted: number;
let cookie: string | undefined;
let accountEnsured: boolean;

mock.module("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
  notFound: () => {
    throw new Error("notFound");
  },
}));
mock.module("next/cache", () => ({ revalidatePath: () => {} }));
mock.module("next/headers", () => ({ cookies: async () => ({ delete: () => {} }) }));
mock.module("@/lib/auth/server", () => ({ requireUser: async () => ({ id: "user-1" }) }));
mock.module("@/db", () => ({
  getDb: () => ({
    execute: (query: unknown) => query,
    batch: async () => {
      if (!dbAllows) return [{}, { rows: [] }];
      inserted++;
      return [{}, { rows: [{ id: "ws-new" }] }];
    },
  }),
}));
mock.module("./server", () => ({
  PROJECT_COOKIE: "uc_project",
  lockProjects: () => "lock",
  projectCountSql: () => "count",
  projectLimitSql: () => "limit",
  ensureAccount: async () => {
    accountEnsured = true;
  },
  openProject: async (id: string) => {
    cookie = id;
  },
  listWorkspaces: async () =>
    Array.from({ length: projectCount }, (_, i) => ({ id: `ws-${i + 1}`, subscriptionStatus: status })),
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
    dbAllows = true;
    inserted = 0;
    cookie = undefined;
    accountEnsured = false;
  });

  test("Free creates its first project and opens it", async () => {
    await expect(create()).rejects.toThrow(/^redirect:\/app$/);
    expect(inserted).toBe(1);
    expect(cookie).toBe("ws-new");
    expect(accountEnsured).toBe(true);
  });

  test("Free with one project is sent to billing, and nothing is created", async () => {
    projectCount = 1;
    await expect(create()).rejects.toThrow("redirect:/app/billing");
    expect(inserted).toBe(0);
  });

  test("past_due and canceled are Free too", async () => {
    projectCount = 1;
    for (const s of ["past_due", "canceled"] as const) {
      status = s;
      await expect(create()).rejects.toThrow("redirect:/app/billing");
    }
    expect(inserted).toBe(0);
  });

  test("Pro creates up to three, and the fourth is refused", async () => {
    status = "active";
    for (projectCount = 1; projectCount < 3; projectCount++) {
      await expect(create()).rejects.toThrow(/^redirect:\/app$/);
    }
    expect(inserted).toBe(2);
    projectCount = 3;
    await expect(create()).rejects.toThrow("redirect:/app/billing");
    expect(inserted).toBe(2);
  });

  test("a parallel request that took the last slot: the database refuses, and it goes to billing", async () => {
    dbAllows = false;
    await expect(create()).rejects.toThrow("redirect:/app/billing");
    expect(cookie).toBeUndefined();
    expect(accountEnsured).toBe(false);
  });
});
