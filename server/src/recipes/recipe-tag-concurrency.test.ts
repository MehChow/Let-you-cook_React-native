import assert from "node:assert/strict";
import { after, test } from "node:test";

import { count, eq } from "drizzle-orm";

import { db, pool } from "../db/client";
import { recipeTags } from "../db/schema";
import {
  createRecipeTestAuthor,
  createRecipeTestDraft,
  deleteRecipeTestAuthor,
  deleteRecipeTestTags,
} from "./recipeTestUtils";
import { addRecipeTag, RecipeTagLimitError } from "./tagService";

// Creates an explicit entry/release gate for lock-order verification.
const createGate = () => {
  let signalEntered: () => void = () => undefined;
  let release: () => void = () => undefined;
  const entered = new Promise<void>((resolve) => {
    signalEntered = resolve;
  });
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });

  return {
    entered,
    release,
    // Signals that the recipe lock was acquired, then awaits release.
    async wait() {
      signalEntered();
      await released;
    },
  };
};

// Rejects if a concurrency observation point is never reached.
const waitForGate = (entered: Promise<void>) =>
  new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Recipe tag concurrency gate was not reached.")),
      1_000,
    );
    entered.then(
      () => {
        clearTimeout(timeout);
        resolve();
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });

// Reports whether a promise settles within the short lock-observation window.
const settlesQuickly = async (promise: Promise<void>): Promise<boolean> =>
  Promise.race([
    promise.then(() => true),
    new Promise<false>((resolve) => setTimeout(() => resolve(false), 100)),
  ]);

after(async () => {
  await pool.end();
});

test("concurrent fifth and sixth tags serialize on the recipe aggregate", async () => {
  const authorId = await createRecipeTestAuthor("tag-concurrency");
  const recipeId = await createRecipeTestDraft(authorId, "Concurrent tags");
  const slugs = [
    "concurrent-one",
    "concurrent-two",
    "concurrent-three",
    "concurrent-four",
    "concurrent-five",
    "concurrent-six",
  ];
  const firstLock = createGate();
  const secondLock = createGate();

  try {
    for (const label of [
      "Concurrent One",
      "Concurrent Two",
      "Concurrent Three",
      "Concurrent Four",
    ]) {
      await addRecipeTag(recipeId, label);
    }

    const fifth = addRecipeTag(recipeId, "Concurrent Five", {
      afterRecipeLock: firstLock.wait,
    });
    await waitForGate(firstLock.entered);
    const sixth = addRecipeTag(recipeId, "Concurrent Six", {
      afterRecipeLock: secondLock.wait,
    });

    assert.equal(await settlesQuickly(secondLock.entered), false);
    firstLock.release();
    await fifth;
    await waitForGate(secondLock.entered);
    secondLock.release();
    await assert.rejects(sixth, RecipeTagLimitError);

    const [assignmentCount] = await db
      .select({ value: count() })
      .from(recipeTags)
      .where(eq(recipeTags.recipeId, recipeId));
    assert.equal(assignmentCount?.value, 5);
  } finally {
    firstLock.release();
    secondLock.release();
    await deleteRecipeTestAuthor(authorId);
    await deleteRecipeTestTags(slugs);
  }
});
