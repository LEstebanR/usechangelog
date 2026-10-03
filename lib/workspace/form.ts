import { NAME_MAX, slugify, validateSlug } from "./slug";

// The widget's own words (button, title, dates): English or Spanish. Posts are never translated.
export const WIDGET_LANGS = ["en", "es"] as const;
export type WidgetLang = (typeof WIDGET_LANGS)[number];

export type WorkspaceFormState = {
  values: { name: string; slug: string; widgetLang: WidgetLang };
  errors?: { name?: string; slug?: string };
  saved?: boolean;
};

// Reads and validates the form. An empty slug falls back to one built from the name.
export function parseForm(formData: FormData): WorkspaceFormState {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim() || slugify(name);
  const slug = validateSlug(slugInput);
  const lang = formData.get("widgetLang");
  const widgetLang: WidgetLang = WIDGET_LANGS.includes(lang as WidgetLang) ? (lang as WidgetLang) : "en";
  const values = { name, slug: slug.ok ? slug.slug : slugInput, widgetLang };
  const errors = {
    ...(name.length < 1 || name.length > NAME_MAX ? { name: `Use 1–${NAME_MAX} characters.` } : {}),
    ...(slug.ok ? {} : { slug: slug.error }),
  };
  return Object.keys(errors).length ? { values, errors } : { values };
}
