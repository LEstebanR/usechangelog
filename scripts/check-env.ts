import { neon } from "@neondatabase/serverless";

// Runs first in `vercel-build`: a malformed env var fails the deploy with a clear
// message instead of failing at runtime (where the driver echoes the URL, password
// included). It never prints a value. CI builds without secrets and skips this.
const isProduction = process.env.VERCEL_ENV === "production";

const checks: [name: string, pattern: RegExp, hint: string][] = [
  ["DATABASE_URL", /^postgres(ql)?:\/\/[^/\s]+\/\S+/, "a postgresql:// connection string (Neon → Connect, pooled)"],
  ["DATABASE_URL_UNPOOLED", /^postgres(ql)?:\/\/[^/\s]+\/\S+/, "a postgresql:// connection string (Neon → Connect, direct)"],
  ["NEON_AUTH_BASE_URL", /^https:\/\/\S+\/auth$/, "the https://…/auth URL from Neon → Better Auth"],
  ["NEON_AUTH_COOKIE_SECRET", /^\S{32,}$/, "a random value of at least 32 characters"],
  ["POLAR_ACCESS_TOKEN", /^polar_\S+$/, "an organization access token from Polar (polar_…)"],
  ["POLAR_PRODUCT_ID", /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, "the monthly plan's product id (a UUID) from Polar"],
  ["POLAR_WEBHOOK_SECRET", /^\S{16,}$/, "the webhook endpoint's secret from Polar"],
  // Production bills for real; previews never do.
  isProduction
    ? ["POLAR_SERVER", /^production$/, "production"]
    : ["POLAR_SERVER", /^sandbox$/, "sandbox (only Production uses production)"],
  // Previews and local use their own URL; only Production needs the canonical one (#13).
  ...(isProduction ? [["NEXT_PUBLIC_SITE_URL", /^https:\/\/[^/\s]+\/?$/, "the https:// origin of the production site"] satisfies [string, RegExp, string]] : []),
];

const problems = checks.flatMap(([name, pattern, hint]) => {
  const value = process.env[name];
  if (!value) return [`${name} is missing: expected ${hint}.`];
  return pattern.test(value) ? [] : [`${name} looks wrong: expected ${hint}.`];
});

// Locally, also check the database and auth answer: a deleted or expired Neon branch otherwise
// shows up as "We couldn't send the link" on sign-in. Vercel skips this; its build migrates next.
if (!problems.length && !process.env.VERCEL) problems.push(...(await reachability()));

if (problems.length) {
  console.error(`Environment check failed (${process.env.VERCEL_ENV ?? "local"}):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Environment check passed.");

async function reachability() {
  const found: string[] = [];
  try {
    await neon(process.env.DATABASE_URL!)`select 1`;
  } catch (error) {
    // The driver's message names the cause (password, endpoint) but never the URL.
    found.push(`DATABASE_URL doesn't answer (${(error as Error).message.slice(0, 120)}). Check the Neon branch still exists: neonctl branches list.`);
  }
  const auth = await fetch(`${process.env.NEON_AUTH_BASE_URL}/ok`).catch(() => null);
  if (!auth?.ok) found.push(`NEON_AUTH_BASE_URL doesn't answer (${auth?.status ?? "no response"}). Check Neon Auth is on for that branch.`);
  return found;
}
