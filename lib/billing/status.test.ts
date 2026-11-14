import { describe, expect, test } from "bun:test";
import { PLANS } from "./plans";
import { billingFix, canPublish, hasSubscription, isIndexable, mapPolarStatus, trialEnd } from "./status";

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

describe("canPublish (by age, #65)", () => {
  test("Free publishes only the oldest project, whatever its status", () => {
    for (const status of ["past_due", "canceled", "none"] as const) {
      expect(canPublish({ subscriptionStatus: status, rank: 1 })).toBe(true);
      expect(canPublish({ subscriptionStatus: status, rank: 2 })).toBe(false);
    }
  });

  test("Pro (active, trial included) publishes the oldest three", () => {
    for (let rank = 1; rank <= PLANS.pro.projects; rank++) expect(canPublish({ subscriptionStatus: "active", rank })).toBe(true);
    expect(canPublish({ subscriptionStatus: "active", rank: PLANS.pro.projects + 1 })).toBe(false);
  });

  test("going from Pro to Free with three projects leaves only the oldest public", () => {
    const ranks = [1, 2, 3];
    expect(ranks.filter((rank) => canPublish({ subscriptionStatus: "canceled", rank }))).toEqual([1]);
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
  test("a failed payment goes to the portal, anything else to Pro in billing", () => {
    expect(billingFix("past_due").href).toBe("/api/polar/portal");
    expect(billingFix("canceled")).toMatchObject({ href: "/app/billing", cta: "Upgrade to Pro" });
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
    expect(isIndexable({ subscriptionStatus: "none", rank: 1 }, 1)).toBe(true);
    expect(isIndexable({ subscriptionStatus: "active", rank: 1 }, 0)).toBe(false);
  });

  test("never a project the plan doesn't publish, whatever its posts", () => {
    expect(isIndexable({ subscriptionStatus: "canceled", rank: 2 }, 5)).toBe(false);
    expect(isIndexable({ subscriptionStatus: "active", rank: PLANS.pro.projects + 1 }, 5)).toBe(false);
  });
});
