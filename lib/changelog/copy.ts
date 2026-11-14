import { LABELS } from "@/lib/posts/form";
import { WIDGET_COPY, type TagCopy, type WidgetLang } from "@/lib/widget/copy";

// The public page's own words, in the workspace's language (the same setting as the widget),
// so a changelog written in Spanish doesn't show English dates and tags. Posts are never translated.
// Tags come from the widget's copy, so both say the same thing.
type PageCopy = {
  label: string;
  shipped: string;
  empty: string;
  poweredBy: string;
  tags: TagCopy;
  title: (name: string) => string;
  description: (name: string) => string;
};

export const PAGE_COPY: Record<WidgetLang, PageCopy> = {
  en: {
    label: "Changelog",
    shipped: LABELS.shipped,
    empty: "No updates yet.",
    poweredBy: "Powered by",
    tags: WIDGET_COPY.en.tags,
    title: (name) => `${name} Changelog`,
    description: (name) => `What's new in ${name}: what shipped, and what's coming.`,
  },
  es: {
    label: "Novedades",
    shipped: "Lanzado",
    empty: "Todavía no hay novedades.",
    poweredBy: "Hecho con",
    tags: WIDGET_COPY.es.tags,
    title: (name) => `Novedades de ${name}`,
    description: (name) => `Novedades de ${name}: lo que lanzamos y lo que viene.`,
  },
  pt: {
    label: "Novidades",
    shipped: "Lançado",
    empty: "Ainda não há novidades.",
    poweredBy: "Feito com",
    tags: WIDGET_COPY.pt.tags,
    title: (name) => `Novidades de ${name}`,
    description: (name) => `Novidades de ${name}: o que lançamos e o que vem por aí.`,
  },
  fr: {
    label: "Nouveautés",
    shipped: "Livré",
    empty: "Aucune nouveauté pour le moment.",
    poweredBy: "Propulsé par",
    tags: WIDGET_COPY.fr.tags,
    title: (name) => `Nouveautés de ${name}`,
    description: (name) => `Les nouveautés de ${name} : ce qui est sorti et ce qui arrive.`,
  },
  de: {
    label: "Neuigkeiten",
    shipped: "Veröffentlicht",
    empty: "Noch keine Neuigkeiten.",
    poweredBy: "Bereitgestellt von",
    tags: WIDGET_COPY.de.tags,
    title: (name) => `Neuigkeiten von ${name}`,
    description: (name) => `Neuigkeiten von ${name}: was neu ist und was als Nächstes kommt.`,
  },
};
