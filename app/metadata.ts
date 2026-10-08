import { brand, hero } from "./content";

// The site's shared metadata, used by the root layout. A page that sets its own `openGraph`
// replaces the layout's whole object, so it spreads this one and adds what's its own.
export const siteTitle = `${brand} — ${hero.headline.replace(/\.$/, "")}`;
export const siteDescription = "A public changelog and an in-app widget for indie hackers and small product teams.";

export const siteOpenGraph = {
  type: "website",
  siteName: brand,
  title: siteTitle,
  description: siteDescription,
} as const;

// A page's own title, description, canonical and Open Graph (#19). `path` is resolved
// against metadataBase, so it points to production or to the preview.
export const pageMetadata = ({ title, description, path }: { title: string; description: string; path: string }) => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: { ...siteOpenGraph, title, description, url: path },
});
