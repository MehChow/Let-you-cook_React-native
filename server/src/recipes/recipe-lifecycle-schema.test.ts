import assert from "node:assert/strict";
import { test } from "node:test";

import { getTableConfig } from "drizzle-orm/pg-core";

import { recipes } from "../db/schema";

// Maps recipe columns by their persisted PostgreSQL names.
const recipeColumns = () =>
  new Map(getTableConfig(recipes).columns.map((column) => [column.name, column]));

// Maps named recipe indexes to their ordered persisted columns.
const recipeIndexes = () =>
  Object.fromEntries(
    getTableConfig(recipes).indexes.map((recipeIndex) => [
      recipeIndex.config.name,
      recipeIndex.config.columns.map((column) =>
        "name" in column ? column.name : "<expression>",
      ),
    ]),
  );

test("recipe lifecycle fields default new aggregates to versioned drafts", () => {
  const columns = recipeColumns();

  assert.equal(columns.get("status")?.default, "draft");
  assert.equal(columns.get("status")?.notNull, true);
  assert.equal(columns.get("version")?.default, 1);
  assert.equal(columns.get("version")?.notNull, true);
  assert.equal(columns.get("published_at")?.notNull, false);
  assert.equal(columns.get("archived_at")?.notNull, false);
  assert.equal(columns.get("removed_at")?.notNull, false);
  assert.equal(columns.has("is_published"), false);
});

test("recipe indexes preserve every deterministic lifecycle query tuple", () => {
  assert.deepEqual(recipeIndexes(), {
    recipes_author_status_updated_idx: ["user_id", "status", "updated_at"],
    recipes_category_status_published_idx: [
      "category_id",
      "status",
      "published_at",
    ],
    recipes_status_published_id_idx: ["status", "published_at", "id"],
  });
});
