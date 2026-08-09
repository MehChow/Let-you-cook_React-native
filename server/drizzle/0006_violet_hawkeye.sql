UPDATE "recipes"
SET
	"status" = 'published',
	"published_at" = COALESCE("published_at", "updated_at", "created_at")
WHERE "is_published" = true;--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "is_published";
