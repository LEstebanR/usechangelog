import { beforeEach, describe, expect, mock, test } from "bun:test";

// revokeSubscriptionsInPolar with Polar's SDK mocked (`bun test --isolate`).
let subscriptions: { id: string; status: string }[];
let listedFor: unknown;
let revoked: string[];

mock.module("@polar-sh/sdk/2026-10", () => ({ createPolarCore: () => ({}) }));
mock.module("@polar-sh/sdk/2026-10/services/products", () => ({ getProducts: () => async () => ({}) }));
mock.module("@polar-sh/sdk/2026-10/services/subscriptions", () => ({
  listSubscriptions: () => async (query: unknown) => {
    listedFor = query;
    return { items: subscriptions };
  },
  revokeSubscriptions: () => async (id: string) => {
    revoked.push(id);
  },
}));

process.env.POLAR_ACCESS_TOKEN = "polar_test";
process.env.POLAR_PRODUCT_ID = "00000000-0000-0000-0000-000000000000";
process.env.POLAR_SERVER = "sandbox";
const { revokeSubscriptionsInPolar } = await import("./polar");

describe("revokeSubscriptionsInPolar", () => {
  beforeEach(() => {
    revoked = [];
    listedFor = undefined;
  });

  test("revokes the workspace's trialing, active and past_due subscriptions, and only those", async () => {
    subscriptions = [
      { id: "trial", status: "trialing" },
      { id: "live", status: "active" },
      { id: "late", status: "past_due" },
      { id: "done", status: "canceled" },
      { id: "never", status: "incomplete_expired" },
    ];
    expect(await revokeSubscriptionsInPolar("ws-1")).toBe(3);
    expect(listedFor).toMatchObject({ external_customer_id: "ws-1" });
    expect(revoked.sort()).toEqual(["late", "live", "trial"]);
  });

  test("with nothing live, it revokes nothing", async () => {
    subscriptions = [{ id: "done", status: "canceled" }];
    expect(await revokeSubscriptionsInPolar("ws-1")).toBe(0);
    expect(revoked).toEqual([]);
  });
});
