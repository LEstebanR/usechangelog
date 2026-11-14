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

// Better Auth deletes a session on sign-out or expiry, so the newest one left is the
// latest sign-in we can still see, not a history. Read only, for the admin users view (#57).
export const session = neonAuth.table("session", {
  id: uuid().primaryKey(),
  userId: uuid().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull(),
});
