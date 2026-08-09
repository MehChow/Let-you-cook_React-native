import assert from "node:assert/strict";
import { after, test } from "node:test";

import { pool } from "../db/client";
import { OTHER_CATEGORY_ID } from "./categories";

// Creates one isolated recipe author for lifecycle database assertions.
const createAuthor = async (suffix: string): Promise<string> => {
  const result = await pool.query<{ id: string }>(
    `insert into users (email, password_hash)
     values ($1, 'recipe-lifecycle-test')
     returning id`,
    [`recipe-lifecycle-${suffix}-${Date.now()}@example.com`],
  );
  const authorId = result.rows[0]?.id;
  assert.ok(authorId);
  return authorId;
};

// Removes one recipe test author and every cascading aggregate row.
const deleteAuthor = async (authorId: string): Promise<void> => {
  await pool.query("delete from users where id = $1", [authorId]);
};

after(async () => {
  await pool.end();
});

test("new recipes persist as version-one drafts without lifecycle timestamps", async () => {
  const authorId = await createAuthor("defaults");

  try {
    const result = await pool.query<{
      archived_at: Date | null;
      published_at: Date | null;
      removed_at: Date | null;
      status: string;
      version: number;
    }>(
      `insert into recipes
        (user_id, title, description, category_id, cook_time_minutes, servings)
       values ($1, 'Lifecycle defaults', 'Defaults stay private.', $2, 10, 1)
       returning status, version, published_at, archived_at, removed_at`,
      [authorId, OTHER_CATEGORY_ID],
    );

    assert.deepEqual(result.rows[0], {
      archived_at: null,
      published_at: null,
      removed_at: null,
      status: "draft",
      version: 1,
    });
  } finally {
    await deleteAuthor(authorId);
  }
});

test("recipes accept every approved lifecycle value and explicit transition time", async () => {
  const authorId = await createAuthor("values");
  const transitionTime = new Date("2026-08-09T02:00:00.000Z");

  try {
    const result = await pool.query<{
      archived_at: Date | null;
      published_at: Date | null;
      removed_at: Date | null;
      status: string;
    }>(
      `insert into recipes
        (user_id, title, description, category_id, cook_time_minutes, servings,
         status, published_at, archived_at, removed_at)
       values
        ($1, 'Draft', 'Lifecycle value.', $3, 10, 1, 'draft', null, null, null),
        ($1, 'Published', 'Lifecycle value.', $3, 10, 1, 'published', $2, null, null),
        ($1, 'Archived', 'Lifecycle value.', $3, 10, 1, 'archived', null, $2, null),
        ($1, 'Removed', 'Lifecycle value.', $3, 10, 1, 'removed', null, null, $2)
       returning status, published_at, archived_at, removed_at`,
      [authorId, transitionTime, OTHER_CATEGORY_ID],
    );

    assert.deepEqual(
      result.rows.map((row) => row.status),
      ["draft", "published", "archived", "removed"],
    );
    assert.equal(result.rows[1]?.published_at?.toISOString(), transitionTime.toISOString());
    assert.equal(result.rows[2]?.archived_at?.toISOString(), transitionTime.toISOString());
    assert.equal(result.rows[3]?.removed_at?.toISOString(), transitionTime.toISOString());
  } finally {
    await deleteAuthor(authorId);
  }
});

test("recipes reject unknown lifecycle values and nonpositive versions", async () => {
  const authorId = await createAuthor("constraints");
  const values = [
    { status: "unknown", version: 1 },
    { status: "draft", version: 0 },
  ];

  try {
    for (const value of values) {
      await assert.rejects(
        pool.query(
          `insert into recipes
            (user_id, title, description, category_id, cook_time_minutes, servings,
             status, version)
           values ($1, 'Invalid lifecycle', 'Must be rejected.', $4, 10, 1, $2, $3)`,
          [authorId, value.status, value.version, OTHER_CATEGORY_ID],
        ),
        (error: unknown) =>
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "23514",
      );
    }
  } finally {
    await deleteAuthor(authorId);
  }
});

test("database recipe indexes preserve the approved lifecycle query tuples", async () => {
  const result = await pool.query<{ indexdef: string; indexname: string }>(
    `select indexname, indexdef
       from pg_indexes
      where schemaname = 'public'
        and tablename = 'recipes'
        and indexname in (
          'recipes_status_published_id_idx',
          'recipes_category_status_published_idx',
          'recipes_author_status_updated_idx'
        )
      order by indexname`,
  );

  assert.deepEqual(
    result.rows.map(({ indexname }) => indexname),
    [
      "recipes_author_status_updated_idx",
      "recipes_category_status_published_idx",
      "recipes_status_published_id_idx",
    ],
  );
  assert.match(result.rows[0]?.indexdef ?? "", /\(user_id, status, updated_at\)$/);
  assert.match(
    result.rows[1]?.indexdef ?? "",
    /\(category_id, status, published_at\)$/,
  );
  assert.match(result.rows[2]?.indexdef ?? "", /\(status, published_at, id\)$/);
});
