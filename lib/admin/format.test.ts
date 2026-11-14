import { describe, expect, test } from "bun:test";
import { postsLabel, subscriptionLabel } from "./format";

const base = { subscriptionStatus: "active" as const, trialEndsAt: null, cancelAtPeriodEnd: false, currentPeriodEnd: null };
const date = new Date("2026-12-01T12:00:00Z");

describe("subscriptionLabel", () => {
  test("stored status as is", () => {
    expect(subscriptionLabel({ ...base, subscriptionStatus: "none" })).toBe("none");
    expect(subscriptionLabel({ ...base, subscriptionStatus: "past_due" })).toBe("past_due");
    expect(subscriptionLabel({ ...base, subscriptionStatus: "canceled" })).toBe("canceled");
    expect(subscriptionLabel(base)).toBe("active");
  });

  test("a trial is active, with its end", () => {
    expect(subscriptionLabel({ ...base, trialEndsAt: date })).toBe("active · trial until Dec 1, 2026");
  });

  test("a cancellation is active until the period ends", () => {
    expect(subscriptionLabel({ ...base, cancelAtPeriodEnd: true, currentPeriodEnd: date })).toBe("active · cancels Dec 1, 2026");
  });

  test("dates only show while active", () => {
    expect(subscriptionLabel({ ...base, subscriptionStatus: "canceled", trialEndsAt: date })).toBe("canceled");
  });
});

test("postsLabel", () => {
  expect(postsLabel(3, 2)).toBe("3 posts · 2 published");
  expect(postsLabel(1, 0)).toBe("1 post · 0 published");
});
