import { describe, expect, test } from "bun:test";
import { billingFix, canPublish, hasSubscription, isIndexable, mapPolarStatus, PUBLIC_STATUSES, trialEnd } from "./status";

describe("mapPolarStatus", () => {
  test("active stays active, also when it cancels at the period end", () => {
    // cancel_at_period_end doesn't change Polar's status, so it isn't an input here.
    expect(mapPolarStatus("active")).toBe("active");
  });

  test("a free trial publishes like active", () => {
    expect(mapPolarStatus("trialing")).toBe("active");
  });

  test("past_due stays past_due", () => {
    expect(mapPolarStatus("past_due")).toBe("past_due");
  });

  test("everything else is canceled", () => {
    for (const status of ["canceled", "unpaid", "incomplete_expired", "paused", "incomplete", "new"]) {
      expect(mapPolarStatus(status)).toBe("canceled");
    }
  });

  test("no subscription is none", () => {
    expect(mapPolarStatus(null)).toBe("none");
    expect(mapPolarStatus(undefined)).toBe("none");
    expect(mapPolarStatus("")).toBe("none");
  });
});

describe("canPublish", () => {
  test("only active publishes", () => {
    expect(canPublish({ subscriptionStatus: "active" })).toBe(true);
    for (const status of ["past_due", "canceled", "none"] as const) {
      expect(canPublish({ subscriptionStatus: status })).toBe(false);
    }
  });
});

describe("hasSubscription", () => {
  test("active and past_due have one; canceled and none can check out again", () => {
    expect(hasSubscription({ subscriptionStatus: "active" })).toBe(true);
    expect(hasSubscription({ subscriptionStatus: "past_due" })).toBe(true);
    expect(hasSubscription({ subscriptionStatus: "canceled" })).toBe(false);
    expect(hasSubscription({ subscriptionStatus: "none" })).toBe(false);
  });
});

describe("billingFix", () => {
  test("a failed payment goes to the portal, anything else to billing", () => {
    expect(billingFix("past_due").href).toBe("/api/polar/portal");
    expect(billingFix("canceled").href).toBe("/app/billing");
    expect(billingFix("none").href).toBe("/app/billing");
  });
});

describe("trialEnd", () => {
  test("only while trialing", () => {
    expect(trialEnd({ status: "trialing", trial_end: "2026-10-22T00:00:00Z" })?.toISOString()).toBe("2026-10-22T00:00:00.000Z");
    expect(trialEnd({ status: "active", trial_end: "2026-10-22T00:00:00Z" })).toBeNull();
    expect(trialEnd({ status: "trialing", trial_end: null })).toBeNull();
  });
});

describe("isIndexable", () => {
  test("a changelog that can publish and has a post", () => {
    expect(isIndexable({ subscriptionStatus: "active" }, 1)).toBe(true);
    expect(isIndexable({ subscriptionStatus: "active" }, 0)).toBe(false);
  });

  test("never without a status that publishes, whatever its posts", () => {
    for (const status of ["past_due", "canceled", "none"] as const) {
      expect(isIndexable({ subscriptionStatus: status }, 5)).toBe(false);
    }
  });

  test("follows PUBLIC_STATUSES, the list the sitemap query uses", () => {
    for (const status of PUBLIC_STATUSES) expect(isIndexable({ subscriptionStatus: status }, 1)).toBe(true);
  });
});
