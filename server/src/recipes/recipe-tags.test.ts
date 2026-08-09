import assert from "node:assert/strict";
import { after, test } from "node:test";

import { and, count, eq } from "drizzle-orm";

import { db, pool } from "../db/client";
import { recipeTags, recipes, tags } from "../db/schema";
import {
  createRecipeTestAuthor,
  createRecipeTestDraft,
  deleteRecipeTestAuthor,
  deleteRecipeTestTags,
} from "./recipeTestUtils";
import {
  addRecipeTag,
  RecipeNotFoundError,
  RecipeTagLimitError,
} from "./tagService";

after(async () => {
  await pool.end();
});

test("tag assignment reuses normalized tags and rejects a sixth atomically", async () => {
  const authorId = await createRecipeTestAuthor("tag-limit");
  const recipeId = await createRecipeTestDraft(authorId, "Tag limit recipe");
  const expectedSlugs = [
    "quick-meals",
    "data03-two",
    "data03-three",
    "data03-four",
    "data03-five",
  ];

  try {
    const [initialRecipe] = await db
      .select({ updatedAt: recipes.updatedAt })
      .from(recipes)
      .where(eq(recipes.id, recipeId));
    const first = await addRecipeTag(recipeId, "Quick Meals");
    const duplicate = await addRecipeTag(recipeId, "  quick   meals ");
    assert.deepEqual(duplicate, first);

    for (const label of [
      "Data03 Two",
      "Data03 Three",
      "Data03 Four",
      "Data03 Five",
    ]) {
      await addRecipeTag(recipeId, label);
    }

    await assert.rejects(
      addRecipeTag(recipeId, "Data03 Six"),
      RecipeTagLimitError,
    );

    const [assignmentCount] = await db
      .select({ value: count() })
      .from(recipeTags)
      .where(eq(recipeTags.recipeId, recipeId));
    const persistedTags = await db
      .select({ label: tags.label, slug: tags.slug })
      .from(tags)
      .where(eq(tags.slug, "quick-meals"));
    const rejectedTag = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, "data03-six"));
    const [versionedRecipe] = await db
      .select({ updatedAt: recipes.updatedAt, version: recipes.version })
      .from(recipes)
      .where(eq(recipes.id, recipeId));

    assert.equal(assignmentCount?.value, 5);
    assert.equal(versionedRecipe?.version, 6);
    assert.ok(initialRecipe);
    assert.ok(versionedRecipe);
    assert.ok(versionedRecipe.updatedAt > initialRecipe.updatedAt);
    assert.deepEqual(persistedTags, [
      { label: "Quick Meals", slug: "quick-meals" },
    ]);
    assert.equal(rejectedTag.length, 0);
  } finally {
    await deleteRecipeTestAuthor(authorId);
    await deleteRecipeTestTags([...expectedSlugs, "data03-six"]);
  }
});

test("tag assignment rejects a missing recipe without persisting its tag", async () => {
  const slug = "missing-recipe-tag";

  try {
    await assert.rejects(
      addRecipeTag(crypto.randomUUID(), "Missing Recipe Tag"),
      RecipeNotFoundError,
    );
    assert.equal(
      (
        await db.select({ id: tags.id }).from(tags).where(eq(tags.slug, slug))
      ).length,
      0,
    );
  } finally {
    await deleteRecipeTestTags([slug]);
  }
});

test("recipe-tag joins cascade when either parent is deleted", async () => {
  const authorId = await createRecipeTestAuthor("tag-cascade");
  const firstRecipeId = await createRecipeTestDraft(authorId, "First cascade");
  const secondRecipeId = await createRecipeTestDraft(authorId, "Second cascade");
  const slug = "cascade-tag";

  try {
    const assignedTag = await addRecipeTag(firstRecipeId, "Cascade Tag");
    await addRecipeTag(secondRecipeId, "Cascade Tag");

    await db.delete(recipes).where(eq(recipes.id, firstRecipeId));
    assert.equal(
      (
        await db
          .select()
          .from(recipeTags)
          .where(eq(recipeTags.recipeId, firstRecipeId))
      ).length,
      0,
    );
    assert.equal(
      (
        await db
          .select()
          .from(recipeTags)
          .where(
            and(
              eq(recipeTags.recipeId, secondRecipeId),
              eq(recipeTags.tagId, assignedTag.id),
            ),
          )
      ).length,
      1,
    );

    await db.delete(tags).where(eq(tags.id, assignedTag.id));
    assert.equal(
      (
        await db
          .select()
          .from(recipeTags)
          .where(eq(recipeTags.recipeId, secondRecipeId))
      ).length,
      0,
    );
  } finally {
    await deleteRecipeTestAuthor(authorId);
    await deleteRecipeTestTags([slug]);
  }
});
