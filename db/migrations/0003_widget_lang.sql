CREATE TYPE "public"."widget_lang" AS ENUM('en', 'es', 'pt', 'fr', 'de');--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "widget_lang" "widget_lang" DEFAULT 'en' NOT NULL;