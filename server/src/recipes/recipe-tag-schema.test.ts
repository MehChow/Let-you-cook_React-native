import assert from "node:assert/strict";
import { test } from "node:test";

import { getTableConfig, type PgTable } from "drizzle-orm/pg-core";

import * as schema from "../db/schema";

test("normalized tags replace recipe JSON with unique cascading pairs", () => {
  const schemaExports = schema as Record<string, unknown>;
  const tagTable = schemaExports.tags;
  const recipeTagTable = schemaExports.recipeTags;
  assert.ok(tagTable);
  assert.ok(recipeTagTable);

  const tagConfig = getTableConfig(tagTable as PgTable);
  const tagColumns = new Map(
    tagConfig.columns.map((column) => [column.name, column]),
  );
  assert.equal(tagColumns.get("id")?.primary, true);
  assert.equal(tagColumns.get("slug")?.notNull, true);
  assert.equal(tagColumns.get("label")?.notNull, true);
  assert.deepEqual(
    tagConfig.indexes.map((tagIndex) => tagIndex.config.name),
    ["tags_slug_unique"],
  );

  const recipeTagConfig = getTableConfig(recipeTagTable as PgTable);
  assert.deepEqual(
    recipeTagConfig.primaryKeys[0]?.columns.map((column) => column.name),
    ["recipe_id", "tag_id"],
  );
  assert.deepEqual(
    recipeTagConfig.foreignKeys
      .map((foreignKey) => {
        const reference = foreignKey.reference();
        return {
          column: reference.columns[0]?.name,
          onDelete: foreignKey.onDelete,
        };
      })
      .sort((left, right) => left.column?.localeCompare(right.column ?? "") ?? 0),
    [
      { column: "recipe_id", onDelete: "cascade" },
      { column: "tag_id", onDelete: "cascade" },
    ],
  );
  assert.equal(
    getTableConfig(schema.recipes).columns.some(
      (column) => column.name === "tags",
    ),
    false,
  );
});
