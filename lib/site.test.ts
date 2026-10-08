import { describe, expect, test } from "bun:test";
import { siteUrl } from "./site";

describe("siteUrl", () => {
  test("Production's configured URL wins, without a trailing slash", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.usechangelog.com/", VERCEL_URL: "x.vercel.app" })).toBe(
      "https://www.usechangelog.com",
    );
  });

  test("a preview uses its own deployment URL", () => {
    expect(siteUrl({ VERCEL_URL: "usechangelog-abc-team.vercel.app" })).toBe("https://usechangelog-abc-team.vercel.app");
  });

  test("locally, localhost", () => {
    expect(siteUrl({})).toBe("http://localhost:3000");
  });
});
