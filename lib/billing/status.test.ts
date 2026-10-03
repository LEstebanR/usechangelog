import { describe, expect, test } from "bun:test";
import { canPublish, mapPolarStatus } from "./status";

describe("mapPolarStatus", () => {
  test("active stays active, also when it cancels at the period end", () => {
    // cancel_at_period_end doesn't change Polar's status, so it isn't an input here.
    expect(mapPolarStatus("active")).toBe("active");
  });

  test("past_due stays past_due", () => {
    expect(mapPolarStatus("past_due")).toBe("past_due");
  });

  test("everything else is canceled", () => {
    for (const status of ["canceled", "unpaid", "incomplete_expired", "paused", "incomplete", "trialing", "new"]) {
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
