import { inArray } from "drizzle-orm";

import { db } from "../db/client";
import { recipes, tags, users } from "../db/schema";
import { OTHER_CATEGORY_ID } from "./categories";

// Creates one isolated author row for recipe data integration tests.
export const createRecipeTestAuthor = async (prefix: string): Promise<string> => {
  const [author] = await db
    .insert(users)
    .values({
      email: `${prefix}-${Date.now()}-${crypto.randomUUID()}@example.com`,
      passwordHash: "recipe-data-test",
    })
    .returning({ id: users.id });
  if (!author) {
    throw new Error("Recipe test author was not created.");
  }
  return author.id;
};

// Creates one categorized draft owned by the requested test author.
export const createRecipeTestDraft = async (
  authorId: string,
  title: string,
): Promise<string> => {
  const [recipe] = await db
    .insert(recipes)
    .values({
      userId: authorId,
      title,
      description: "Recipe data integration fixture.",
      categoryId: OTHER_CATEGORY_ID,
      cookTimeMinutes: 10,
      servings: 1,
    })
    .returning({ id: recipes.id });
  if (!recipe) {
    throw new Error("Recipe test draft was not created.");
  }
  return recipe.id;
};

// Removes one recipe test author and every cascading recipe assignment.
export const deleteRecipeTestAuthor = async (authorId: string): Promise<void> => {
  await db.delete(users).where(inArray(users.id, [authorId]));
};

// Removes normalized test tags after their recipe joins are gone.
export const deleteRecipeTestTags = async (slugs: string[]): Promise<void> => {
  if (slugs.length > 0) {
    await db.delete(tags).where(inArray(tags.slug, slugs));
  }
};
