// A preview's build runs `db:migrate`, so it must never point at production (#87). Asks the Neon
// API which branch the migration URL's endpoint belongs to and fails when it's the project's
// default branch (production) or a different branch than NEON_BRANCH_ID says. Never prints a URL.
type Env = Record<string, string | undefined>;

const API = "https://console.neon.tech/api/v2";

/** The endpoint id (ep-…) in a Neon connection string's host, pooled or direct. */
export function endpointId(url: string): string | undefined {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return undefined;
  }
  return host.match(/^(ep-[a-z0-9-]+?)(-pooler)?\./)?.[1];
}

export async function previewDatabaseProblem(env: Env): Promise<string | undefined> {
  const endpoint = endpointId(env.DATABASE_URL_UNPOOLED ?? "");
  if (!endpoint) return "DATABASE_URL_UNPOOLED has no Neon endpoint (ep-…) in its host.";

  const get = async (path: string) => {
    const res = await fetch(`${API}/projects/${env.NEON_PROJECT_ID}${path}`, {
      headers: { Authorization: `Bearer ${env.NEON_API_KEY}`, Accept: "application/json" },
      // A hung API would otherwise hold the build until Vercel's own timeout.
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Neon API ${path.split("/")[1]} answered HTTP ${res.status}`);
    return res.json();
  };

  try {
    const { endpoint: ep } = (await get(`/endpoints/${endpoint}`)) as { endpoint: { branch_id: string } };
    const { branch } = (await get(`/branches/${ep.branch_id}`)) as { branch: { name: string; default: boolean } };
    if (branch.default) {
      return `DATABASE_URL_UNPOOLED points at "${branch.name}", the default (production) branch; previews migrate develop.`;
    }
    if (ep.branch_id !== env.NEON_BRANCH_ID) {
      return `DATABASE_URL_UNPOOLED is on branch "${branch.name}" but NEON_BRANCH_ID is another branch; point both at develop.`;
    }
  } catch (error) {
    return `Couldn't check the preview's database branch: ${(error as Error).message}.`;
  }
}
