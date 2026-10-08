import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site";
import { Document } from "../document";
import { siteDescription, siteOpenGraph, siteTitle } from "./metadata";
import "../globals.css";

export const metadata: Metadata = {
  // Production's domain (NEXT_PUBLIC_SITE_URL), or a preview's own URL (#13).
  metadataBase: new URL(siteUrl()),
  title: siteTitle,
  description: siteDescription,
  openGraph: siteOpenGraph,
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

// Root layout for the marketing site, sign-in and the app. English throughout.
// Public changelogs live in their own root layout so the document language can follow the workspace.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <Document lang="en">{children}</Document>;
}
