CREATE TABLE "recipe_tags" (
	"recipe_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "recipe_tags_recipe_id_tag_id_pk" PRIMARY KEY("recipe_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tags_slug_unique" ON "tags" USING btree ("slug");--> statement-breakpoint
WITH normalized AS (
	SELECT
		initcap(regexp_replace(btrim(legacy_tag.label), '\s+', ' ', 'g')) AS label,
		btrim(
			regexp_replace(
				lower(regexp_replace(btrim(legacy_tag.label), '\s+', ' ', 'g')),
				'[^[:alnum:]]+',
				'-',
				'g'
			),
			'-'
		) AS slug
	FROM "recipes"
	CROSS JOIN LATERAL jsonb_array_elements_text("recipes"."tags") AS legacy_tag(label)
)
INSERT INTO "tags" ("slug", "label")
SELECT "slug", min("label")
FROM normalized
WHERE "slug" <> ''
GROUP BY "slug"
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
WITH normalized AS (
	SELECT
		"recipes"."id" AS recipe_id,
		legacy_tag.ordinality AS first_position,
		btrim(
			regexp_replace(
				lower(regexp_replace(btrim(legacy_tag.label), '\s+', ' ', 'g')),
				'[^[:alnum:]]+',
				'-',
				'g'
			),
			'-'
		) AS slug
	FROM "recipes"
	CROSS JOIN LATERAL jsonb_array_elements_text("recipes"."tags")
		WITH ORDINALITY AS legacy_tag(label, ordinality)
), distinct_tags AS (
	SELECT recipe_id, slug, min(first_position) AS first_position
	FROM normalized
	WHERE slug <> ''
	GROUP BY recipe_id, slug
), ranked_tags AS (
	SELECT
		recipe_id,
		slug,
		row_number() OVER (PARTITION BY recipe_id ORDER BY first_position, slug) AS tag_rank
	FROM distinct_tags
)
INSERT INTO "recipe_tags" ("recipe_id", "tag_id")
SELECT ranked_tags.recipe_id, "tags"."id"
FROM ranked_tags
INNER JOIN "tags" ON "tags"."slug" = ranked_tags.slug
WHERE ranked_tags.tag_rank <= 5
ON CONFLICT DO NOTHING;--> statement-breakpoint
ALTER TABLE "recipes" DROP COLUMN "tags";
