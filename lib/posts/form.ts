// Pure post form parsing and the labels the app shows. No server imports, so #12 can test it.

export const CATEGORIES = ["new", "improved", "fixed"] as const;
export const TYPES = ["shipped", "coming"] as const;
export const TITLE_MAX = 120;
export const BODY_MAX = 10_000;

export type Category = (typeof CATEGORIES)[number];
export type PostType = (typeof TYPES)[number];
type Intent = "save" | "publish" | "unpublish";

type PostValues = {
  title: string;
  body: string;
  category: Category;
  type: PostType;
  // "YYYY-MM-DD" or "" when there's no date yet.
  publishedOn: string;
};

export type PostFormState = {
  values: PostValues;
  errors?: { title?: string; body?: string; publishedOn?: string };
  saved?: boolean;
};

// What the app calls each category and type (the landing's tag names).
export const LABELS = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
  shipped: "Shipped",
  coming: "Coming soon",
} as const satisfies Record<Category | PostType, string>;

const oneOf = <T extends string>(list: readonly T[], value: unknown, fallback: T): T =>
  list.includes(value as T) ? (value as T) : fallback;

export function parsePostForm(formData: FormData): PostFormState & { intent: Intent; today: Date } {
  const values: PostValues = {
    title: String(formData.get("title") ?? "").trim(),
    body: String(formData.get("body") ?? ""),
    category: oneOf(CATEGORIES, formData.get("category"), "new"),
    type: oneOf(TYPES, formData.get("type"), "shipped"),
    publishedOn: String(formData.get("publishedOn") ?? "").trim(),
  };
  const intent = oneOf(["save", "publish", "unpublish"] as const, formData.get("intent"), "save");
  const today = todayFor(String(formData.get("today") ?? ""));

  const errors: NonNullable<PostFormState["errors"]> = {};
  if (values.title.length < 1 || values.title.length > TITLE_MAX) {
    errors.title = `Use 1–${TITLE_MAX} characters.`;
  }
  if (values.body.length > BODY_MAX) errors.body = `Keep it under ${BODY_MAX.toLocaleString("en-US")} characters.`;
  if (values.publishedOn && !dateFromDay(values.publishedOn)) errors.publishedOn = "Use a valid date.";

  return Object.keys(errors).length ? { values, errors, intent, today } : { values, intent, today };
}

// "Today" as the author's browser sees it, sent by the form. Trusted only within a
// day of UTC (every time zone fits); without it, the UTC day.
function todayFor(local: string): Date {
  const utc = dateFromDay(dayFromDate(new Date()))!;
  const day = dateFromDay(local);
  return day && Math.abs(day.getTime() - utc.getTime()) <= 86_400_000 ? day : utc;
}

// Dates are days: "2026-10-03" is stored as midnight UTC, so it never shifts with time zones.
export function dateFromDay(day: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const date = new Date(`${day}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== day ? null : date;
}

export const dayFromDate = (date: Date | null) => (date ? date.toISOString().slice(0, 10) : "");

export const formatDay = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
