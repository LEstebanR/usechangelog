// What POST /api/v1/posts accepts (#86), parsed and validated. Pure, so it's tested without
// a server. The text follows the same limits as the post form, and is rendered with the same
// safe Markdown on the public page and the widget.

import { BODY_MAX, CATEGORIES, type Category, TITLE_MAX } from "@/lib/posts/form";

// Larger requests are refused before parsing: a title and a body of BODY_MAX characters fit
// in far less, even with multi-byte characters.
export const REQUEST_MAX_BYTES = 64 * 1024;
// GitHub's repository names: "owner/name", letters, digits, "-", "_" and ".".
const REPO = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9._-]{1,100}$/;
const PR_MAX = 2_147_483_647;

export type DraftInput = {
  title: string;
  body: string;
  category: Category;
  // "github:owner/repo#123", lowercased: GitHub names are case-insensitive.
  sourceRef: string;
};

export type FieldErrors = Partial<Record<"title" | "body" | "category" | "source", string>>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Only these fields are read: anything else (a status, a date, a type, a project) is ignored,
// so a request can never publish a post or pick another project.
export function parseDraftInput(json: unknown): { ok: true; value: DraftInput } | { ok: false; errors: FieldErrors } {
  if (!isObject(json)) return { ok: false, errors: { title: "Send a JSON object." } };
  const errors: FieldErrors = {};

  const title = typeof json.title === "string" ? json.title.trim() : "";
  if (!title) errors.title = "Add a title.";
  else if (title.length > TITLE_MAX) errors.title = `Keep it under ${TITLE_MAX} characters.`;

  const body = json.body === undefined || json.body === null ? "" : json.body;
  if (typeof body !== "string") errors.body = "The body must be a string.";
  else if (body.length > BODY_MAX) errors.body = `Keep it under ${BODY_MAX.toLocaleString("en-US")} characters.`;

  const category = CATEGORIES.find((c) => c === json.category);
  if (!category) errors.category = `Use one of: ${CATEGORIES.join(", ")}.`;

  const source = isObject(json.source) ? json.source : {};
  const repo = typeof source.repo === "string" ? source.repo : "";
  const pr = source.pr;
  if (!REPO.test(repo) || !Number.isInteger(pr) || (pr as number) < 1 || (pr as number) > PR_MAX) {
    errors.source = 'Send the pull request as { "repo": "owner/name", "pr": 123 }.';
  }

  if (Object.keys(errors).length || !category || typeof body !== "string") return { ok: false, errors };
  return {
    ok: true,
    value: { title, body: body.trim(), category, sourceRef: `github:${repo.toLowerCase()}#${pr}` },
  };
}
