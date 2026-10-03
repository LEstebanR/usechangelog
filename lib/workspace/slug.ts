// The public page lives at /{slug}, so a slug can't shadow one of our own routes or files.
export const RESERVED_SLUGS = new Set([
  "app",
  "api",
  "auth",
  "signup",
  "sign-up",
  "sign-in",
  "widget",
  "widget.js",
  "pricing",
  "privacy",
  "terms",
  "sitemap",
  "sitemap.xml",
  "robots",
  "robots.txt",
  "favicon.ico",
  "icon.svg",
  "apple-icon.png",
  "opengraph-image.png",
  "_next",
]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MIN = 3;
export const SLUG_MAX = 40;

export const SLUG_TAKEN = "That URL is already taken. Try another one.";

export type SlugResult = { ok: true; slug: string } | { ok: false; error: string };

// Normalizes (trim, lowercase) and validates. Uniqueness is the database's job.
export function validateSlug(input: string): SlugResult {
  const slug = input.trim().toLowerCase();
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, error: "That URL is reserved. Try another one." };
  }
  if (slug.length < SLUG_MIN || slug.length > SLUG_MAX || !SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      error: `Use ${SLUG_MIN}–${SLUG_MAX} lowercase letters, numbers and single hyphens, not at the start or end.`,
    };
  }
  return { ok: true, slug };
}

// A starting suggestion from the workspace name: "Acme App!" -> "acme-app".
export function slugify(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/, "");
}
