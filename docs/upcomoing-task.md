# Upcoming Backend Tasks

> Historical planning input. This checklist predates the implemented Hono,
> Drizzle, PostgreSQL, auth, profile, and mobile sign-up work, so its unchecked
> boxes are not current truth. Use `docs/progress.md` for current status and the
> active roadmap.

This app is ready to move from mocked frontend data toward a custom backend. The target path is one Node.js TypeScript API, PostgreSQL, Cloudflare in front, R2 for image storage, and Cloudflare Images for delivery/transforms. Keep it as one backend service for now; no BaaS and no microservices until real usage proves they are needed.

## Road To Backend Integration

1. Freeze the current prototype UI and keep future frontend changes focused on API wiring, loading states, empty states, and error states.
2. Design the backend contract around the existing app flows: auth, profiles, recipes, images, favourites, search, reports, and blocks.
3. Build the database schema and API together, then replace mocked app data feature by feature.
4. Add production basics before public release: account deletion, content deletion, moderation hooks, rate limits, crash reporting, privacy policy, and terms.
5. Delay social/AI/scale features until the first real users expose the next bottleneck.

## NOW

- [ ] Create a custom Node.js TypeScript backend service.
- [ ] Pick a minimal API style: REST, Hono, Fastify, or similar.
- [ ] Set up PostgreSQL with migrations.
- [ ] Choose one DB layer: Drizzle or Prisma.
- [ ] Define core tables: users, profiles, recipes, recipe images, ingredients, steps, nutrition, favourites, reports, and blocks.
- [ ] Add email/password auth.
- [ ] Add email verification.
- [ ] Add password reset.
- [ ] Store mobile sessions securely in the app.
- [ ] Add server-side request validation.
- [ ] Add profile read/update API.
- [ ] Add recipe CRUD API.
- [ ] Add R2 image upload flow.
- [ ] Add Cloudflare Images delivery/transforms.
- [ ] Add favourites API.
- [ ] Add basic recipe search by title, category, and ingredient.
- [ ] Add recipe detail API.
- [ ] Add author profile API.
- [ ] Add delete-own-account flow.
- [ ] Add delete-own-recipe flow.
- [ ] Add report recipe/user endpoint.
- [ ] Add block user endpoint.
- [ ] Add rate limits for auth, uploads, recipe creation, reviews, reports, and search.
- [ ] Replace mocked frontend data one feature at a time.
- [ ] Add app loading, empty, offline, and error states.
- [ ] Add Privacy Policy.
- [ ] Add Terms of Service.
- [ ] Prepare an App Review demo account.
- [ ] Add crash reporting.

## RECOMMEND

- [ ] Add Google login.
- [ ] Add Sign in with Apple if any third-party/social login is enabled.
- [ ] Add recipe reviews and ratings.
- [ ] Add follow/unfollow users.
- [ ] Add content status: draft, published, removed.
- [ ] Add a simple admin moderation page.
- [ ] Add hide/remove actions for reported content.
- [ ] Add image upload retry handling.
- [ ] Add basic audit logs for moderation actions.
- [ ] Add push notifications for recipe reminders.
- [ ] Add analytics for signup, create recipe, favourite, and search.
- [ ] Improve search ranking.
- [ ] Set up database backups.
- [ ] Add CI checks for API tests and migrations.

## LATER

- [ ] Add comments.
- [ ] Add direct messages.
- [ ] Add meal planning.
- [ ] Add recipe collections.
- [ ] Add AI recommendations.
- [ ] Add AI nutrition analysis.
- [ ] Add creator monetization.
- [ ] Add a public web version.
- [ ] Add advanced recommendation feed logic.
- [ ] Add a dedicated search service such as Meilisearch or Typesense.
- [ ] Add Redis caching.
- [ ] Add a queue system beyond simple background jobs.
- [ ] Split into microservices.
- [ ] Add multi-region database setup.

## Skipped For Now

- BaaS: skipped because this project should showcase custom backend skills.
- Microservices: skipped because one backend service is enough for the current app.
- Redis: skipped until repeated reads or rate limits need it.
- External search: skipped until Postgres search is not good enough.
- D1: skipped because Postgres is the better fit for relational recipe/social data.
