import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Crawlers get the landing, the legal pages and the public changelogs; never the app,
// sign-in or the API (#19). Previews are kept out by Vercel's own noindex header.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app", "/sign-in", "/signup", "/api/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
