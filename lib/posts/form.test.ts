import { describe, expect, test } from "bun:test";
import { formData as form } from "@/lib/test/form-data";
import { parsePostForm, toDay } from "./form";

const dayFromToday = (days: number) => toDay(new Date(Date.now() + days * 86_400_000));

describe("parsePostForm", () => {
  test("a valid post has no errors and keeps its fields", () => {
    const state = parsePostForm(form({ title: " Dark mode ", body: "Now live.", category: "improved", type: "coming" }));
    expect(state.errors).toBeUndefined();
    expect(state.values).toMatchObject({ title: "Dark mode", category: "improved", type: "coming", publishedOn: "" });
  });

  test("the title is required and capped at 120 characters", () => {
    expect(parsePostForm(form({ title: "   " })).errors?.title).toBe("Add a title.");
    expect(parsePostForm(form({ title: "a".repeat(121) })).errors?.title).toBe("Keep it under 120 characters.");
    expect(parsePostForm(form({ title: "a".repeat(120) })).errors).toBeUndefined();
  });

  test.each(["2026-02-30", "2026-13-01", "tomorrow", "2026-1-5"])("rejects the date %s", (day) => {
    expect(parsePostForm(form({ title: "x", publishedOn: day })).errors?.publishedOn).toBe("Use a valid date.");
  });

  test("an unknown intent, category or type falls back to the default", () => {
    const state = parsePostForm(form({ title: "x", intent: "delete", category: "bug", type: "draft" }));
    expect(state.intent).toBe("save");
    expect(state.values.category).toBe("new");
    expect(state.values.type).toBe("shipped");
  });

  test("the browser's today counts within a day of UTC, otherwise the UTC day is used", () => {
    expect(parsePostForm(form({ title: "x", today: dayFromToday(1) })).today).toBe(dayFromToday(1));
    expect(parsePostForm(form({ title: "x", today: dayFromToday(-1) })).today).toBe(dayFromToday(-1));
    expect(parsePostForm(form({ title: "x", today: dayFromToday(3) })).today).toBe(dayFromToday(0));
    expect(parsePostForm(form({ title: "x", today: "nope" })).today).toBe(dayFromToday(0));
  });
});
