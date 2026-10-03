import { renderMarkdown } from "@/lib/markdown";
import { oneOf, type Category, type PostType } from "@/lib/posts/form";
import { WIDGET_COPY, WIDGET_LANGS, type WidgetLang } from "./copy";

type Post = { id: string; title: string; body: string; category: Category; type: PostType; publishedOn: string | null };

// What GET /api/widget/[key] returns. Pure, so it can be tested without a database.
// `lang` from the embed (`<script lang="…">`) wins over the workspace's choice; anything
// unknown falls back to it. The chrome's words come along, so widget.js carries no copy.
export function widgetPayload({ workspace, posts, origin, lang }: {
  workspace: { name: string; slug: string; widgetLang: WidgetLang };
  posts: Post[];
  origin: string;
  lang: string | null;
}) {
  const resolved = oneOf(WIDGET_LANGS, lang, workspace.widgetLang);
  return {
    name: workspace.name,
    url: `${origin}/${workspace.slug}`,
    lang: resolved,
    copy: WIDGET_COPY[resolved],
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      html: renderMarkdown(post.body),
      category: post.category,
      type: post.type,
      publishedOn: post.publishedOn,
    })),
  };
}
