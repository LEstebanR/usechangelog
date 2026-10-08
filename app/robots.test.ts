import { describe, expect, test } from "bun:test";
import robots from "./robots";

// How Google reads a rule: a path prefix, where a trailing "$" means "ends here".
const matches = (rule: string, path: string) =>
  rule.endsWith("$") ? path === rule.slice(0, -1) : path.startsWith(rule);
const disallow = [robots().rules].flat().flatMap((r) => [r.disallow ?? []].flat());
const blocked = (path: string) => disallow.some((rule) => matches(rule, path));

describe("robots", () => {
  test.each(["/app", "/app/billing", "/sign-in", "/signup", "/api/widget/x"])("blocks %s", (path) => {
    expect(blocked(path)).toBe(true);
  });

  // Public changelogs whose slug starts like one of our routes stay crawlable.
  test.each(["/", "/apple", "/app-tracker", "/sign-in-kit", "/signupflow", "/privacy"])("allows %s", (path) => {
    expect(blocked(path)).toBe(false);
  });
});
