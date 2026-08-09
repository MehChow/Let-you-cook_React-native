import assert from "node:assert/strict";
import { test } from "node:test";

import { getTableConfig, type PgTable } from "drizzle-orm/pg-core";

import * as schema from "../db/schema";

test("categories persist stable identity, unique order, and active display data", () => {
  const categoryTable = (schema as Record<string, unknown>).categories;
  assert.ok(categoryTable);
  const config = getTableConfig(categoryTable as PgTable);
  const columns = new Map(config.columns.map((column) => [column.name, column]));

  assert.equal(columns.get("id")?.primary, true);
  assert.equal(columns.get("slug")?.notNull, true);
  assert.equal(columns.get("display_name")?.notNull, true);
  assert.equal(columns.get("sort_order")?.notNull, true);
  assert.equal(columns.get("is_active")?.default, true);
  assert.deepEqual(
    config.indexes.map((categoryIndex) => categoryIndex.config.name).sort(),
    ["categories_slug_unique", "categories_sort_order_unique"],
  );
});

test("every recipe requires a relational category reference", () => {
  const config = getTableConfig(schema.recipes);
  const categoryColumn = config.columns.find(
    (column) => column.name === "category_id",
  );
  const categoryForeignKey = config.foreignKeys.find(
    (foreignKey) => foreignKey.getName() === "recipes_category_id_categories_id_fk",
  );

  assert.equal(categoryColumn?.columnType, "PgUUID");
  assert.equal(categoryColumn?.notNull, true);
  assert.deepEqual(
    categoryForeignKey?.reference().columns.map((column) => column.name),
    ["category_id"],
  );
  assert.equal(categoryForeignKey?.reference().foreignTable, schema.categories);
});
