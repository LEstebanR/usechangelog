import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { canPublish } from "@/lib/billing/status";
import { ogCard, OG_POSTS, type OgTag } from "@/lib/changelog/og";
import { listPublishedPosts } from "@/lib/posts/server";
import { changelogLanguage } from "@/lib/seo/language";
import { getWorkspaceBySlug } from "@/lib/workspace/server";
import { brand } from "../../(site)/content";

// A changelog's share image (#73): its name, its latest posts and its words, in its language.
// Same rule as the page: unknown or unpublished workspaces 404. A 60-second CDN cache, like
// the widget's, so a burst of crawlers shares one render and a project that stops publishing
// stops showing within a minute. The page links it with ?v= its content, so a new post
// gets a new URL on platforms that cache images by URL.
export const dynamic = "force-dynamic";

// Satori needs the font files themselves (TTF), read once per instance; a failed read is
// retried on the next request. next.config.ts traces assets/fonts into this route.
const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
let fonts: Promise<Buffer[]> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all([
    font("FunnelDisplay-Medium.ttf"),
    font("InstrumentSans-Regular.ttf"),
    font("InstrumentSans-Medium.ttf"),
  ]).catch((error) => {
    fonts = undefined;
    throw error;
  }));

// The site's palette (app/globals.css) and the tag colors of app/(site)/tag.tsx, as hex:
// Satori doesn't read Tailwind classes.
const ink = "#0e1116";
const graphite = "#5a6170";
const hairline = "#e4e7ec";
const TAGS: Record<OgTag, { color: string; background: string; border: string }> = {
  new: { color: "#ffffff", background: "#1d3a8f", border: "1px solid #1d3a8f" },
  improved: { color: "#5b3fa8", background: "#f1edfa", border: "1px solid #c8bce4" },
  fixed: { color: "#17694a", background: "#eaf5ef", border: "1px solid #a4c9b8" },
  coming: { color: graphite, background: "transparent", border: `1px dashed ${graphite}` },
};

export async function GET(_request: Request, { params }: RouteContext<"/[slug]/og">) {
  const workspace = await getWorkspaceBySlug((await params).slug.toLowerCase());
  if (!workspace || !canPublish(workspace)) return new Response("Not found", { status: 404 });

  const [posts, [display, sans, sansMedium]] = await Promise.all([
    listPublishedPosts(workspace.id, { limit: OG_POSTS }),
    loadFonts(),
  ]);
  const card = ogCard({ name: workspace.name, lang: changelogLanguage(workspace.widgetLang), posts });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          background: "#ffffff",
          // The landing's faint vertical grid.
          backgroundImage: "linear-gradient(to right, #f1f2f5 1px, transparent 1px)",
          backgroundSize: "88px 100%",
          backgroundPosition: "72px 0",
          color: ink,
          fontFamily: "Instrument Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: graphite }}>
            <div style={{ width: 14, height: 14, background: "#1d3a8f" }} />
            {card.label}
          </div>
          <div style={{ display: "flex", gap: 8, color: graphite, fontSize: 24 }}>
            {card.poweredBy}
            <span style={{ fontFamily: "Funnel Display", color: ink }}>{brand}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            fontFamily: "Funnel Display",
            fontSize: card.nameSize,
            lineHeight: 1.02,
            // A long name without spaces breaks instead of running off the card.
            wordBreak: "break-word",
            letterSpacing: "-0.03em",
          }}
        >
          {card.name}
        </div>

        {card.posts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${ink}`, paddingTop: 28, gap: 18 }}>
            {card.posts.map((post, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* A fixed column, so titles line up whatever the tag's length. */}
                <div style={{ display: "flex", flexShrink: 0, width: 210 }}>
                <div
                  style={{
                    display: "flex",
                    whiteSpace: "nowrap",
                    padding: "4px 12px",
                    fontFamily: "Instrument Sans",
                    fontWeight: 500,
                    fontSize: 16,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    ...TAGS[post.tag],
                  }}
                >
                  {post.label}
                </div>
                </div>
                <div style={{ display: "flex", fontSize: 28, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</div>
              </div>
            ))}
          </div>
        )}
        {card.posts.length === 0 && <div style={{ display: "flex", borderTop: `1px solid ${hairline}` }} />}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Funnel Display", data: display, weight: 500, style: "normal" },
        { name: "Instrument Sans", data: sans, weight: 400, style: "normal" },
        { name: "Instrument Sans", data: sansMedium, weight: 500, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60" },
    },
  );
}
