import { boolean, pgSchema, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Managed Better Auth owns the `neon_auth` schema. We only read it and point
// foreign keys at `user.id`. This file stays out of drizzle.config.ts `schema`,
// so drizzle-kit never generates migrations for it.
const neonAuth = pgSchema("neon_auth");

export const user = neonAuth.table("user", {
  id: uuid().primaryKey(),
  name: text().notNull(),
  email: text().notNull(),
  emailVerified: boolean().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull(),
});
