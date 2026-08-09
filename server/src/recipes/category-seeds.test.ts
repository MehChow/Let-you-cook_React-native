import assert from "node:assert/strict";
import { after, test } from "node:test";

import { asc, eq } from "drizzle-orm";

import { db, pool } from "../db/client";
import { seedDevelopmentData } from "../db/devData";
import { categories } from "../db/schema";

const EXPECTED_CATEGORIES = [
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000001",
    slug: "breakfast",
    displayName: "Breakfast",
    sortOrder: 10,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000002",
    slug: "lunch",
    displayName: "Lunch",
    sortOrder: 20,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000003",
    slug: "dinner",
    displayName: "Dinner",
    sortOrder: 30,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000004",
    slug: "dessert",
    displayName: "Dessert",
    sortOrder: 40,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000005",
    slug: "drinks",
    displayName: "Drinks",
    sortOrder: 50,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000006",
    slug: "vegan",
    displayName: "Vegan",
    sortOrder: 60,
    isActive: true,
  },
  {
    id: "7f9ad5b0-1f15-4a21-9f4e-000000000007",
    slug: "other",
    displayName: "Other",
    sortOrder: 70,
    isActive: true,
  },
] as const;

// Reads the complete curated taxonomy in its persisted display order.
const readCategories = () =>
  db
    .select({
      id: categories.id,
      slug: categories.slug,
      displayName: categories.displayName,
      sortOrder: categories.sortOrder,
      isActive: categories.isActive,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));

after(async () => {
  await pool.end();
});

test("development seeds restore stable curated categories idempotently", async () => {
  await seedDevelopmentData();
  await db
    .update(categories)
    .set({ displayName: "Drifted", isActive: false, sortOrder: 999 })
    .where(eq(categories.id, EXPECTED_CATEGORIES[0].id));

  await seedDevelopmentData();

  assert.deepEqual(await readCategories(), EXPECTED_CATEGORIES);
});
