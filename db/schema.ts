import { randomBytes } from "node:crypto";
import { boolean, date, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { SUBSCRIPTION_STATUSES } from "@/lib/billing/status";
import { CATEGORIES, TYPES } from "@/lib/posts/form";
import { WIDGET_LANGS } from "@/lib/widget/copy";
import { user } from "./neon-auth";

// Our tables, in the `public` schema. Users live in Neon's schema (`./neon-auth`).

export const widgetLang = pgEnum("widget_lang", WIDGET_LANGS);
export const subscriptionStatus = pgEnum("subscription_status", SUBSCRIPTION_STATUSES);

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
  // Language of the widget's chrome (#8), set in settings.
  widgetLang: widgetLang("widget_lang").notNull().default("en"),
  // Off hides the widget on the customer's site without touching their snippet (#8).
  widgetEnabled: boolean("widget_enabled").notNull().default(true),
  // Billing (#15). Only the Polar webhook writes these; the workspace id is Polar's external_id.
  polarCustomerId: text("polar_customer_id"),
  polarSubscriptionId: text("polar_subscription_id"),
  subscriptionStatus: subscriptionStatus("subscription_status").notNull().default("none"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  // End of the free trial, while there is one (the trial is set on the product in Polar).
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
  // Polar's modified_at of the last event applied: older or retried events never overwrite it.
  subscriptionUpdatedAt: timestamp("subscription_updated_at", { withTimezone: true }),
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
    // A day ("YYYY-MM-DD"), not a moment: set on the first publish, editable by hand,
    // kept when going back to draft.
    publishedOn: date("published_on", { mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("posts_workspace_status_published_idx").on(t.workspaceId, t.status, t.publishedOn.desc())],
);
