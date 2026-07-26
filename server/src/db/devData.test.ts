import assert from "node:assert/strict";
import { test } from "node:test";

import {
  assertSafeDevelopmentDatabase,
  formatDevelopmentResetSuccess,
} from "./devData";

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

test("accepts the documented PostgreSQL protocol alias", () => {
  assert.doesNotThrow(() =>
    assertSafeDevelopmentDatabase(
      "postgresql://postgres:postgres@localhost:5432/letyoucook",
    ),
  );
});

test("rejects a socket URL that redirects the parsed database", () => {
  assert.throws(
    () =>
      assertSafeDevelopmentDatabase(
        "socket://localhost/letyoucook?db=production",
      ),
    {
      message: "DATABASE_URL must use a PostgreSQL protocol",
    },
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

test("rejects a query-string host override", () => {
  assert.throws(
    () =>
      assertSafeDevelopmentDatabase(
        "postgres://user:secret@localhost:5432/letyoucook?host=db.example.com",
      ),
    /Refusing to reset a database with connection-addressing overrides/,
  );
});

test("rejects query-string database addressing overrides", () => {
  for (const parameter of ["db", "database"]) {
    assert.throws(
      () =>
        assertSafeDevelopmentDatabase(
          `postgres://user:secret@localhost:5432/letyoucook?${parameter}=production`,
        ),
      /Refusing to reset a database with connection-addressing overrides/,
    );
  }
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

test("rejects a malformed database URL with a sanitized message", () => {
  assert.throws(
    () =>
      assertSafeDevelopmentDatabase(
        "postgres://postgres:top-secret@[invalid-host/letyoucook",
      ),
    {
      message: "DATABASE_URL is invalid for development reset",
    },
  );
});

test("formats reset success without the development password", () => {
  const resultWithUnexpectedCredential = {
    password: "coffee123",
    unverifiedEmail: "unverified@letyoucook.local",
    verifiedEmail: "verified@letyoucook.local",
  };
  const output = formatDevelopmentResetSuccess(resultWithUnexpectedCredential);

  assert.match(output, /unverified@letyoucook\.local/);
  assert.match(output, /verified@letyoucook\.local/);
  assert.doesNotMatch(output, /coffee123/);
  assert.doesNotMatch(output, /password/i);
});
