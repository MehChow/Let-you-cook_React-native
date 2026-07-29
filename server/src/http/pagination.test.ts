import assert from "node:assert/strict";
import { test } from "node:test";

import {
  type CursorContext,
  MAX_CURSOR_LENGTH,
  buildCursorPage,
  decodeCursor,
  encodeCursor,
  paginationQuerySchema,
} from "./pagination";

// Encodes deliberately invalid payloads without using the production codec.
const encodeRawPayload = (payload: string) =>
  Buffer.from(payload, "utf8").toString("base64url");

// Finds another base64url spelling that decodes to identical bytes.
const createNonCanonicalAlias = (token: string) => {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const expectedBytes = Buffer.from(token, "base64url");

  for (const character of alphabet) {
    const candidate = `${token.slice(0, -1)}${character}`;
    if (
      candidate !== token &&
      Buffer.from(candidate, "base64url").equals(expectedBytes)
    ) {
      return candidate;
    }
  }

  throw new Error("The fixture has no non-canonical base64url alias.");
};

test("pagination query defaults to 20 and accepts canonical bounds", () => {
  assert.deepEqual(paginationQuerySchema.parse({}), { limit: 20 });
  assert.deepEqual(paginationQuerySchema.parse({ limit: "1" }), { limit: 1 });
  assert.deepEqual(
    paginationQuerySchema.parse({ cursor: "opaque", limit: "50" }),
    { cursor: "opaque", limit: 50 },
  );
});

test("pagination query rejects noncanonical and out-of-range limits", () => {
  for (const limit of ["0", "01", "1.5", "+1", "1e1", " 1", "51"]) {
    assert.equal(paginationQuerySchema.safeParse({ limit }).success, false);
  }
});

test("pagination query rejects empty and oversized cursors", () => {
  assert.equal(MAX_CURSOR_LENGTH, 2048);
  assert.equal(paginationQuerySchema.safeParse({ cursor: "" }).success, false);
  assert.equal(
    paginationQuerySchema.safeParse({
      cursor: "x".repeat(2048),
    }).success,
    true,
  );
  assert.equal(
    paginationQuerySchema.safeParse({
      cursor: "x".repeat(2049),
    }).success,
    false,
  );
});

test("cursor encoding is URL-safe and normalizes context key order", () => {
  const first = encodeCursor(
    { sort: "newest", categoryId: "category-a" },
    ["2026-07-30T00:00:00.000Z", "recipe-a"],
  );
  const second = encodeCursor(
    { categoryId: "category-a", sort: "newest" },
    ["2026-07-30T00:00:00.000Z", "recipe-a"],
  );

  assert.equal(first, second);
  assert.match(first, /^[A-Za-z0-9_-]+$/);

  const unicodeFirst = encodeCursor(
    { ä: "precomposed", "a\u0308": "decomposed" },
    ["recipe-a"],
  );
  const unicodeSecond = encodeCursor(
    { "a\u0308": "decomposed", ä: "precomposed" },
    ["recipe-a"],
  );

  assert.equal(unicodeFirst, unicodeSecond);
});

test("cursor round-trips allowed ordered values", () => {
  const context = { sort: "topRated", q: "noodles" };
  const token = encodeCursor(context, [4.75, 19, null, "recipe-a"]);

  assert.deepEqual(decodeCursor(token, context, 4), {
    success: true,
    values: [4.75, 19, null, "recipe-a"],
  });
});

test("cursor decoder rejects malformed and incompatible tokens", () => {
  const context = { sort: "newest" };
  const invalidTokens = [
    "%",
    encodeRawPayload("{"),
    encodeRawPayload(
      JSON.stringify({ v: 2, context, values: ["date", "id"] }),
    ),
    encodeRawPayload(
      JSON.stringify({
        v: 1,
        context,
        values: [{ nested: true }, "id"],
      }),
    ),
    encodeRawPayload(
      JSON.stringify({ v: 1, context, values: [true, "id"] }),
    ),
    encodeRawPayload(
      '{"v":1,"context":{"sort":"newest"},"values":[1e400,"id"]}',
    ),
    "x".repeat(MAX_CURSOR_LENGTH + 1),
  ];

  for (const token of invalidTokens) {
    assert.deepEqual(decodeCursor(token, context, 2), { success: false });
  }

  const valid = encodeCursor(context, ["date", "id"]);
  const nonCanonicalAlias = createNonCanonicalAlias(valid);
  const invalidUtf8Payload = Buffer.from(
    '{"v":1,"context":{"sort":"newest"},"values":["date","id"]}',
    "utf8",
  );
  const invalidByteIndex = invalidUtf8Payload.indexOf("newest");
  invalidUtf8Payload[invalidByteIndex] = 0xff;
  const invalidUtf8Token = invalidUtf8Payload.toString("base64url");

  assert.deepEqual(decodeCursor(nonCanonicalAlias, context, 2), {
    success: false,
  });
  assert.deepEqual(decodeCursor(invalidUtf8Token, { sort: "�ewest" }, 2), {
    success: false,
  });
  assert.deepEqual(decodeCursor(valid, { sort: "quickest" }, 2), {
    success: false,
  });
  assert.deepEqual(decodeCursor(valid, context, 1), { success: false });

  const invalidExpectedContext = {
    sort: undefined,
  } as unknown as CursorContext;
  const contextlessToken = encodeCursor({}, ["id"]);

  assert.deepEqual(decodeCursor(contextlessToken, invalidExpectedContext, 1), {
    success: false,
  });
});

test("cursor encoder rejects invalid scalar values", () => {
  const context = { sort: "newest" };

  assert.throws(() => encodeCursor(context, [Number.NaN]));
  assert.throws(() => encodeCursor(context, [Number.POSITIVE_INFINITY]));
});

test("page builder uses limit plus one and cursors the last returned item", () => {
  const context = { sort: "topRated" };
  const rows = [
    { id: "recipe-a", score: 5 },
    { id: "recipe-b", score: 4.5 },
    { id: "recipe-c", score: 4 },
  ] as const;
  const original = [...rows];

  const page = buildCursorPage(rows, 2, context, (row) => [
    row.score,
    row.id,
  ]);

  assert.deepEqual(page.items, rows.slice(0, 2));
  assert.equal(page.pageInfo.hasNextPage, true);
  assert.equal(typeof page.pageInfo.nextCursor, "string");
  assert.deepEqual(
    decodeCursor(page.pageInfo.nextCursor ?? "", context, 2),
    { success: true, values: [4.5, "recipe-b"] },
  );
  assert.deepEqual(rows, original);
});

test("page builder returns a null cursor when no next page exists", () => {
  const rows = [{ id: "recipe-a", publishedAt: "2026-07-30T00:00:00.000Z" }];

  assert.deepEqual(
    buildCursorPage(rows, 2, { sort: "newest" }, (row) => [
      row.publishedAt,
      row.id,
    ]),
    {
      items: rows,
      pageInfo: { nextCursor: null, hasNextPage: false },
    },
  );
});

test("page builder cursors an undefined item when the generic permits it", () => {
  const context = { sort: "newest" };
  const page = buildCursorPage([undefined, undefined], 1, context, () => [
    "undefined-row",
  ]);

  assert.equal(page.pageInfo.hasNextPage, true);
  assert.deepEqual(
    decodeCursor(page.pageInfo.nextCursor ?? "", context, 1),
    { success: true, values: ["undefined-row"] },
  );
});

test("page builder rejects invalid caller limits and excessive rows", () => {
  const context = { sort: "newest" };
  const values = (row: { id: string }) => [row.id];

  for (const limit of [0, 1.5, 51]) {
    assert.throws(() => buildCursorPage([], limit, context, values));
  }

  assert.throws(() =>
    buildCursorPage(
      [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }],
      2,
      context,
      values,
    ),
  );
});
