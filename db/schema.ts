import { randomBytes } from "node:crypto";
import { boolean, date, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { SUBSCRIPTION_STATUSES } from "@/lib/billing/status";
import { FEEDBACK_KINDS } from "@/lib/feedback/form";
import { CATEGORIES, TYPES } from "@/lib/posts/form";
import { WIDGET_LANGS } from "@/lib/widget/copy";
import { user } from "./neon-auth";

// Our tables, in the `public` schema. Users live in Neon's schema (`./neon-auth`).

export const widgetLang = pgEnum("widget_lang", WIDGET_LANGS);
export const subscriptionStatus = pgEnum("subscription_status", SUBSCRIPTION_STATUSES);

// A new project's widget key: public, random, and never changed afterwards.
export const newWidgetKey = () => randomBytes(16).toString("base64url");

// One per user, created on onboarding or the first time billing needs it (#65). The plan is
// the account's, not the project's: one Pro covers several projects. Its id is the Polar
// customer's external_id; accounts migrated from a single workspace kept that workspace's id,
// so Polar customers created before the migration still find theirs.
export const accounts = pgTable("accounts", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique("accounts_user_id_unique")
    .references(() => user.id, { onDelete: "cascade" }),
  // Billing (#15). Only the Polar webhook writes these (and a courtesy account, by hand).
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
});

// A project in the UI ("workspace" in code). A user has several, as many as their plan
// publishes (#65). Deleting the user deletes them (#31).
export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text().notNull(),
    slug: text().notNull().unique("workspaces_slug_unique"),
    // Public and permanent: the widget (#8) uses it, so changing the slug never breaks an embed.
    widgetKey: text("widget_key")
      .notNull()
      .unique("workspaces_widget_key_unique")
      .$defaultFn(newWidgetKey),
    // Language of the widget's chrome (#8), set in settings.
    widgetLang: widgetLang("widget_lang").notNull().default("en"),
    // Off hides the widget on the customer's site without touching their snippet (#8).
    widgetEnabled: boolean("widget_enabled").notNull().default(true),
    // Which projects publish depends on it: the oldest ones of the account (#65).
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("workspaces_owner_id_idx").on(t.ownerId)],
);

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

export const feedbackKind = pgEnum("feedback_kind", FEEDBACK_KINDS);

// What signed-in users write to us from the app (#28). Private: never shown in public.
// Deleting the user deletes their messages; deleting a workspace keeps them, without it.
export const feedback = pgTable(
  "feedback",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Null when it was sent before onboarding.
    workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "set null" }),
    kind: feedbackKind().notNull().default("other"),
    message: text().notNull(),
    // The app route it was sent from, e.g. /app/settings.
    page: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  // The rate limit counts a user's messages in the last hour.
  (t) => [index("feedback_user_created_idx").on(t.userId, t.createdAt)],
);

// Our own staff roles, not customers' (no teams or roles for customers, see AGENTS.md).
// One row per user that has one; nobody has a role by default. Granted with `bun run admin:grant`.
export const userRole = pgEnum("user_role", ["admin"]);

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  role: userRole().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
