ALTER TABLE "accounts" ADD COLUMN "welcome_email_sent_at" timestamp with time zone;--> statement-breakpoint
-- Accounts that already have a project never get the welcome email (#76); it goes out on a
-- first project. Accounts without one yet (a checkout opened first) still get it.
UPDATE "accounts" SET "welcome_email_sent_at" = "created_at"
WHERE EXISTS (SELECT 1 FROM "workspaces" WHERE "workspaces"."owner_id" = "accounts"."user_id");
