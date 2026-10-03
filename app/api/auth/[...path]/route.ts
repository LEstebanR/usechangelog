import { getAuthHandlers } from "@/lib/auth/server";

type Context = Parameters<ReturnType<typeof getAuthHandlers>["GET"]>[1];

export function GET(request: Request, context: Context) {
  return getAuthHandlers().GET(request, context);
}

export function POST(request: Request, context: Context) {
  return getAuthHandlers().POST(request, context);
}
