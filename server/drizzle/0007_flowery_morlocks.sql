CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"sort_order" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
INSERT INTO "categories" ("id", "slug", "display_name", "sort_order", "is_active")
VALUES
	('7f9ad5b0-1f15-4a21-9f4e-000000000001', 'breakfast', 'Breakfast', 10, true),
	('7f9ad5b0-1f15-4a21-9f4e-000000000002', 'lunch', 'Lunch', 20, true),
	('7f9ad5b0-1f15-4a21-9f4e-000000000003', 'dinner', 'Dinner', 30, true),
	('7f9ad5b0-1f15-4a21-9f4e-000000000004', 'dessert', 'Dessert', 40, true),
	('7f9ad5b0-1f15-4a21-9f4e-000000000005', 'drinks', 'Drinks', 50, true),
	('7f9ad5b0-1f15-4a21-9f4e-000000000006', 'vegan', 'Vegan', 60, true),
	('7f9ad5b0-1f15-4a21-9f4e-000000000007', 'other', 'Other', 70, true);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "category_id" SET DATA TYPE uuid USING (
	CASE lower(btrim("category_id"))
		WHEN 'breakfast' THEN '7f9ad5b0-1f15-4a21-9f4e-000000000001'::uuid
		WHEN 'lunch' THEN '7f9ad5b0-1f15-4a21-9f4e-000000000002'::uuid
		WHEN 'dinner' THEN '7f9ad5b0-1f15-4a21-9f4e-000000000003'::uuid
		WHEN 'dessert' THEN '7f9ad5b0-1f15-4a21-9f4e-000000000004'::uuid
		WHEN 'drinks' THEN '7f9ad5b0-1f15-4a21-9f4e-000000000005'::uuid
		WHEN 'vegan' THEN '7f9ad5b0-1f15-4a21-9f4e-000000000006'::uuid
		ELSE '7f9ad5b0-1f15-4a21-9f4e-000000000007'::uuid
	END
);--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_sort_order_unique" ON "categories" USING btree ("sort_order");--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;
