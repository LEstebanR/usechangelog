import { WIDGET_LANGS, type WidgetLang } from "@/lib/widget/copy";

// The workspace's language setting (en, es, pt, fr or de). It is the only per-workspace
// language in the data model. English stays the default when it is missing.
const languages = new Set<string>(WIDGET_LANGS);

export function changelogLanguage(lang: string | null | undefined): WidgetLang {
  return lang && languages.has(lang) ? (lang as WidgetLang) : "en";
}
