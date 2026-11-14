import { WIDGET_COPY, type WidgetLang } from "@/lib/widget/copy";

// The public page's own words, in the workspace's language (the same setting as the widget),
// so a changelog written in Spanish doesn't show English dates and tags. Posts are never translated.
type PageCopy = {
  label: string;
  shipped: string;
  coming: string;
  empty: string;
  poweredBy: string;
  tags: { new: string; improved: string; fixed: string; coming: string };
  title: (name: string) => string;
  description: (name: string) => string;
};

const page = (
  lang: WidgetLang,
  copy: Omit<PageCopy, "coming" | "empty" | "tags">,
): PageCopy => ({
  ...copy,
  coming: WIDGET_COPY[lang].tags.coming,
  empty: WIDGET_COPY[lang].empty,
  tags: WIDGET_COPY[lang].tags,
});

export const PAGE_COPY: Record<WidgetLang, PageCopy> = {
  en: {
    ...page("en", {
      label: "Changelog",
      shipped: "Shipped",
      poweredBy: "Powered by",
      title: (name) => `${name} Changelog`,
      description: (name) => `What's new in ${name}: what shipped, and what's coming.`,
    }),
    empty: "No updates yet.",
  },
  es: page("es", {
    label: "Novedades",
    shipped: "Lanzado",
    poweredBy: "Hecho con",
    title: (name) => `Novedades de ${name}`,
    description: (name) => `Novedades de ${name}: lo que lanzamos y lo que viene.`,
  }),
  pt: page("pt", {
    label: "Novidades",
    shipped: "Lançado",
    poweredBy: "Feito com",
    title: (name) => `Novidades de ${name}`,
    description: (name) => `Novidades de ${name}: o que lançamos e o que vem por aí.`,
  }),
  fr: page("fr", {
    label: "Nouveautés",
    shipped: "Livré",
    poweredBy: "Propulsé par",
    title: (name) => `Nouveautés de ${name}`,
    description: (name) => `Les nouveautés de ${name} : ce qui est sorti et ce qui arrive.`,
  }),
  de: page("de", {
    label: "Neuigkeiten",
    shipped: "Veröffentlicht",
    poweredBy: "Bereitgestellt von",
    title: (name) => `Neuigkeiten von ${name}`,
    description: (name) => `Neuigkeiten von ${name}: was neu ist und was als Nächstes kommt.`,
  }),
};
