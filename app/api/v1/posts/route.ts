import { type FieldErrors, isJsonObject, parseDraftInput, REQUEST_MAX_BYTES } from "@/lib/api/input";
import { bearerKey, hashApiKey } from "@/lib/api/keys";
import { createDraft, touchApiKey } from "@/lib/api/server";

// Creates a draft post from CI (#86), in the project of the API key. It never publishes:
// a person reviews the draft and publishes it in /app, where the plan applies. Documented in
// the README ("API") and in /app/settings. Errors are { error, message }, and never echo the
// key, the request or anything internal.
type ErrorCode = "unauthorized" | "invalid_json" | "invalid_request" | "too_large" | "rate_limited" | "internal";

const NO_STORE = { "Cache-Control": "no-store" };

function error(status: number, code: ErrorCode, message: string, extra?: { fields?: FieldErrors; headers?: HeadersInit }) {
  return Response.json(
    { error: code, message, ...(extra?.fields && { fields: extra.fields }) },
    { status, headers: { ...NO_STORE, ...extra?.headers } },
  );
}

const unauthorized = () =>
  error(401, "unauthorized", "Send a valid API key as `Authorization: Bearer <key>`.", {
    headers: { "WWW-Authenticate": 'Bearer realm="usechangelog"' },
  });
const tooLarge = () => error(413, "too_large", `Keep the request under ${REQUEST_MAX_BYTES / 1024} KB.`);

// The body as text, or null past REQUEST_MAX_BYTES: read with a cap, so a large chunked
// body (no Content-Length) is never buffered whole.
async function readCapped(request: Request): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > REQUEST_MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(request: Request) {
  try {
    const key = bearerKey(request.headers.get("authorization"));
    if (!key) return unauthorized();

    // Content-Length first, then the real size: the header may be missing or wrong.
    if (Number(request.headers.get("content-length") ?? 0) > REQUEST_MAX_BYTES) return tooLarge();
    const raw = await readCapped(request);
    if (raw === null) return tooLarge();

    const [owner] = await touchApiKey(hashApiKey(key));
    if (!owner) return unauthorized();

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return error(400, "invalid_json", "Send a JSON body.");
    }
    if (!isJsonObject(json)) return error(400, "invalid_request", "Send a JSON object.");
    const input = parseDraftInput(json);
    if (!input.ok) return error(400, "invalid_request", "Some fields are invalid.", { fields: input.errors });

    const result = await createDraft(owner.workspaceId, input.value);
    if (result.kind === "limited") {
      return error(429, "rate_limited", "Too many drafts this hour. Try again later.", {
        headers: { "Retry-After": String(result.retryAfter) },
      });
    }
    return Response.json(
      { id: result.id, status: result.kind === "created" ? "draft" : result.status, created: result.kind === "created" },
      { status: result.kind === "created" ? 201 : 200, headers: NO_STORE },
    );
  } catch (e) {
    // Only the error's name: its message could carry a query with the request's text.
    console.error("[api/v1/posts] failed:", e instanceof Error ? e.name : typeof e);
    return error(500, "internal", "Something went wrong. Try again.");
  }
}
