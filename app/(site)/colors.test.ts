import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { COLORS } from "./colors";

const css = readFileSync(join(import.meta.dir, "../globals.css"), "utf8");

describe("COLORS", () => {
  test("matches the tokens in globals.css", () => {
    for (const [name, hex] of Object.entries(COLORS)) {
      expect(css).toContain(`--color-${name}: ${hex};`);
    }
  });
});
