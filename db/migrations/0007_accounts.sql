CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"polar_customer_id" text,
	"polar_subscription_id" text,
	"subscription_status" "subscription_status" DEFAULT 'none' NOT NULL,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"trial_ends_at" timestamp with time zone,
	"subscription_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_owner_id_unique";--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workspaces_owner_id_idx" ON "workspaces" USING btree ("owner_id");--> statement-breakpoint
-- Added by hand (#65): copy each workspace's billing to its owner's account BEFORE dropping the
-- columns. The account keeps the workspace's id, which is the Polar customer's external_id.
-- Until now there was one workspace per user, so each user gets exactly one row.
INSERT INTO "accounts" ("id", "user_id", "polar_customer_id", "polar_subscription_id", "subscription_status", "current_period_end", "cancel_at_period_end", "trial_ends_at", "subscription_updated_at", "created_at")
SELECT "id", "owner_id", "polar_customer_id", "polar_subscription_id", "subscription_status", "current_period_end", "cancel_at_period_end", "trial_ends_at", "subscription_updated_at", "created_at"
FROM "workspaces";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "polar_customer_id";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "polar_subscription_id";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "subscription_status";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "current_period_end";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "cancel_at_period_end";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "trial_ends_at";--> statement-breakpoint
ALTER TABLE "workspaces" DROP COLUMN "subscription_updated_at";