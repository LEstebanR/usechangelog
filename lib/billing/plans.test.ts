import { describe, expect, test } from "bun:test";
import { PLANS, planOf, projectLimit } from "./plans";

describe("planOf", () => {
  test("active is Pro (a free trial is active too)", () => {
    expect(planOf({ subscriptionStatus: "active" })).toBe("pro");
  });

  test("past_due, canceled and none are Free", () => {
    for (const status of ["past_due", "canceled", "none"] as const) expect(planOf({ subscriptionStatus: status })).toBe("free");
  });
});

describe("projectLimit", () => {
  test("Free has 1 project and Pro 3", () => {
    expect(PLANS.free.projects).toBe(1);
    expect(PLANS.pro.projects).toBe(3);
    expect(projectLimit({ subscriptionStatus: "none" })).toBe(1);
    expect(projectLimit({ subscriptionStatus: "past_due" })).toBe(1);
    expect(projectLimit({ subscriptionStatus: "active" })).toBe(3);
  });
});
