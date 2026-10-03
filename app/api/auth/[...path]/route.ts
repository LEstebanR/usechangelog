import { getAuth } from "@/lib/auth/server";

type Handlers = ReturnType<ReturnType<typeof getAuth>["handler"]>;
type Context = Parameters<Handlers["GET"]>[1];

let handlers: Handlers | undefined;

// Built on first request so the route can be imported at build time without env vars.
function getHandlers() {
  handlers ??= getAuth().handler();
  return handlers;
}

export function GET(request: Request, context: Context) {
  return getHandlers().GET(request, context);
}

export function POST(request: Request, context: Context) {
  return getHandlers().POST(request, context);
}
