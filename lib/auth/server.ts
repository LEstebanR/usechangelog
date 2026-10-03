import { createNeonAuth } from "@neondatabase/auth/next/server";
import { connection } from "next/server";

let instance: ReturnType<typeof createAuth> | undefined;

function createAuth() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret) {
    throw new Error("NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set");
  }
  return createNeonAuth({ baseUrl, cookies: { secret } });
}

// Created on first use, not at import: createNeonAuth validates the secret, and
// `next build` runs without env vars.
export function getAuth() {
  instance ??= createAuth();
  return instance;
}

// The current user, or null. Marks the page as rendered per request, so it is
// never prerendered at build time.
export async function getUser() {
  await connection();
  const { data } = await getAuth().getSession();
  return data?.user ?? null;
}
