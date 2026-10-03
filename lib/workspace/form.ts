import { WIDGET_LANGS, type WidgetLang } from "@/lib/widget/copy";
import { NAME_MAX, slugify, validateSlug } from "./slug";

export type WorkspaceFormState = {
  values: { name: string; slug: string; widgetLang: WidgetLang };
  errors?: { name?: string; slug?: string };
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
    ...(!name ? { name: "Add a name." } : name.length > NAME_MAX ? { name: `Keep it under ${NAME_MAX} characters.` } : {}),
    ...(slug.ok ? {} : { slug: slug.error }),
  };
  return Object.keys(errors).length ? { values, errors } : { values };
}
