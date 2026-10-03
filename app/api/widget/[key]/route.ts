import type { NextRequest } from "next/server";
import { listPublishedPosts } from "@/lib/posts/server";
import { widgetPayload } from "@/lib/widget/payload";
import { getWorkspaceByWidgetKey } from "@/lib/workspace/server";

// Any site can embed the widget, and the CDN keeps each answer for a minute:
// a new post shows up in the widget within 60 seconds.
const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
