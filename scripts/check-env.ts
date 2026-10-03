// Runs first in `vercel-build`: a malformed env var fails the deploy with a clear
// message instead of failing at runtime (where the driver echoes the URL, password
// included). It never prints a value. CI builds without secrets and skips this.
const checks: [name: string, pattern: RegExp, hint: string][] = [
  ["DATABASE_URL", /^postgres(ql)?:\/\/[^/\s]+\/\S+/, "a postgresql:// connection string (Neon → Connect, pooled)"],
  ["DATABASE_URL_UNPOOLED", /^postgres(ql)?:\/\/[^/\s]+\/\S+/, "a postgresql:// connection string (Neon → Connect, direct)"],
  ["NEON_AUTH_BASE_URL", /^https:\/\/\S+\/auth$/, "the https://…/auth URL from Neon → Better Auth"],
  ["NEON_AUTH_COOKIE_SECRET", /^\S{32,}$/, "a random value of at least 32 characters"],
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
