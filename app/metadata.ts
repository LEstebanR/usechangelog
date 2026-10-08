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
