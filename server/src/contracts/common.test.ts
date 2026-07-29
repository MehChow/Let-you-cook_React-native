import assert from "node:assert/strict";
import { test } from "node:test";

import { z } from "zod";

import {
  type CursorPage,
  apiErrorEnvelopeSchema,
  cursorPageSchema,
  isoTimestampSchema,
  nonValidationErrorCodes,
  opaqueIdSchema,
  pageInfoSchema,
} from "./common";
import { healthResponseSchema } from "./system";
import { errorDefinitions } from "../http/errors";

test("common scalar schemas accept only documented values", () => {
  assert.equal(opaqueIdSchema.safeParse("opaque-id").success, true);
  assert.equal(opaqueIdSchema.safeParse("").success, false);
  assert.equal(
    isoTimestampSchema.safeParse("2026-07-30T03:00:00.000Z").success,
    true,
  );
  assert.equal(
    isoTimestampSchema.safeParse("2026-07-30T11:00:00.000+08:00").success,
    false,
  );
});

test("page info enforces cursor and has-next consistency", () => {
  assert.deepEqual(pageInfoSchema.parse({
    nextCursor: null,
    hasNextPage: false,
  }), {
    nextCursor: null,
    hasNextPage: false,
  });
  assert.equal(
    pageInfoSchema.safeParse({
      nextCursor: "next",
      hasNextPage: true,
    }).success,
    true,
  );
  assert.equal(
    pageInfoSchema.safeParse({
      nextCursor: null,
      hasNextPage: true,
    }).success,
    false,
  );
  assert.equal(
    pageInfoSchema.safeParse({
      nextCursor: "unexpected",
      hasNextPage: false,
    }).success,
    false,
  );
});

test("cursor page schema validates items and rejects unknown output keys", () => {
  const recipePageSchema = cursorPageSchema(
    z.strictObject({ id: z.string().min(1) }),
  );

  const typedPage: CursorPage<{ id: string }> = recipePageSchema.parse({
    items: [{ id: "recipe-a" }],
    pageInfo: { nextCursor: null, hasNextPage: false },
  });

  assert.equal(typedPage.items[0]?.id, "recipe-a");
  assert.equal(
    recipePageSchema.safeParse({
      items: [{ id: "recipe-a", passwordHash: "private" }],
      pageInfo: { nextCursor: null, hasNextPage: false },
    }).success,
    false,
  );
  assert.equal(
    recipePageSchema.safeParse({
      items: [],
      pageInfo: { nextCursor: null, hasNextPage: false },
      internalCount: 0,
    }).success,
    false,
  );
});

test("validation errors require fieldErrors and reject unknown fields", () => {
  const valid = {
    error: {
      code: "validation_failed",
      message: "Some fields need attention.",
      fieldErrors: { email: ["Enter a valid email."] },
      requestId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
    },
  };

  assert.deepEqual(apiErrorEnvelopeSchema.parse(valid), valid);
  assert.equal(
    apiErrorEnvelopeSchema.safeParse({
      error: {
        code: "validation_failed",
        message: "Some fields need attention.",
        requestId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
      },
    }).success,
    false,
  );
  assert.equal(
    apiErrorEnvelopeSchema.safeParse({
      ...valid,
      stack: "private",
    }).success,
    false,
  );
  assert.equal(
    apiErrorEnvelopeSchema.safeParse({
      error: { ...valid.error, stack: "private" },
    }).success,
    false,
  );
});

test("non-validation errors use closed codes and forbid fieldErrors", () => {
  const valid = {
    error: {
      code: "resource_not_found",
      message: "The requested resource was not found.",
      requestId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
    },
  };

  assert.deepEqual(apiErrorEnvelopeSchema.parse(valid), valid);
  assert.equal(
    apiErrorEnvelopeSchema.safeParse({
      error: { ...valid.error, fieldErrors: { id: ["No."] } },
    }).success,
    false,
  );
  assert.equal(
    apiErrorEnvelopeSchema.safeParse({
      error: { ...valid.error, code: "invented_code" },
    }).success,
    false,
  );
  assert.deepEqual(
    Object.keys(errorDefinitions).sort(),
    [...nonValidationErrorCodes].sort(),
  );
});

test("health response is a strict literal contract", () => {
  assert.deepEqual(healthResponseSchema.parse({ ok: true }), { ok: true });
  assert.equal(healthResponseSchema.safeParse({ ok: false }).success, false);
  assert.equal(
    healthResponseSchema.safeParse({ ok: true, databaseUrl: "private" })
      .success,
    false,
  );
});
