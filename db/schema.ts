import { randomBytes } from "node:crypto";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./neon-auth";

// Our tables, in the `public` schema. Users live in Neon's schema (`./neon-auth`).

// One per user (unique owner_id). Deleting the user deletes the workspace (#31).
export const workspaces = pgTable("workspaces", {
  id: uuid().primaryKey().defaultRandom(),
  ownerId: uuid("owner_id")
    .notNull()
    .unique("workspaces_owner_id_unique")
    .references(() => user.id, { onDelete: "cascade" }),
  name: text().notNull(),
  slug: text().notNull().unique("workspaces_slug_unique"),
  // Public and permanent: the widget (#8) uses it, so changing the slug never breaks an embed.
  widgetKey: text("widget_key")
    .notNull()
    .unique("workspaces_widget_key_unique")
    .$defaultFn(() => randomBytes(16).toString("base64url")),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
