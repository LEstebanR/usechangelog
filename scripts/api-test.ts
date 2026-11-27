// End-to-end check of POST /api/v1/posts (#86) against a running deployment.
//   bun run api-test [base-url]
// <base-url> is http://localhost:3000 by default, or a preview. It creates a throwaway project
// with an API key in the database of .env.local (develop), sends every kind of request, checks
// each answer and what was stored, and deletes the project (and so its posts and key) at the end.
// It refuses production: both its URL and a database on Neon's default branch. For a protected
// preview, set VERCEL_AUTOMATION_BYPASS_SECRET. Exits 1 when a check fails. Never prints the key.
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { apiKeys, posts, workspaces } from "@/db/schema";
import { newApiKey } from "@/lib/api/keys";
import { API_DRAFTS_PER_HOUR } from "@/lib/api/server";
import { previewDatabaseProblem } from "./preview-database";

const base = process.argv[2] ?? "http://localhost:3000";
const PRODUCTION_HOSTS = ["usechangelog-xi.vercel.app", "usechangelog.com", "www.usechangelog.com"];
if (PRODUCTION_HOSTS.includes(new URL(base).hostname)) {
  console.error("Refusing to run against production: this script writes to the database.");
  process.exit(1);
}
const dbProblem = await previewDatabaseProblem(process.env);
if (dbProblem) {
  console.error(`Refusing to run: ${dbProblem}`);
  process.exit(1);
}

const db = getDb();
const [owner] = (await db.execute(sql`select id from neon_auth."user" order by "createdAt" limit 1`)).rows as { id: string }[];
if (!owner) {
  console.error("No user in this database to own the throwaway project.");
  process.exit(1);
}

const url = new URL("/api/v1/posts", base).toString();
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const { key, hash, prefix } = newApiKey();
const valid = { title: "api-test draft", body: "**Body**", category: "new", status: "published", source: { repo: "Acme/Web", pr: 1 } };

async function send(body: unknown, authorization = `Bearer ${key}`) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization,
      "content-type": "application/json",
      ...(bypass && { "x-vercel-protection-bypass": bypass }),
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
  const text = await response.text();
  let json: Record<string, unknown> = {};
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: response.status, json, text, retryAfter: response.headers.get("retry-after") };
}

let failed = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failed++;
  console.log(`${ok ? "pass" : "FAIL"}  ${name}${ok || !detail ? "" : `: ${detail}`}`);
}

const [project] = await db
  .insert(workspaces)
  .values({ ownerId: owner.id, name: "api-test", slug: `api-test-${Date.now()}` })
  .returning({ id: workspaces.id });
try {
  await db.insert(apiKeys).values({ workspaceId: project.id, hash, prefix });

  const created = await send(valid);
  check("201 creates a draft", created.status === 201 && created.json.created === true, created.text);
  const repeat = await send(valid);
  check("200 for the same pull request, same post", repeat.status === 200 && repeat.json.id === created.json.id, repeat.text);
  const stored = await db.select().from(posts).where(eq(posts.workspaceId, project.id));
  check(
    "stored once, as a Shipped draft, despite status: published",
    stored.length === 1 && stored[0].status === "draft" && stored[0].type === "shipped" && stored[0].sourceRef === "github:acme/web#1",
    JSON.stringify(stored.map((p) => ({ status: p.status, type: p.type, ref: p.sourceRef }))),
  );

  const unknown = await send(valid, `Bearer ${newApiKey().key}`);
  check("401 for an unknown key", unknown.status === 401 && unknown.json.error === "unauthorized", unknown.text);
  check("401 without a key", (await send(valid, "")).status === 401);
  const badJson = await send("{ nope");
  check("400 invalid_json", badJson.status === 400 && badJson.json.error === "invalid_json", badJson.text);
  const notObject = await send([]);
  check("400 for JSON that isn't an object", notObject.status === 400 && notObject.json.error === "invalid_request", notObject.text);
  const invalid = await send({ ...valid, title: "", category: "shipped" });
  const fields = (invalid.json.fields ?? {}) as Record<string, unknown>;
  check("400 with a message per invalid field", invalid.status === 400 && "title" in fields && "category" in fields, invalid.text);
  const large = await send({ ...valid, body: "x".repeat(70 * 1024) });
  check("413 over 64 KB", large.status === 413 && large.json.error === "too_large", large.text);

  // Fill the hour up to the limit, then one more pull request.
  await db.execute(sql`
    insert into ${posts} (workspace_id, title, category, source_ref)
    select ${project.id}::uuid, 'api-test filler', 'new', 'github:api-test/filler#' || n
    from generate_series(2, ${API_DRAFTS_PER_HOUR}) n`);
  const limited = await send({ ...valid, source: { repo: "acme/web", pr: 999 } });
  check("429 with Retry-After over the hourly limit", limited.status === 429 && Number(limited.retryAfter) > 0, limited.text);
  const repeatLimited = await send(valid);
  check("200 for an existing pull request even when limited", repeatLimited.status === 200, repeatLimited.text);

  const [row] = await db.select({ lastUsedAt: apiKeys.lastUsedAt }).from(apiKeys).where(eq(apiKeys.workspaceId, project.id));
  check("the key is marked as used", Boolean(row?.lastUsedAt));
  await db.delete(apiKeys).where(eq(apiKeys.workspaceId, project.id));
  check("401 once revoked", (await send(valid)).status === 401);
} finally {
  await db.delete(workspaces).where(eq(workspaces.id, project.id));
  const [{ left }] = (await db.execute(sql`select count(*)::int as left from ${posts} where workspace_id = ${project.id}`)).rows as { left: number }[];
  check("cleaned up: the project, its posts and its key", left === 0);
}

console.log(failed ? `\n${failed} failed` : "\nAll passed");
process.exit(failed ? 1 : 0);
