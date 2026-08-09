ALTER TABLE "refresh_tokens" ADD COLUMN "family_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "used_at" timestamp with time zone;--> statement-breakpoint
UPDATE "refresh_tokens" SET "revoked_at" = now() WHERE "revoked_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "refresh_tokens_token_hash_unique" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "refresh_tokens_active_family_idx" ON "refresh_tokens" USING btree ("user_id","family_id") WHERE "refresh_tokens"."revoked_at" is null;
