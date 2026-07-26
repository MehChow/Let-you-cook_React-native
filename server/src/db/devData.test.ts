import assert from "node:assert/strict";
import { test } from "node:test";

import { assertSafeDevelopmentDatabase } from "./devData";

test("accepts the documented local development database", () => {
  assert.doesNotThrow(() =>
    assertSafeDevelopmentDatabase(
      "postgres://postgres:postgres@localhost:5432/letyoucook",
    ),
  );
});

test("accepts the IPv6 loopback development database", () => {
  assert.doesNotThrow(() =>
    assertSafeDevelopmentDatabase(
      "postgres://postgres:postgres@[::1]:5432/letyoucook",
    ),
  );
});

test("rejects a remote database host", () => {
  assert.throws(
    () =>
      assertSafeDevelopmentDatabase(
        "postgres://user:secret@db.example.com:5432/letyoucook",
      ),
    /Refusing to reset a non-local database/,
  );
});

test("rejects a different local database name", () => {
  assert.throws(
    () =>
      assertSafeDevelopmentDatabase(
        "postgres://postgres:postgres@localhost:5432/postgres",
      ),
    /Refusing to reset a non-development database/,
  );
});

test("rejects a missing database URL", () => {
  assert.throws(
    () => assertSafeDevelopmentDatabase(""),
    /DATABASE_URL is required for development reset/,
  );
});
