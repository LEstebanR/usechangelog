// The widget's own words, in every language a workspace can choose.
// Shared by the header preview and the widget (#8). Posts are never translated.
export const WIDGET_LANGS = ["en", "es", "pt", "fr", "de"] as const;
export type WidgetLang = (typeof WIDGET_LANGS)[number];

export const LANG_NAMES: Record<WidgetLang, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
};

type Copy = {
  button: string;
  title: string;
  all: string;
  close: string;
  empty: string;
  tags: { new: string; improved: string; fixed: string; coming: string };
};

export const WIDGET_COPY: Record<WidgetLang, Copy> = {
  en: {
    button: "What's new", title: "What's new", all: "View all updates", close: "Close",
    empty: "No published updates yet.",
    tags: { new: "New", improved: "Improved", fixed: "Fixed", coming: "Coming soon" },
  },
  es: {
    button: "Novedades", title: "Novedades", all: "Ver todas", close: "Cerrar",
    empty: "Todavía no hay novedades publicadas.",
    tags: { new: "Nuevo", improved: "Mejorado", fixed: "Corregido", coming: "Próximamente" },
  },
  pt: {
    button: "Novidades", title: "Novidades", all: "Ver todas", close: "Fechar",
    empty: "Ainda não há novidades publicadas.",
    tags: { new: "Novo", improved: "Melhorado", fixed: "Corrigido", coming: "Em breve" },
  },
  fr: {
    button: "Nouveautés", title: "Nouveautés", all: "Voir toutes les mises à jour", close: "Fermer",
    empty: "Aucune nouveauté publiée pour le moment.",
    tags: { new: "Nouveau", improved: "Amélioré", fixed: "Corrigé", coming: "Bientôt" },
  },
  de: {
    button: "Neuigkeiten", title: "Neuigkeiten", all: "Alle Neuigkeiten ansehen", close: "Schließen",
    empty: "Noch keine Neuigkeiten veröffentlicht.",
    tags: { new: "Neu", improved: "Verbessert", fixed: "Behoben", coming: "Demnächst" },
  },
};
