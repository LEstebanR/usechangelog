CREATE TYPE "public"."feedback_status" AS ENUM('open', 'done', 'dismissed');--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "status" "feedback_status" DEFAULT 'open' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedback" ADD COLUMN "resolved_at" timestamp with time zone;