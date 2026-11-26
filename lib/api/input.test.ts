import { describe, expect, test } from "bun:test";
import { BODY_MAX, TITLE_MAX } from "@/lib/posts/form";
import { parseDraftInput } from "./input";

const valid = { title: " Faster exports ", body: "Exports run in the background.\n", category: "improved", source: { repo: "Acme/Web-App", pr: 42 } };

describe("parseDraftInput (#86)", () => {
  test("a valid request: trimmed text and the pull request as a lowercased ref", () => {
    expect(parseDraftInput(valid)).toEqual({
      ok: true,
      value: { title: "Faster exports", body: "Exports run in the background.", category: "improved", sourceRef: "github:acme/web-app#42" },
    });
  });

  test("the body is optional", () => {
    expect(parseDraftInput({ ...valid, body: undefined })).toMatchObject({ ok: true, value: { body: "" } });
    expect(parseDraftInput({ ...valid, body: null })).toMatchObject({ ok: true, value: { body: "" } });
  });

  test("status, type, date and project are ignored: it can only be a draft of its key's project", () => {
    const result = parseDraftInput({ ...valid, status: "published", type: "coming", publishedOn: "2026-01-01", workspaceId: "other" });
    expect(result.ok && Object.keys(result.value).sort()).toEqual(["body", "category", "sourceRef", "title"]);
  });

  test("the post form's limits", () => {
    expect(parseDraftInput({ ...valid, title: "  " })).toEqual({ ok: false, errors: { title: "Add a title." } });
    expect(parseDraftInput({ ...valid, title: "x".repeat(TITLE_MAX + 1) })).toMatchObject({ ok: false, errors: { title: expect.any(String) } });
    expect(parseDraftInput({ ...valid, title: "x".repeat(TITLE_MAX) }).ok).toBe(true);
    expect(parseDraftInput({ ...valid, body: "x".repeat(BODY_MAX + 1) })).toMatchObject({ ok: false, errors: { body: expect.any(String) } });
    expect(parseDraftInput({ ...valid, body: 42 })).toMatchObject({ ok: false, errors: { body: expect.any(String) } });
  });

  test("only new, improved or fixed", () => {
    for (const category of ["New", "shipped", "", undefined, 1]) {
      expect(parseDraftInput({ ...valid, category })).toMatchObject({ ok: false, errors: { category: expect.any(String) } });
    }
  });

  test("the pull request must be a GitHub repo and a positive integer", () => {
    for (const source of [undefined, {}, { repo: "acme", pr: 1 }, { repo: "acme/web/x", pr: 1 }, { repo: "../etc", pr: 1 }, { repo: "acme/web", pr: 0 }, { repo: "acme/web", pr: 1.5 }, { repo: "acme/web", pr: "1" }]) {
      expect(parseDraftInput({ ...valid, source })).toMatchObject({ ok: false, errors: { source: expect.any(String) } });
    }
  });

  test("anything but an object is refused", () => {
    for (const json of [null, [], "x", 1]) expect(parseDraftInput(json).ok).toBe(false);
  });
});
