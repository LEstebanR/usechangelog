import { brand } from "./(site)/content";
import { siteDescription } from "./(site)/metadata";
import { jsonLdScript, marketingJsonLd } from "@/lib/seo/json-ld";
import { siteUrl } from "@/lib/site";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(data) }} />;
}

// SoftwareApplication for the landing, privacy and terms. Not the app or sign-in.
export function MarketingJsonLd() {
  return <JsonLd data={marketingJsonLd({ name: brand, description: siteDescription, url: `${siteUrl()}/` })} />;
}
