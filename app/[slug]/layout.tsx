import type { Metadata, Viewport } from "next";
import { changelogLanguage } from "@/lib/seo/language";
import { siteUrl } from "@/lib/site";
import { getWorkspaceBySlug } from "@/lib/workspace/server";
import { Document } from "../document";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

// Its own root layout, so <html lang> can follow the workspace. The marketing site stays English.
export default async function ChangelogLayout({ children, params }: LayoutProps<"/[slug]">) {
  const slug = (await params).slug.toLowerCase();
  const workspace = await getWorkspaceBySlug(slug);
  return <Document lang={changelogLanguage(workspace?.widgetLang)}>{children}</Document>;
}
