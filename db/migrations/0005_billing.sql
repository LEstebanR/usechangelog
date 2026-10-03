CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'none');--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "polar_customer_id" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "polar_subscription_id" text;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "current_period_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "subscription_updated_at" timestamp with time zone;