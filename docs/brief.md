# Let You Cook Product Brief

Last reviewed: 2026-07-26

## Product Summary

Let You Cook is an Android-first mobile recipe community. Its simplest product
analogy is "Instagram for practical recipes": a visual discovery feed leads to a
structured recipe, the author behind it, and lightweight social proof. Users can
save recipes they want to cook and publish their own through a guided wizard.

The app should make two jobs easy:

1. Find a dish that fits a user's interest or constraints, then cook it without
   hunting through a long story.
2. Turn a home cook's photos and notes into a clear, attractive, reusable recipe
   without requiring nutrition expertise.

Android is the active target. iOS should remain possible, but iOS parity is not
a launch requirement. A public web app is out of scope.

## What Exists Today

The mobile app is a polished prototype backed mostly by mock objects. The
screenshots in `assets/screenshot/` represent the intended visual flow:

- home discovery and category browsing;
- search and filtering;
- favourite recipes in grid/list layouts;
- author/current-user profile;
- full recipe detail with gallery, ingredients, steps, nutrition, and reviews;
- a six-step recipe creation wizard and preview;
- sign-up, login, forgot-password, OTP, and new-password screens.

The backend is newer but is not empty. It has:

- a Node/Hono application and health endpoint;
- PostgreSQL/Drizzle schema and an initial migration;
- sign-up, login, refresh rotation, logout, and access-token authentication;
- protected current-profile read/update routes;
- route placeholders for recipes, images, favourites, reports, and blocks.

Only sign-up is currently connected end to end. Login is still a hard-coded
local demo. Password reset, most content, favourites, reviews, and wizard save
are local simulations. See `docs/progress.md` for the canonical status.

## Main Navigation

The authenticated app has five primary tab actions:

1. **Home** — discovery feed, featured recipe, categories, and popular recipes.
2. **Search** — query, recent searches, categories, sort/filter controls, and
   result cards.
3. **Add** — opens the recipe wizard rather than a persistent tab screen.
4. **Favourites** — the signed-in user's saved recipes, with grid/list views.
5. **Profile** — identity, bio/location, authored recipes, received hearts,
   average rating, settings/edit actions, and logout.

Secondary destinations are recipe detail, public author profile, categories,
filters, reviews, and the add-recipe preview.

## Feature Behavior

### Authentication

Users can create an email/password account, sign in, remain signed in through
access/refresh tokens, recover a forgotten password, and sign out. Email
verification and password reset must use non-enumerating responses.

Email verification is mandatory. Sign-up creates the account and sends a
six-digit OTP but does not issue a full session. Successful OTP confirmation
issues the first access/refresh token pair and enters Home. Login cannot enter
the private app while the account remains unverified.

Local development delivers verification/reset messages to Mailpit over SMTP.
Automated tests use an in-memory email fake. A verified sender domain and real
transactional provider are required before a public beta, but are not required
for the local MVP.

Google sign-in is not part of the first backend milestone. If third-party login
is added later, Apple sign-in must be considered before an iOS release.

### Home and Discovery

Home greets the user and offers a featured dish, a horizontal category browser,
and popular recipe cards. Selecting a category should carry into Search instead
of maintaining a second category state.

The initial feed is deterministic and paginated; advanced personalization and
recommendation models are later work.

### Search and Filters

Search matches published, visible recipes by title first, then category, tag,
and ingredient. The first backend version uses PostgreSQL rather than a
dedicated search service.

Supported filters are:

- category;
- relevance, top-rated, newest, and quickest sort;
- cooking-time range;
- calories-per-serving range;
- servings.

The current filter sheet intentionally stages changes until the user applies
them. Recent searches are local to the device unless a later requirement
justifies account sync.

### Recipe Detail

A recipe detail page contains:

- ordered gallery with a cover image;
- title, description, author, rating, category/tags;
- cook time, servings, and calories per serving when available;
- grouped ingredients;
- ordered cooking steps with optional images;
- optional chef notes/reminder text;
- optional nutrition summary;
- paginated ratings/reviews.

Only published, non-removed recipes are publicly accessible. Authors can access
their drafts. A blocked relationship hides the relevant user/content on both
read and interaction paths.

### Favourites

Favouriting is a private saved-recipes action and must be idempotent. A user's
favourites list is visible only to that user in the MVP.

The "hearts" count on an author's profile means total favourites received
across that author's published recipes. It does not mean how many recipes that
author has saved.

### Profiles

Profiles expose display name, avatar, optional bio/location, authored published
recipes, total received hearts, and average recipe rating. Email and other
account data are private.

The current user can edit their profile and delete their account. Account
deletion is immediate and irreversible. The identity row remains only as an
opaque deleted tombstone: credentials, verification data, profile fields, and
private media references are erased immediately, and every session is denied.
Published recipes remain visible under the neutral attribution "Deleted cook"
with their recipe media; drafts and archived content are hidden. Reports and
moderation records keep only the opaque references needed for integrity.
Resolved moderation evidence is retained for 24 months, after which
unnecessary personal and free-text detail is removed while the audit outcome
remains. The former email address may register again immediately.

### Ratings and Reviews

A signed-in user may have at most one review per published recipe. It contains a
one-to-five rating and optional text, and can be edited or deleted. A recipe
author cannot review their own recipe.

Review counts and average ratings are derived from active reviews. They are not
client-controlled counters.

### Recipe Creation Wizard

The wizard has six sections:

1. **Basics** — name, optional description, category, up to five tags, cook
   time, and servings.
2. **Images** — one to nine gallery images; the first ordered image is the cover.
3. **Ingredients** — one to five optional titled groups and no more than thirty
   ingredients overall. Each ingredient keeps name, quantity, and unit as
   structured data.
4. **Steps** — one to twenty ordered instructions, each with optional image.
5. **Chef notes/reminder** — optional author guidance.
6. **Nutrition** — optional manual entry or AI-assisted estimate.

The existing UI has not added category/tags yet, but they are part of the target
flow. Current limits and copy are otherwise the baseline unless usability
testing changes them.

A future integrated wizard creates and autosaves a server draft, uploads media
independently, and publishes only after the required fields and media are
complete. Preview can jump back to any section. Closing or losing the app should
not discard a successfully autosaved draft.

### Nutrition

Nutrition is optional and reported per serving. Manual entry includes calories,
carbohydrate, fat, and protein; the chart updates immediately as values change.

AI nutrition is an advisory estimate derived primarily from structured
ingredients and a nutrition database. The user presses Analyze, reviews the
result and warnings, then accepts it, switches to manual, reruns it, or removes
it. It must never be presented as measured fact or medical advice. Full behavior
and launch criteria are in `docs/ai-nutrition.md`.

### Safety and Moderation

MVP safety includes:

- report a recipe or user;
- block another user;
- owner deletion of recipes/account;
- server-side removed-content status;
- rate limits and basic moderation audit history;
- privacy policy and terms before external testing.

A small administrative review surface is recommended before a public beta.

## Canonical User Flows

### First Session

1. Open app and reach authentication.
2. Create an account and receive the verification OTP.
3. Confirm the OTP and persist the first returned session.
4. Complete or edit basic profile.
5. Enter Home.
6. On a later app start, restore the session and refresh once if necessary.

### Discover and Save

1. Browse a featured/popular recipe or choose a category.
2. Search/filter published recipes.
3. Open recipe detail.
4. Adjust servings locally if supported and follow ingredients/steps.
5. Favourite the recipe; it appears in Favourites and the author's received
   heart count changes.

### Review

1. Open a published recipe owned by someone else.
2. Open the reviews sheet.
3. Submit a rating and optional review.
4. The user's existing review is edited on a later submission rather than
   duplicated.
5. Recipe rating aggregates update from active reviews.

### Create and Publish

1. Start a draft and complete Basics.
2. Add/reorder the gallery.
3. Add grouped ingredients.
4. Add/reorder steps and optional step images.
5. Add optional notes.
6. Skip nutrition, enter it manually, or request an estimate when eligible.
7. Review Preview and jump back to correct sections.
8. Publish. The recipe becomes discoverable only after server validation and
   media readiness checks pass.

### Recover Password

1. Request a reset using an email.
2. Always receive a generic acknowledgement.
3. Enter a time-limited OTP tied to a challenge identifier.
4. Choose a new password.
5. Revoke existing refresh sessions according to the auth policy, then return
   to login.

## Domain Vocabulary and Invariants

- **Recipe** — the aggregate containing descriptive fields, category/tags,
  gallery, ingredient groups/items, steps, notes, and optional nutrition.
- **Draft** — owner-visible, editable recipe that is not in public feeds.
- **Published** — publicly discoverable recipe that satisfies publish rules.
- **Archived** — owner-retained but not publicly discoverable.
- **Removed** — hidden by owner/moderation policy and retained only as required.
- **Favourite** — private user-to-recipe save; unique by user and recipe.
- **Review** — one active rating/review by a user on another author's recipe.
- **Media asset** — an owned R2 object plus verified database metadata.
- **Nutrition snapshot** — the values selected for recipe display, with manual
  or AI-estimated provenance.
- **Nutrition analysis** — an immutable attempt/audit record used to produce an
  optional snapshot.

All public recipe reads apply lifecycle, ownership, block, and moderation rules.
Counts and aggregates are server-derived. The client cannot publish by merely
setting a status field.

## MVP Scope

MVP includes email auth/recovery, profiles, recipe draft/publish CRUD, R2 media,
discovery/search, favourites, ratings/reviews, reports/blocks, basic moderation,
deletion flows, required UI states, and release/privacy basics.

MVP explicitly defers follows, comments, direct messages, push notifications,
meal planning, collections, creator monetization, advanced recommendations,
dedicated search infrastructure, queues, Redis, and microservices.

AI nutrition is a post-MVP or final MVP experiment only after the recipe model,
media, and core integration are stable.

## Confirmed Product Decisions

The owner confirmed decisions 1-9 on 2026-07-26 and decision 10 on
2026-08-09:

1. Keep the backend as a Node 20 Hono service; use R2's S3-compatible API rather
   than moving the whole API to Cloudflare Workers.
2. Use recipe states `draft`, `published`, `archived`, and `removed`. This is the
   recommended lifecycle because it separates incomplete owner work, public
   content, voluntary withdrawal, and moderation/deletion handling without
   overloading one visibility flag.
3. Require one curated category and allow up to five tags. This is the
   recommended balance: categories provide stable navigation and filtering,
   while limited tags describe cross-category details without turning the main
   taxonomy into uncontrolled free-form text.
4. Treat profile hearts as favourites received.
5. Allow one editable/deletable review per user/recipe and prohibit self-review.
6. Keep first social scope to profiles, favourites, reviews, reports, and blocks.
7. Treat nutrition estimates as optional and advisory; use images only as
   supporting evidence.
8. Prepare for a small public Android beta, so deletion, moderation, rate
   limiting, privacy, and terms are launch requirements.
9. Require email verification before entering the private app. Use Mailpit SMTP
   for local development and keep real email delivery as a pre-beta external
   prerequisite.
10. Delete accounts immediately and irreversibly by retaining an opaque identity
    tombstone while erasing credentials and profile data. Keep published recipes
    attributed to "Deleted cook," preserve moderation referential integrity with
    a 24-month resolved-evidence retention period, and allow immediate reuse of
    the former email address.

If the owner changes any item later, update the dependent contracts and roadmap
rather than leaving the decision only in chat history.
