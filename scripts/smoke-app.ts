// Signed-in smoke test for /app, against `next dev` or a preview.
//   bun run smoke <email> [base-url]
// Requests a magic link, asks you to paste the link from the email, signs in,
// then checks the /app redirects and the onboarding validation errors.
// It never creates a workspace, so it can run against any branch.

const [email, base = "http://localhost:3000"] = process.argv.slice(2);
if (!email) {
  console.error("Usage: bun run smoke <email> [base-url]");
  process.exit(1);
}

const host = new URL(base).host;
const jar = new Map<string, string>();
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");
const keepCookies = (res: Response, url: string) => {
  if (new URL(url).host !== host) return;
  for (const c of res.headers.getSetCookie()) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    jar.set(pair.slice(0, i), pair.slice(i + 1));
  }
};

// Follows redirects by hand so the session cookies set on the way are kept.
async function go(url: string, init: RequestInit = {}) {
  let res: Response;
  for (let hops = 0; ; hops++) {
    res = await fetch(url, { ...init, redirect: "manual", headers: { ...init.headers, cookie: cookieHeader() } });
    keepCookies(res, url);
    const next = res.headers.get("location");
    if (!next || hops > 10) return { res, url };
    url = new URL(next, url).toString();
    init = {};
  }
}

let failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` (${detail})` : ""}`);
};

// 1. Sign in.
const sent = await fetch(`${base}/api/auth/sign-in/magic-link`, {
  method: "POST",
  headers: { "content-type": "application/json", origin: base },
  body: JSON.stringify({ email, callbackURL: `${base}/auth/callback`, errorCallbackURL: `${base}/sign-in` }),
});
check("magic link requested", sent.ok, `HTTP ${sent.status}`);
const link = prompt(`Paste the sign-in link sent to ${email}:`)?.trim();
if (!link) process.exit(1);
const landed = await go(link);
check("signed in", new URL(landed.url).pathname.startsWith("/app"), new URL(landed.url).pathname);

// 2. Redirects: with no workspace everything goes to onboarding, with one onboarding goes to /app.
const app = await go(`${base}/app/settings`);
const path = new URL(app.url).pathname;
check("/app/settings resolves", path === "/app/settings" || path === "/app/onboarding", path);
if (path !== "/app/onboarding") {
  const back = await go(`${base}/app/onboarding`);
  check("onboarding sends a user with a workspace to /app", new URL(back.url).pathname === "/app");
  process.exit(failed ? 1 : 0);
}

// 3. Onboarding errors, posted like a browser without JavaScript.
async function submit(fields: Record<string, string>) {
  const page = await (await go(`${base}/app/onboarding`)).res.text();
  const form = [...page.matchAll(/<form[^>]*>([\s\S]*?)<\/form>/g)].find((m) => m[1].includes('name="slug"'));
  const body = new FormData();
  for (const [, name, value = ""] of form?.[1].matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?/g) ?? []) {
    body.append(name.replaceAll("&quot;", '"'), value.replaceAll("&quot;", '"').replaceAll("&amp;", "&"));
  }
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  const html = await (await go(`${base}/app/onboarding`, { method: "POST", body, headers: { origin: base } })).res.text();
  return [...html.matchAll(/id="(?:name-error|slug-help)"[^>]*>([^<]*)</g)].map((m) => m[1]).join(" ");
}

for (const slug of ["sitemap", "robots.txt", "widget.js", "app", "API"]) {
  const msg = await submit({ name: "Smoke", slug });
  check(`"${slug}" is reserved`, msg.includes("reserved"), msg);
}
for (const slug of ["my--slug", "-x", "ab", "a".repeat(41)]) {
  const msg = await submit({ name: "Smoke", slug });
  check(`"${slug.length > 12 ? `${slug.length} chars` : slug}" fails the format`, msg.includes("lowercase letters"), msg);
}
check("an empty name is rejected", (await submit({ name: "", slug: "smoke-test" })).includes("characters"));

console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);

export {};
