import assert from "node:assert/strict";
import { after, test } from "node:test";

import { eq } from "drizzle-orm";

import { app } from "../app";
import { db, pool } from "../db/client";
import { users } from "../db/schema";

process.env.JWT_SECRET ??= "test-secret";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  tokens: AuthTokens;
}

interface ProfileResponse {
  profile: {
    id: string;
    email: string;
    displayName: string;
    bio: string | null;
    avatarImageUrl: string | null;
  };
}

const postJson = async <T>(path: string, body: object, expectedStatus: number) => {
  const response = await app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, expectedStatus);
  return (await response.json()) as T;
};

const getJson = async <T>(path: string, accessToken: string, expectedStatus: number) => {
  const response = await app.request(path, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  assert.equal(response.status, expectedStatus);
  return (await response.json()) as T;
};

after(async () => {
  await pool.end();
});

test("auth and profile endpoints work against local Postgres", async (t) => {
  try {
    await pool.query("select 1");
  } catch {
    t.skip("local Postgres is unavailable");
    return;
  }

  const email = `smoke-${Date.now()}@example.com`;
  const password = "correct-horse-batter";

  await db.delete(users).where(eq(users.email, email));

  try {
    const signup = await postJson<AuthResponse>(
      "/auth/signup",
      { email, password, displayName: "Smoke Tester" },
      201,
    );

    assert.equal(signup.user.email, email);
    assert.ok(signup.tokens.accessToken);
    assert.ok(signup.tokens.refreshToken);

    const login = await postJson<AuthResponse>("/auth/login", { email, password }, 200);
    assert.equal(login.user.id, signup.user.id);

    const profile = await getJson<ProfileResponse>("/profiles/me", login.tokens.accessToken, 200);
    assert.equal(profile.profile.email, email);
    assert.equal(profile.profile.displayName, "Smoke Tester");

    const refreshed = await postJson<AuthTokens>(
      "/auth/refresh",
      { refreshToken: login.tokens.refreshToken },
      200,
    );
    assert.ok(refreshed.accessToken);
    assert.ok(refreshed.refreshToken);
    assert.notEqual(refreshed.refreshToken, login.tokens.refreshToken);

    const logout = await postJson<{ ok: boolean }>(
      "/auth/logout",
      { refreshToken: refreshed.refreshToken },
      200,
    );
    assert.equal(logout.ok, true);
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});
