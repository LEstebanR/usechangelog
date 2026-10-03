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
];

const problems = checks.flatMap(([name, pattern, hint]) => {
  const value = process.env[name];
  if (!value) return [`${name} is missing: expected ${hint}.`];
  return pattern.test(value) ? [] : [`${name} looks wrong: expected ${hint}.`];
});

if (problems.length) {
  console.error(`Environment check failed (${process.env.VERCEL_ENV ?? "local"}):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Environment check passed.");
