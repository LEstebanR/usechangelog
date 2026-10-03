import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as neonAuth from "./neon-auth";
import * as schema from "./schema";

let client: ReturnType<typeof createClient> | undefined;

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Fail with our own message: the driver's error repeats the URL, password included.
  if (!/^postgres(ql)?:\/\//.test(url)) {
    throw new Error("DATABASE_URL must start with postgresql:// (check the env var)");
  }
  return drizzle(neon(url), { schema: { ...schema, ...neonAuth } });
}

// Created on first use, not at import, so `next build` runs without env vars.
export function getDb() {
  client ??= createClient();
  return client;
}
