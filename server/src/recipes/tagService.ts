import { and, count, eq, sql } from "drizzle-orm";

import { db } from "../db/client";
import { recipeTags, recipes, tags } from "../db/schema";

const MAX_RECIPE_TAGS = 5;

// Identifies a tag label that cannot produce a persisted identity.
export class InvalidTagLabelError extends Error {
  override name = "InvalidTagLabelError";
}

// Identifies a tag assignment targeting a recipe that does not exist.
export class RecipeNotFoundError extends Error {
  override name = "RecipeNotFoundError";
}

// Identifies an assignment that would exceed the recipe tag limit.
export class RecipeTagLimitError extends Error {
  override name = "RecipeTagLimitError";
}

export interface AssignedRecipeTag {
  id: string;
  label: string;
  slug: string;
}

export interface RecipeTagConcurrencyHooks {
  afterRecipeLock?: () => Promise<void>;
}

// Canonicalizes user tag text into one display label and unique slug.
export const normalizeTagInput = (
  input: string,
): { label: string; slug: string } => {
  const words = input.normalize("NFKC").trim().split(/\s+/u).filter(Boolean);
  const label = words
    .map((word) => {
      const [first = "", ...remaining] = Array.from(word);
      return `${first.toLocaleUpperCase("en-US")}${remaining
        .join("")
        .toLocaleLowerCase("en-US")}`;
    })
    .join(" ");
  const slug = label
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    throw new InvalidTagLabelError("Tag labels require a letter or number.");
  }

  return { label, slug };
};

// Atomically assigns one normalized tag under the recipe aggregate lock.
export const addRecipeTag = async (
  recipeId: string,
  input: string,
  concurrency: RecipeTagConcurrencyHooks = {},
): Promise<AssignedRecipeTag> => {
  const normalized = normalizeTagInput(input);

  return db.transaction(async (tx) => {
    const [recipe] = await tx
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1)
      .for("update");

    if (!recipe) {
      throw new RecipeNotFoundError("Recipe was not found.");
    }
    await concurrency.afterRecipeLock?.();

    const [tag] = await tx
      .insert(tags)
      .values(normalized)
      .onConflictDoUpdate({
        target: tags.slug,
        set: { label: sql`excluded.label` },
      })
      .returning({ id: tags.id, label: tags.label, slug: tags.slug });

    if (!tag) {
      throw new Error("Normalized tag could not be persisted.");
    }

    const [existingAssignment] = await tx
      .select({ tagId: recipeTags.tagId })
      .from(recipeTags)
      .where(
        and(
          eq(recipeTags.recipeId, recipeId),
          eq(recipeTags.tagId, tag.id),
        ),
      )
      .limit(1);
    if (existingAssignment) {
      return tag;
    }

    const [assignmentCount] = await tx
      .select({ value: count() })
      .from(recipeTags)
      .where(eq(recipeTags.recipeId, recipeId));
    if ((assignmentCount?.value ?? 0) >= MAX_RECIPE_TAGS) {
      throw new RecipeTagLimitError("Recipes may have at most five tags.");
    }

    await tx.insert(recipeTags).values({ recipeId, tagId: tag.id });
    await tx
      .update(recipes)
      .set({
        updatedAt: new Date(),
        version: sql`${recipes.version} + 1`,
      })
      .where(eq(recipes.id, recipeId));
    return tag;
  });
};
