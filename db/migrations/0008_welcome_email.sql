ALTER TABLE "accounts" ADD COLUMN "welcome_email_sent_at" timestamp with time zone;--> statement-breakpoint
-- Existing accounts never get the welcome email (#76): only accounts created from now on do.
UPDATE "accounts" SET "welcome_email_sent_at" = "created_at";
