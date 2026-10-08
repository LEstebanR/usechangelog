import type { MetadataRoute } from "next";
import { listPublicChangelogs } from "@/lib/posts/server";
import { legal } from "./(site)/content";
import { siteUrl } from "@/lib/site";

// Refreshed every hour: a changelog's first post shows up here within the hour (#19).
export const revalidate = 3600;

// The landing, the legal pages and every public changelog with a post. Nothing behind sign-in,
// and no workspace without an active subscription. Without a database (CI builds, a fresh
// clone) it lists only the fixed pages.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...legal.links.map(({ href }) => ({ url: `${base}${href}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
  if (!process.env.DATABASE_URL) return pages;
  const changelogs = await listPublicChangelogs();
  return [
    ...pages,
    ...changelogs.map(({ slug, lastPost }) => ({
      url: `${base}/${slug}`,
      lastModified: lastPost ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
