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
// Callbacks passed to after() (#76), run by hand: Next runs them after the response.
let afterCallbacks: (() => unknown)[];
let welcomed: unknown[][];

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
mock.module("next/server", () => ({ after: (callback: () => unknown) => afterCallbacks.push(callback) }));
mock.module("@/lib/site", () => ({
  getOrigin: async () => "https://www.usechangelog.com",
  publicUrl: async (slug: string) => `https://www.usechangelog.com/${slug}`,
}));
mock.module("@/lib/email/welcome", () => ({
  sendWelcomeEmail: async (...args: unknown[]) => {
    welcomed.push(args);
  },
}));
mock.module("@/lib/auth/server", () => ({ requireUser: async () => ({ id: "user-1", email: "someone@example.com" }) }));
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
    afterCallbacks = [];
    welcomed = [];
  });

  test("Free creates its first project and opens it", async () => {
    await expect(create()).rejects.toThrow(/^redirect:\/app$/);
    expect(inserted).toBe(1);
    expect(cookie).toBe("ws-new");
    expect(accountEnsured).toBe(true);
  });

  // The once-per-account check lives in sendWelcomeEmail (lib/email/welcome.test.ts).
  test("schedules the welcome email after the response, with the project's links", async () => {
    await expect(create()).rejects.toThrow(/^redirect:\/app$/);
    expect(welcomed).toEqual([]);
    await Promise.all(afterCallbacks.map((callback) => callback()));
    expect(welcomed).toEqual([
      [
        "user-1",
        "someone@example.com",
        { name: "Acme", publicUrl: "https://www.usechangelog.com/acme", appUrl: "https://www.usechangelog.com/app" },
      ],
    ]);
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
    expect(afterCallbacks).toEqual([]);
  });
});
