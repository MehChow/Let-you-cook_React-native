ALTER TABLE "auth_challenges" ADD COLUMN "grant_hash" text;--> statement-breakpoint
ALTER TABLE "auth_challenges" ADD COLUMN "grant_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_challenges" ADD COLUMN "grant_consumed_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_challenges_grant_hash_unique" ON "auth_challenges" USING btree ("grant_hash");