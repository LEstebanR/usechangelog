import { WIDGET_LANGS, type WidgetLang } from "@/lib/widget/copy";

// The workspace's language setting (en, es, pt, fr or de). It is the only per-workspace
// language in the data model. English stays the default when it is missing.
const languages = new Set<string>(WIDGET_LANGS);

// The Open Graph locale for each language (og:locale wants language_TERRITORY).
const OG_LOCALES: Record<WidgetLang, string> = { en: "en_US", es: "es_ES", pt: "pt_BR", fr: "fr_FR", de: "de_DE" };

export const ogLocale = (lang: WidgetLang) => OG_LOCALES[lang];

export function changelogLanguage(lang: string | null | undefined): WidgetLang {
  return lang && languages.has(lang) ? (lang as WidgetLang) : "en";
}
