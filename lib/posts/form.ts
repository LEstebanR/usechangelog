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

export function parsePostForm(formData: FormData): PostFormState & { intent: Intent; today: string } {
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
  if (values.publishedOn && !isDay(values.publishedOn)) errors.publishedOn = "Use a valid date.";

  return Object.keys(errors).length ? { values, errors, intent, today } : { values, intent, today };
}

// "Today" as the author's browser sees it, sent by the form. Trusted only within a
// day of UTC (every time zone fits); without it, the UTC day.
function todayFor(local: string): string {
  const utc = toDay(new Date());
  const offset = isDay(local) ? Math.abs(Date.parse(local) - Date.parse(utc)) : Infinity;
  return offset <= 86_400_000 ? local : utc;
}

// Dates are days, "YYYY-MM-DD", stored in a Postgres `date` column.
export function isDay(day: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && toDay(new Date(`${day}T00:00:00Z`)) === day;
}

export const toDay = (date: Date) => (Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10));

export const formatDay = (day: string) =>
  new Date(`${day}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
