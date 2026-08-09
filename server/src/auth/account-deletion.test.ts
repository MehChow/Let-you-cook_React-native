import assert from "node:assert/strict";
import { after, test } from "node:test";

import { eq } from "drizzle-orm";

import { createApp } from "../app";
import type {
  AuthChallengeResponse,
  AuthSessionResponse,
} from "../contracts/auth";
import { db, pool } from "../db/client";
import { recipeImages, recipes, reports, users } from "../db/schema";
import { InMemoryEmailSender } from "../email/emailSender";
import { OTHER_CATEGORY_ID } from "../recipes/categories";

process.env.JWT_SECRET ??= "test-secret";

const emailSender = new InMemoryEmailSender();
const app = createApp({ emailSender });

// Sends JSON through the real application route tree.
const postJsonResponse = (path: string, body: object) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

// Registers and confirms a verified account through delivered OTP state.
const signUpAndVerify = async (email: string, password: string) => {
  const signupResponse = await postJsonResponse("/v1/auth/signup", {
    email,
    password,
    displayName: "Deletion Tester",
  });
  assert.equal(signupResponse.status, 201);
  const challenge = (await signupResponse.json()) as AuthChallengeResponse;
  const code = emailSender.messages.at(-1)?.text.match(/\b\d{6}\b/)?.[0];
  assert.ok(code);

  const confirmationResponse = await postJsonResponse(
    "/v1/auth/email-verification/confirmations",
    { challengeId: challenge.challengeId, code },
  );
  assert.equal(confirmationResponse.status, 200);
  return (await confirmationResponse.json()) as AuthSessionResponse;
};

after(async () => {
  await pool.end();
});

test("account deletion irreversibly anonymizes identity and invalidates every session", async () => {
  const email = `delete-account-${Date.now()}@example.com`;
  const password = "correct-horse-batter";
  let userId: string | undefined;

  try {
    const firstSession = await signUpAndVerify(email, password);
    userId = firstSession.user.id;
    const loginResponse = await postJsonResponse("/v1/auth/login", {
      email,
      password,
    });
    assert.equal(loginResponse.status, 200);
    const secondSession = (await loginResponse.json()) as AuthSessionResponse;

    const [recipe] = await db
      .insert(recipes)
      .values({
        userId,
        title: "Retained soup",
        description: "Published content remains available.",
        categoryId: OTHER_CATEGORY_ID,
        cookTimeMinutes: 20,
        servings: 2,
        status: "published",
      })
      .returning({ id: recipes.id });
    const [report] = await db
      .insert(reports)
      .values({
        reporterId: userId,
        reportedUserId: userId,
        reason: "test evidence",
      })
      .returning({ id: reports.id });
    const [draftRecipe] = await db
      .insert(recipes)
      .values({
        userId,
        title: "Private draft",
        description: "Private media must be detached.",
        categoryId: OTHER_CATEGORY_ID,
        cookTimeMinutes: 10,
        servings: 1,
        status: "draft",
      })
      .returning({ id: recipes.id });
    const retainedImages = await db
      .insert(recipeImages)
      .values([
        {
          recipeId: recipe.id,
          userId,
          storageKey: `published-${userId}`,
          imageUrl: "https://images.example/published",
        },
        {
          recipeId: draftRecipe.id,
          userId,
          storageKey: `draft-${userId}`,
          imageUrl: "https://images.example/draft",
        },
        {
          recipeId: null,
          userId,
          storageKey: `private-${userId}`,
          imageUrl: "https://images.example/private",
        },
      ])
      .returning({ id: recipeImages.id, recipeId: recipeImages.recipeId });

    const deletionResponse = await app.request("/v1/users/me", {
      method: "DELETE",
      headers: { authorization: `Bearer ${firstSession.tokens.accessToken}` },
    });

    assert.equal(deletionResponse.status, 200);
    assert.deepEqual(await deletionResponse.json(), { ok: true });

    const userResult = await pool.query<{
      account_status: string;
      deleted_at: Date | null;
      email: string;
      email_verified_at: Date | null;
      password_hash: string;
    }>(
      `select account_status, deleted_at, email, email_verified_at, password_hash
       from users where id = $1`,
      [userId],
    );
    const tombstone = userResult.rows[0];
    assert.ok(tombstone);
    assert.equal(tombstone.account_status, "deleted");
    assert.ok(tombstone.deleted_at);
    assert.equal(tombstone.email_verified_at, null);
    assert.match(tombstone.email, /^deleted:/);
    assert.equal(tombstone.email.includes(email), false);
    assert.match(tombstone.password_hash, /^deleted:/);

    const profileResult = await pool.query(
      "select user_id from profiles where user_id = $1",
      [userId],
    );
    const challengeResult = await pool.query(
      "select id from auth_challenges where user_id = $1",
      [userId],
    );
    const tokenResult = await pool.query<{ revoked_at: Date | null }>(
      "select revoked_at from refresh_tokens where user_id = $1",
      [userId],
    );
    assert.equal(profileResult.rowCount, 0);
    assert.equal(challengeResult.rowCount, 0);
    assert.equal(tokenResult.rowCount, 2);
    assert.equal(tokenResult.rows.every((token) => token.revoked_at !== null), true);

    assert.ok(recipe);
    assert.ok(report);
    assert.equal(
      (await db.select().from(recipes).where(eq(recipes.id, recipe.id))).length,
      1,
    );
    assert.equal(
      (await db.select().from(reports).where(eq(reports.id, report.id))).length,
      1,
    );
    const remainingImages = await db
      .select({ id: recipeImages.id, recipeId: recipeImages.recipeId })
      .from(recipeImages)
      .where(eq(recipeImages.userId, userId));
    assert.deepEqual(remainingImages, [
      retainedImages.find((image) => image.recipeId === recipe.id),
    ]);

    const oldAccessResponse = await app.request("/v1/profiles/me", {
      headers: { authorization: `Bearer ${secondSession.tokens.accessToken}` },
    });
    assert.equal(oldAccessResponse.status, 401);
    assert.equal(
      ((await oldAccessResponse.json()) as { error: { code: string } }).error.code,
      "invalid_access_token",
    );

    const oldRefreshResponse = await postJsonResponse("/v1/auth/refresh", {
      refreshToken: secondSession.tokens.refreshToken,
    });
    assert.equal(oldRefreshResponse.status, 403);

    const replacementSignup = await postJsonResponse("/v1/auth/signup", {
      email,
      password,
      displayName: "Replacement Account",
    });
    assert.equal(replacementSignup.status, 201);
  } finally {
    if (userId) {
      await pool.query("delete from users where id = $1 or email = $2", [userId, email]);
    } else {
      await db.delete(users).where(eq(users.email, email));
    }
  }
});

test("account deletion requires a valid access token", async () => {
  const response = await app.request("/v1/users/me", { method: "DELETE" });
  assert.equal(response.status, 401);
  assert.equal(
    ((await response.json()) as { error: { code: string } }).error.code,
    "authentication_required",
  );
});
