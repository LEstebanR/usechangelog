import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  // Only our tables. `db/neon-auth.ts` is left out on purpose: Neon owns that schema.
  schema: "./db/schema.ts",
  out: "./db/migrations",
  // Keeps push and introspection off `neon_auth`, so they never try to drop its tables.
  schemaFilter: ["public"],
  dbCredentials: {
    // Migrations need a direct connection, not the pooled one.
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
