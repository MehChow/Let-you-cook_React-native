# API-03 Cursor Pagination and Deterministic Sorting Design

Status: approved by delegated owner decision on 2026-07-30

## Goal

Define one reusable forward-cursor contract for future list endpoints and make
their ordering rules precise enough that equal primary sort values cannot skip
or duplicate unchanged rows.

## Scope

API-03 adds:

- strict shared page-size constants and query parsing;
- a versioned URL-safe cursor codec;
- cursor binding to the normalized sort and filter context;
- a generic `limit + 1` page builder;
- durable deterministic ordering rules for planned recipe, review, favourite,
  and profile lists.

API-03 does not implement a recipe feed, database queries, filters, DTOs,
mobile infinite queries, schema changes, migrations, backward pagination,
snapshot isolation, or signing/encryption. Those belong to later feature tasks.

## Current State

No current route returns a paginated collection. Recipe, favourite, review, and
public-profile work is still pending. The durable contract only says that list
responses contain `items` and `pageInfo`, the default page size is 20, the
maximum is 50, and stable secondary keys are required.

## Approaches Considered

### 1. Shared codec and page builder, feature-owned seek predicates — selected

Create a small HTTP pagination module. It parses the common query fields,
encodes ordered cursor values with their normalized query context, safely
decodes compatible tokens, and turns `limit + 1` rows into a response page.
Each feature later owns its typed Drizzle seek predicate because only the
feature knows its columns, joins, nullability, and authorization filters.

This gives every feature one wire contract without inventing generic SQL types
or premature endpoints.

### 2. Generic Drizzle keyset-query builder

A generic builder could reduce repeated comparisons, but Drizzle expressions
with mixed directions and nullable computed aggregates become difficult to
type and audit. Authorization and visibility predicates are feature-specific.
The abstraction would be speculative before the first real list query.

### 3. Offset pagination hidden inside an opaque token

Encoding an offset is simple but still shifts when rows are inserted or
removed, and it performs increasingly expensive scans. It does not satisfy the
project's cursor-pagination requirement.

## Public Contract

`server/src/http/pagination.ts` owns:

```ts
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const MAX_CURSOR_LENGTH = 2048;

export const paginationQuerySchema;

export type CursorValue = string | number | null;
export type CursorContext = Readonly<Record<string, string>>;

export const encodeCursor: (
  context: CursorContext,
  values: ReadonlyArray<CursorValue>,
) => string;

export const decodeCursor: (
  token: string,
  expectedContext: CursorContext,
  expectedValueCount: number,
) => CursorDecodeResult;

export const buildCursorPage: <T>(
  rows: ReadonlyArray<T>,
  limit: number,
  context: CursorContext,
  cursorValues: (item: T) => ReadonlyArray<CursorValue>,
) => CursorPage<T>;
```

`paginationQuerySchema` accepts an optional non-empty cursor no longer than
2,048 characters. `limit` is an optional canonical decimal integer from 1
through 50. Missing limit becomes 20. It rejects decimals, signs, exponents,
whitespace-only values, zero, and leading-zero variants.

## Cursor Token

The cursor is base64url-encoded UTF-8 JSON:

```json
{
  "v": 1,
  "context": {
    "sort": "newest",
    "q": "",
    "categoryId": ""
  },
  "values": ["2026-07-30T00:00:00.000Z", "opaque-recipe-id"]
}
```

Context keys are sorted before encoding, making equivalent normalized contexts
produce the same token. A feature includes every filter and sort option that
can change membership or order. Missing optional filters use one documented
normalized representation, normally an empty string. Repeated values are
normalized before joining in a feature-owned canonical form.

Decoding succeeds only when:

- the token is within the length limit and is valid base64url JSON;
- the payload has exactly version 1, context, and values;
- its context exactly matches the expected normalized context;
- it contains the expected number of cursor values;
- values are strings, finite numbers, or null.

All other inputs return a failure result; raw parse errors are not exposed.
Future routes map that failure to `validation_failed` on the `cursor` field.

The token is opaque to clients but is not a credential. It is deliberately not
signed or encrypted. Every endpoint must still reapply authentication,
visibility, block, moderation, and ownership rules. A modified but
schema-valid cursor may only change the caller's position within data they are
already allowed to query.

## Page Construction

Feature queries request `limit + 1` rows. `buildCursorPage`:

1. validates that `limit` is an integer from 1 through 50;
2. sets `hasNextPage` when more than `limit` rows were supplied;
3. returns at most `limit` items;
4. emits `nextCursor` from the last returned item only when another page
   exists;
5. otherwise returns `nextCursor: null`.

The helper never mutates the supplied rows. Supplying more than `limit + 1`
rows is a programmer error, because accepting it could hide a broken query
limit.

## Deterministic Ordering Rules

Every paginated query must:

- use keyset comparisons, never a decoded offset;
- list every `ORDER BY` expression in the cursor in the same order;
- end with an immutable unique identifier as the final tie-breaker;
- use the same direction and explicit null behavior in both `ORDER BY` and the
  seek predicate;
- apply authorization and visibility filters before the page limit;
- reject a cursor when normalized filters or sort do not match its context.

Initial endpoint rules are:

| List | Ordered keys |
| --- | --- |
| Published recipes, `newest` | `publishedAt DESC, id DESC` |
| Published recipes, `quickest` | `cookTimeMinutes ASC, publishedAt DESC, id DESC` |
| Published recipes, `topRated` | `averageRating DESC, reviewCount DESC, publishedAt DESC, id DESC` |
| Published recipe search, `relevance` | `searchRank DESC, publishedAt DESC, id DESC` |
| Public authored recipes | `publishedAt DESC, id DESC` |
| Current user's recipes | `updatedAt DESC, id DESC` |
| User favourites | `favouritedAt DESC, recipeId DESC` |
| Recipe reviews | `createdAt DESC, id DESC` |

Computed values such as `averageRating` and `searchRank` must use a documented
non-null SQL expression before ordering. `relevance` requires a non-blank
search query; without one, the route normalizes to `newest`.

These are live keyset pages, not a frozen snapshot. Inserts and mutable ranking
values can change later pages between requests. The contract prevents
ambiguity among equal values and avoids offset drift; it does not promise
snapshot isolation.

## Errors and Compatibility

Malformed pagination query fields and incompatible cursors are request
validation failures. They will use API-02's standard `400 validation_failed`
envelope when attached to routes. No new error code is needed.

There is no backward compatibility obligation because no current endpoint
emits or accepts cursors. Cursor version changes must be additive or explicitly
reject older versions as validation failures.

## Verification

Focused native-independent server tests cover:

- default, minimum, maximum, and invalid limit inputs;
- deterministic encoding for reordered context keys;
- URL-safe token output and round-trip decoding;
- malformed, oversized, wrong-version, wrong-context, wrong-key-count, and
  invalid-value rejection;
- `limit + 1` slicing and cursor placement;
- no-next-page and invalid-caller-usage behavior.

API-03 then passes server type-check/tests, root lint/type-check, native-focused
Jest, and `git diff --check`. Expo web is never used.
