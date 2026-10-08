import type { WidgetLang } from "@/lib/widget/copy";

// JSON-LD for a <script> tag. "<" is escaped so a post body cannot close the script.
export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// The product, on the marketing pages. No price: that comes from Polar, never from code.
export function marketingJsonLd({ name, description, url }: { name: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
  };
}

type ChangelogPost = { title: string; body: string; publishedOn: string | null };

// A public changelog that has published posts. No per-post URL: entries are not separate pages.
export function changelogJsonLd({
  name,
  description,
  url,
  inLanguage,
  posts,
}: {
  name: string;
  description: string;
  url: string;
  inLanguage: WidgetLang;
  posts: ChangelogPost[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name,
    description,
    url,
    inLanguage,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      inLanguage,
      ...(post.publishedOn ? { datePublished: post.publishedOn } : {}),
      ...(post.body.trim() ? { articleBody: post.body } : {}),
    })),
  };
}
