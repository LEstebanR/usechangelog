import type { NextRequest } from "next/server";
import { listPublishedPosts } from "@/lib/posts/server";
import { widgetPayload } from "@/lib/widget/payload";
import { getWorkspaceByWidgetKey } from "@/lib/workspace/server";

// Any site can embed the widget, and the CDN keeps each answer for a minute: a new post,
// or turning the widget off, shows within 60 seconds. No stale-while-revalidate on purpose:
// it would serve an answer up to minutes old to the first visitor after the minute.
const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, s-maxage=60",
};

export async function GET(request: NextRequest, { params }: RouteContext<"/api/widget/[key]">) {
  const workspace = await getWorkspaceByWidgetKey((await params).key);
  if (!workspace) return Response.json({}, { status: 404, headers: HEADERS });
  // Turned off in settings: the snippet stays on the site and shows nothing (#16 reuses this).
  if (!workspace.widgetEnabled) return Response.json({ enabled: false }, { headers: HEADERS });

  const posts = await listPublishedPosts(workspace.id, { limit: 10 });
  const body = widgetPayload({
    workspace,
    posts,
    origin: request.nextUrl.origin,
    lang: request.nextUrl.searchParams.get("lang"),
  });
  return Response.json(body, { headers: HEADERS });
}
