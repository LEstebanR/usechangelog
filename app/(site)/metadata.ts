import { siteUrl } from "@/lib/site";
import { brand, hero } from "./content";

// The site's shared metadata, used by the marketing root layout. A page that sets its own
// `openGraph` replaces the layout's whole object, so the shared image is attached here.
// It lives in public/ (one URL, no metadata-file convention) because that convention is
// dropped as soon as a page sets openGraph.
export const siteTitle = `${brand} — ${hero.headline.replace(/\.$/, "")}`;
export const siteDescription = "A public changelog and an in-app widget for indie hackers and small product teams.";

export const ogImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "UseChangelog: Tell your users what shipped. Sample changelog entries tagged New, Improved and Fixed.",
} as const;

export const siteOpenGraph = {
  type: "website",
  siteName: brand,
  title: siteTitle,
  description: siteDescription,
} as const;

// A page's own title, description, canonical, Open Graph and Twitter card (#19). `path` is
// resolved against metadataBase, so it points to production or to the preview.
export const pageMetadata = ({ title, description, path }: { title: string; description: string; path: string }) => ({
  // On the same object as the relative image, so the image resolves against the site URL
  // even when this page replaces the layout's Open Graph.
  metadataBase: new URL(siteUrl()),
  title,
  description,
  alternates: { canonical: path },
  openGraph: { ...siteOpenGraph, title, description, url: path, images: [ogImage] },
  twitter: { card: "summary_large_image" as const, title, description, images: [ogImage.url] },
});

export const signInMetadata = {
  ...pageMetadata({
    title: "Sign in — UseChangelog",
    description: "Sign in to UseChangelog. Enter your email and we'll send you a link.",
    path: "/sign-in",
  }),
  robots: { index: false, follow: false },
};
