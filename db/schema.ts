import { randomBytes } from "node:crypto";
import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { CATEGORIES, TYPES } from "@/lib/posts/form";
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

export const postCategory = pgEnum("post_category", CATEGORIES);
export const postType = pgEnum("post_type", TYPES);
export const postStatus = pgEnum("post_status", ["draft", "published"]);

// Only `published` posts are public (#7, #8). Deleting a workspace deletes its posts.
export const posts = pgTable(
  "posts",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text().notNull(),
    body: text().notNull().default(""),
    category: postCategory().notNull(),
    type: postType().notNull().default("shipped"),
    status: postStatus().notNull().default("draft"),
    // Set on the first publish, editable by hand, kept when going back to draft.
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("posts_workspace_status_published_idx").on(t.workspaceId, t.status, t.publishedAt.desc())],
);
