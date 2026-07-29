# API and Data Model

Last reviewed: 2026-07-26

This is the target contract for moving Let You Cook from a mocked mobile
prototype to one production-shaped backend. It is a design guide, not a claim
that these routes/tables already exist. Current implementation status lives in
`docs/progress.md`.

## Architecture Decision

Keep one deployable Node 20 service:

- Hono HTTP application;
- REST-shaped `/v1` resources;
- Hono RPC types for the private TypeScript mobile client;
- Zod request/response boundary schemas;
- Drizzle over PostgreSQL;
- Cloudflare R2 for media bytes;
- SMTP through an application-owned email interface, with Mailpit locally;
- TanStack Query in the app for remote state.

Hono RPC is a type-sharing mechanism here, not permission to design
procedure-shaped routes. Export `AppType` from the composed Hono app and import
it with `import type` in the client. Keep both TypeScript projects strict. Public
DTOs and Zod schemas remain the durable contract; Drizzle row types do not cross
the API boundary.

Keep `/health` unversioned. New content APIs target `/v1`. Before more auth
integration, move or temporarily alias the existing unversioned auth/profile
routes in one coordinated server/client change.

## Contract Conventions

### Requests and Responses

- JSON fields use camelCase.
- Identifiers are opaque strings. Clients do not parse or order by them.
- Timestamps are UTC ISO 8601 strings.
- Mutations return the updated resource or a minimal accepted/deleted result,
  not an unrelated success message.
- List responses use cursor pagination:

```json
{
  "items": [],
  "pageInfo": {
    "nextCursor": null,
    "hasNextPage": false
  }
}
```

- Default list size is 20; maximum is 50. Servers fetch `limit + 1`, return at
  most `limit`, and set `nextCursor` from the last returned item only when the
  extra row exists.
- Cursors are forward-only, versioned base64url JSON tokens. They contain every
  ordered seek value and the normalized sort/filter context. A cursor is
  rejected with HTTP `400 validation_failed` and `fieldErrors.cursor` when it
  is malformed, unsupported, or does not match the current normalized query.
- Cursor opacity is not authorization or confidentiality. Every page reapplies
  authentication, ownership, visibility, block, and moderation rules.
- Paginated queries use keyset comparisons rather than decoded offsets. Every
  `ORDER BY` expression appears in the cursor in the same order, direction, and
  explicit null treatment. An immutable unique identifier is the final
  tie-breaker.
- The seek predicate is a strict exclusive lexicographic comparison. Each
  later key is compared only when all preceding keys equal their cursor values;
  the cursor row itself is never repeated.
- Initial deterministic order tuples are:
  - published recipes `newest`: `publishedAt DESC, id DESC`;
  - published recipes `quickest`:
    `cookTimeMinutes ASC, publishedAt DESC, id DESC`;
  - published recipes `topRated`:
    `averageRating DESC, reviewCount DESC, publishedAt DESC, id DESC`;
  - recipe search `relevance`:
    `searchRank DESC, publishedAt DESC, id DESC`;
  - public authored recipes: `publishedAt DESC, id DESC`;
  - current-user recipes: `updatedAt DESC, id DESC`;
  - favourites: `createdAt DESC, recipeId DESC`;
  - reviews: `createdAt DESC, id DESC`.
- Published-list predicates require non-null `publishedAt`; publish validation
  already requires non-null `cookTimeMinutes`. `topRated` orders by
  `COALESCE(averageRating, 0)` and non-null `reviewCount`; `relevance` uses a
  non-null computed `searchRank`. Remaining listed timestamps and identifiers
  are non-null. These same normalized values are stored in the cursor and used
  in the seek predicate.
- Relevance requires a non-blank search query; otherwise the normalized sort is
  `newest`.
- Pages reflect live data rather than a frozen snapshot. The stable tuple
  prevents ambiguity for equal values and offset drift, but inserts or changed
  ranking values may still affect later requests.
- `POST` create/finalize operations that a mobile client may retry accept an
  `Idempotency-Key`.
- Aggregate updates carry a `version`; stale writes return `409 conflict`.

### Errors

Every response carries a server-generated `X-Request-Id`. The server ignores
and overwrites any client-provided value. Every JSON error copies that same
identifier into `error.requestId`, so the response header and body always
match. Only `validation_failed` errors include `fieldErrors`; all other errors
omit it.

Use one envelope:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Some fields need attention.",
    "fieldErrors": {
      "ingredients.1.amount": ["Enter a quantity."]
    },
    "requestId": "opaque-id"
  }
}
```

Expected status mapping:

- `400` malformed input;
- `401` missing/invalid/expired authentication;
- `403` authenticated but not allowed;
- `404` absent or deliberately concealed resource;
- `409` uniqueness, state-transition, or optimistic-version conflict;
- `413` declared upload too large;
- `422` semantically invalid publish/analysis request;
- `429` rate limited, with `Retry-After`;
- `500` unexpected server failure without leaking internals.

Use stable machine codes; UI copy should be owned by the app except when the
server must provide a safe generic message.

### Authorization

Every recipe/media/review mutation derives actor identity from the access token,
never from a body `userId`. Public reads enforce:

- recipe lifecycle and moderation status;
- author/account status;
- block relationships;
- draft ownership;
- media readiness.

The backend recalculates counts, ratings, and ownership. Client-supplied
aggregates are ignored.

## Target REST Surface

The request/response schemas should be colocated with their route or feature
contract and consumed by Hono validators.

### System

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Process/database readiness summary |

### Authentication and Account

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/auth/signup` | Create unverified account/profile and send verification OTP |
| POST | `/v1/auth/login` | Authenticate and issue token pair |
| POST | `/v1/auth/refresh` | Rotate opaque refresh token |
| POST | `/v1/auth/logout` | Revoke the presented refresh token |
| POST | `/v1/auth/email-verification/requests` | Send/resend generic verification challenge |
| POST | `/v1/auth/email-verification/confirmations` | Verify challenge and issue first token pair |
| POST | `/v1/auth/password-reset/requests` | Start non-enumerating reset challenge |
| POST | `/v1/auth/password-reset/verifications` | Verify OTP and issue short-lived reset grant |
| POST | `/v1/auth/password-reset/completions` | Set password and revoke sessions |
| DELETE | `/v1/users/me` | Request/perform account deletion |

Refresh accepts the opaque token in the JSON body for the native app. Never put
tokens in query strings. Sign-up and unverified login do not issue a full
session; only email confirmation does. Password reset uses a random
`challengeId` plus OTP; an OTP by itself is not a global credential.

The auth service owns OTP generation, keyed hashing, expiry, attempt limits,
resend cooldown, and consumption. An injected `EmailSender` owns delivery.
Development SMTP points to Mailpit in Docker and tests inject an in-memory fake.
A verified sender domain/provider is required before public beta.

### Profiles

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/profiles/me` | Private current profile/account projection |
| PATCH | `/v1/profiles/me` | Update editable profile fields |
| GET | `/v1/profiles/:profileId` | Public profile and derived stats |
| GET | `/v1/profiles/:profileId/recipes` | Published recipes by author |

Public profile DTO excludes email, auth state, challenge state, and private
favourites.

### Taxonomy

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/categories` | Ordered active recipe categories |

Categories are curated rows with stable IDs/slugs. Tags are user-selected
normalized labels; the first version can suggest existing tags without allowing
them to become an unmoderated navigation taxonomy.

### Recipes and Discovery

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/recipes` | Published feed/search/filter |
| POST | `/v1/recipes` | Create owner draft |
| GET | `/v1/recipes/:recipeId` | Public recipe or owner draft detail |
| PATCH | `/v1/recipes/:recipeId` | Update owner draft/archive-compatible fields |
| DELETE | `/v1/recipes/:recipeId` | Owner soft removal |
| POST | `/v1/recipes/:recipeId/publish` | Validate aggregate and publish |
| POST | `/v1/recipes/:recipeId/archive` | Remove from public discovery without deletion |
| GET | `/v1/users/me/recipes` | Current user's drafts/published/archived recipes |

`GET /v1/recipes` query:

- `cursor`, `limit`;
- `q`;
- `categoryId`, repeated `tag`;
- `authorId`;
- `sort=relevance|topRated|newest|quickest`;
- `maxCookTimeMinutes`;
- `minCaloriesPerServing`, `maxCaloriesPerServing`;
- `servings`.

The recipe aggregate update DTO contains basics, ordered ingredient groups/items,
ordered steps, notes, and optional selected nutrition. Media attachment/reorder
uses verified `mediaAssetId` values. The service writes the aggregate in a
transaction.

Publish is an action endpoint because it enforces a transition and a larger set
of invariants than an ordinary field patch. At minimum it requires title,
category, valid cook time/servings, one ready gallery image, one ingredient, one
step, valid ordering, and no rejected media.

### Media

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/media/upload-intents` | Validate intent and return signed R2 `PUT` |
| POST | `/v1/media/:mediaAssetId/complete` | Verify uploaded object and mark ready |
| DELETE | `/v1/media/:mediaAssetId` | Detach/delete an owned unused asset |

Upload-intent input includes purpose, MIME type, byte size, and optional image
dimensions/checksum. Its response includes:

- `mediaAssetId`;
- short-lived `uploadUrl`;
- exact required `method` and headers;
- expiry timestamp;
- maximum size.

Do not return R2 credentials. Do not accept a user-controlled object key.

### Favourites

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/users/me/favourites` | Private paginated saved recipes |
| PUT | `/v1/recipes/:recipeId/favourite` | Idempotently save recipe |
| DELETE | `/v1/recipes/:recipeId/favourite` | Idempotently unsave recipe |

The recipe card/detail DTO can include an actor-specific `isFavourited` plus a
server-derived `favouriteCount`.

### Reviews

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/v1/recipes/:recipeId/reviews` | Paginated active reviews |
| PUT | `/v1/recipes/:recipeId/reviews/me` | Create or replace actor's single review |
| DELETE | `/v1/recipes/:recipeId/reviews/me` | Remove actor's review |

The service rejects self-review and non-published/removed recipes. Updating a
review does not create a second row.

### Reports and Blocks

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/reports` | Report a recipe, review, or user |
| GET | `/v1/users/me/blocks` | List blocked profiles |
| PUT | `/v1/users/:userId/block` | Idempotently block another user |
| DELETE | `/v1/users/:userId/block` | Unblock |

Report input is a discriminated union of target type/ID, reason code, and
optional detail. Never expose another user's report.

### Nutrition Analysis

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/recipes/:recipeId/nutrition-analyses` | Analyze the current owner draft |
| GET | `/v1/recipes/:recipeId/nutrition-analyses/:analysisId` | Read owned analysis/result |
| PUT | `/v1/recipes/:recipeId/nutrition` | Select manual or accepted analysis snapshot |
| DELETE | `/v1/recipes/:recipeId/nutrition` | Remove displayed nutrition |

Start with a synchronous `201` analysis request. If measured latency/reliability
requires background execution later, the same resource can return `202` and be
polled. Do not add a queue in advance. See `docs/ai-nutrition.md`.

## R2 Media Flow

1. The app reads the picked file metadata and optionally resizes/compresses it
   within product limits.
2. The app requests an upload intent while authenticated.
3. The server validates purpose, actor quota, MIME allowlist, declared bytes,
   recipe ownership, and item count. It creates a `pending` media row with an
   opaque server key.
4. The server generates a short-lived signed `PutObject` URL with the expected
   content type.
5. The app uploads the binary directly with Expo FileSystem/`expo/fetch`, showing
   progress and supporting cancellation/retry.
6. The app calls complete.
7. The server performs `HeadObject`, verifies size/type/checksum or decodes the
   image in a trusted processing step, then marks the row `ready` or `rejected`.
8. A recipe aggregate attaches only ready, actor-owned assets.
9. A scheduled maintenance command (cron is sufficient initially) removes stale
   pending/unattached objects.

Serve public recipe images through an R2 custom domain/CDN configuration, using
opaque URLs derived from stored keys. Signed uploads use the S3 API hostname;
they do not work through an R2 custom domain. Keep originals if future
transforms are required, but define upload dimension/byte caps before launch.

Suggested purposes are `profileAvatar`, `recipeGallery`, and `recipeStep`.
Purpose controls MIME/size/dimension/count rules.

## Target PostgreSQL Model

Use UUID/opaque IDs and UTC timestamps consistently. The exact Drizzle syntax is
an implementation concern; the following tables and constraints are the domain
model.

### Identity

#### `users`

`id`, normalized email, password hash, email verification time, account status,
created/updated/deleted timestamps.

- Case-insensitive unique normalized email.
- Status supports active/disabled/deletion-pending/deleted without overloading a
  timestamp.

#### `profiles`

One-to-one user ID, display name, bio, location, avatar media ID, created/updated
timestamps.

- Unique user ID.
- Avatar must be a ready media asset owned by the user.

#### `refresh_tokens`

`id`, user ID, token hash, token family ID, expiry, used/revoked/replaced times,
created time, optional device metadata.

- Unique token hash.
- Index active tokens by user/family.
- Rotation/reuse handling is transactional.

#### `auth_challenges`

`id`, user ID when known, purpose, code hash, attempts, expiry, consumed time,
last-sent time, created time.

- Purpose distinguishes email verification and password reset.
- Store hashes, never OTP plaintext.
- Generic request responses prevent account enumeration.

### Taxonomy and Recipes

#### `categories`

`id`, unique slug, display name, sort order, active flag.

#### `recipes`

`id`, author user ID, category ID, status, title, description, cook time minutes,
servings, chef notes, version, created/updated/published/archived/deleted times.

- Check positive cook time/servings when present.
- Index `(status, publishedAt, id)`, `(categoryId, status, publishedAt)`, and
  `(authorId, status, updatedAt)`.
- Only service transitions set publish/archive/remove timestamps.

#### `tags` and `recipe_tags`

Tags have ID, unique normalized slug, display label. Join table has recipe/tag
IDs.

- Composite primary/unique key.
- Service enforces no more than five tags per recipe.

#### `ingredient_groups`

`id`, recipe ID, optional title, sort position.

- Unique `(recipeId, position)`.
- Cascade with an owner draft aggregate.

#### `recipe_ingredients`

`id`, group ID, recipe ID, name, numeric amount when representable, original
amount text, unit code, preparation note, sort position.

- Preserve the user-facing amount text while also storing a numeric value/unit
  suitable for scaling and nutrition.
- Unique order within group.
- Service enforces thirty ingredients across a recipe.

#### `recipe_steps`

`id`, recipe ID, instruction, optional media asset ID, sort position.

- Unique `(recipeId, position)`.
- One optional ready step image.
- Service enforces one to twenty steps.

### Media

#### `media_assets`

`id`, owner user ID, R2 object key, purpose, MIME type, declared/verified size,
checksum, width/height, status, created/ready/rejected/deleted times.

- Unique object key.
- Index `(ownerId, status, createdAt)`.
- Never expose the R2 key as authorization.

#### `recipe_images`

Recipe ID, media asset ID, sort position.

- Unique media attachment and `(recipeId, position)`.
- Maximum nine enforced by the service/transaction.
- Position zero is the cover; a separate `isCover` flag would duplicate order.

### Nutrition

#### `recipe_nutrition`

One-to-one recipe ID, source (`manual` or `aiEstimated`), calories, carbohydrate,
fat, protein per serving, selected analysis ID when applicable, input
fingerprint, created/updated times.

- Non-negative checks.
- The display snapshot can be removed without deleting immutable analysis
  history immediately.

#### `nutrition_analyses`

`id`, recipe ID, requester user ID, input fingerprint, status, provider, model,
prompt/schema version, food-data source/version, structured result JSON,
confidence/warnings JSON, error code, usage/latency metadata, created/completed
times.

- Index `(recipeId, createdAt)`.
- Reuse a successful identical fingerprint only within a deliberate cache
  policy.
- Never store model chain-of-thought.

#### `nutrition_ingredient_matches`

Analysis ID, recipe ingredient ID, normalized text, food-data record ID,
converted grams, confidence, candidate/provenance JSON.

This makes a low-confidence result explainable and supports later correction.

### Social and Safety

#### `favourites`

User ID, recipe ID, created time.

- Composite unique/primary key.
- Index recipe ID for received-heart aggregation.

#### `reviews`

`id`, recipe ID, user ID, rating, text, status, created/updated/deleted times.

- Unique active identity `(recipeId, userId)`; retain one row and soft-delete
  status rather than creating duplicates.
- Check rating between 1 and 5.
- Index `(recipeId, status, createdAt, id)`.

#### `blocks`

Blocker user ID, blocked user ID, created time.

- Composite unique key.
- Check blocker differs from blocked.
- Read/interaction policy must check both directions as defined by product rules.

#### `reports`

`id`, reporter user ID, target type, target ID, reason, detail, status, assigned
moderator, resolution, created/updated/resolved times.

- Index unresolved reports by status/created time.
- Validate the polymorphic target in the service; consider separate nullable
  foreign keys if stronger database referential integrity is preferred.

#### `moderation_actions`

`id`, moderator user ID, report ID, target type/ID, action, reason, metadata,
created time.

Append-only audit record for moderation decisions.

### Optional Operational Table

#### `idempotency_keys`

Actor ID, route scope, key hash, request hash, response status/body, expiry,
created time.

Add when the first retryable create/finalize route is integrated rather than
using a process-memory map.

## Important Transactions and Derived Values

- Sign-up: unverified user + profile + verification challenge.
- Email confirmation: consume challenge + verify user + issue refresh token.
- Refresh: consume/rotate token and revoke a family on reuse.
- Recipe aggregate save: replace/update ordered children and increment version.
- Publish: validate aggregate/media, transition state, set publish time.
- Favourite add/remove: relation change; counts are queried/derived or updated
  safely, never accepted from the client.
- Review upsert/delete: row change and rating aggregate consistency.
- Account deletion: revoke tokens, hide profile/content, detach access, and apply
  retention/erasure policy.

Avoid mutable counter columns until query performance proves they are needed. If
introduced, update them transactionally and retain a reconciliation path.

## Migration from the Current Schema

Do not reset the database by default. Evolve it:

1. Add enums/status columns, categories, tags, media assets, reviews, ingredient
   groups, auth challenges, and analysis provenance tables.
2. Backfill existing recipe defaults/status and move `categoryId` text to a real
   foreign key.
3. Migrate repeated ingredient `groupTitle` values to `ingredient_groups`.
4. Convert current recipe image rows to links to `media_assets`.
5. Expand nutrition to source/fingerprint/provenance.
6. Add constraints and indexes after backfill makes them valid.
7. Generate a forward Drizzle migration and tests for constraints/transitions.

Because current content is development data, a reset may be simpler, but it
still requires explicit owner approval.

## Implementation Order

1. Finish mobile auth integration and recovery/account lifecycle.
2. Add taxonomy and the revised recipe/media schema.
3. Build R2 upload intents and media verification.
4. Create draft/autosave/publish recipe endpoints and wire the wizard.
5. Build recipe detail/feed/search/profile reads.
6. Add favourites, reviews, blocks, reports, and moderation.
7. Add release hardening and only then run the AI nutrition experiment.

The detailed checklist and completion gates are in `docs/progress.md`.

## Primary References

- [Hono RPC](https://hono.dev/docs/guides/rpc)
- [Hono validation](https://hono.dev/docs/guides/validation)
- [Expo SDK 56 FileSystem uploads](https://docs.expo.dev/versions/v56.0.0/sdk/filesystem/)
- [Cloudflare R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [Cloudflare R2 user-generated content architecture](https://developers.cloudflare.com/reference-architecture/diagrams/storage/storing-user-generated-content/)
