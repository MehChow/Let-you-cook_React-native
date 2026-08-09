ALTER TABLE "recipes" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "removed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "recipes_status_published_id_idx" ON "recipes" USING btree ("status","published_at","id");--> statement-breakpoint
CREATE INDEX "recipes_category_status_published_idx" ON "recipes" USING btree ("category_id","status","published_at");--> statement-breakpoint
CREATE INDEX "recipes_author_status_updated_idx" ON "recipes" USING btree ("user_id","status","updated_at");--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_status_check" CHECK ("recipes"."status" in ('draft', 'published', 'archived', 'removed'));--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_version_check" CHECK ("recipes"."version" >= 1);