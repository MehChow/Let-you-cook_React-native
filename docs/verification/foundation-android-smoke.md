# Foundation Android Route Smoke Baseline

Date: 2026-07-27

## Overall result

**PASS after two tested navigation fixes.** The Expo development client built,
installed, and opened on an Android 16 / API 36 emulator. Every requested auth
and protected route rendered without a blank safe-area layout or fatal native
error. Back navigation, keyboard dismissal, tab switching, the local demo
login, and logout were exercised through the native UI.

## Environment and startup evidence

| Item | Observed result |
| --- | --- |
| Tested application source tree | `1aededb` (`BASE-03: Complete Android route smoke baseline`); the complete native matrix and post-fix checks ran on this exact app/source content before it was committed |
| Earlier blocked checkpoint | `4ca8a91` recorded the initial no-AVD blocker only; it is not the passing application baseline |
| Native controller | `agent-device.cmd` `0.20.0`; `agent-device.cmd help workflow` read before device control |
| Android SDK | `ANDROID_HOME=F:\Android`; API 36 platform/build tools and `system-images;android-36;google_apis;x86_64` revision 7 |
| Emulator | Additive AVD `Codex_API_36`; model `sdk_gphone64_x86_64`; Android API 36; `sys.boot_completed=1` |
| Device discovery | `agent-device devices --debug` reported `Codex API 36 (android emulator target=mobile) booted=true`; `adb` target `emulator-5554` |
| Backend | `npm.cmd run server:dev`; `GET http://127.0.0.1:8787/health` returned `200 {"ok":true}` |
| Android build | `npm.cmd run android`; `BUILD SUCCESSFUL in 3m 39s`, 545 tasks, APK installed, Metro bundled 4,306 modules, and the development client opened |
| Package / session | `com.meh_chow.LetYouCook`; agent-device session `base03` |

This documentation-only follow-up records the already-tested commit identity; it
does not change the application source tree tested as `1aededb`.

The API 36 image install exited `0` without presenting or accepting an SDK
license prompt. The AVD was created only after confirming that neither the name
nor its target files existed; no existing AVD was deleted or overwritten.
Although `avdmanager list avd` omitted the generated configuration because its
`config.ini` contains unresolved SDK template placeholders, direct emulator
launch succeeded and produced a healthy booted target.

The native build emitted non-fatal SDK XML version, deprecated API, and CMake
object-path warnings. No compiler failure, React Native fatal exception, or
blank native screen was observed.

## Route and interaction matrix

| Surface / behavior | Result | Native evidence |
| --- | --- | --- |
| `/auth/login` | Pass | Welcome-back form rendered with email, password, forgot-password, Google, login, and create-account actions |
| Login keyboard dismissal and back behavior | Pass | App-owned email/password inputs accepted focus and content; `keyboard dismiss` succeeded |
| `/auth/create-account` | Pass | Name, email, password, confirmation, Create account, and Log in controls rendered |
| Create Account keyboard dismissal and back behavior | Pass | Form input accepted content and dismissal; native back returned Login |
| `/auth/forgot-password` | Pass | Email form rendered; `gg@gmail.com` advanced to OTP |
| Forgot Password keyboard dismissal and back behavior | Pass | Email input accepted focus/content and dismissal; OTP back returned Forgot Password |
| `/auth/email-otp` | Pass | Masked email, six OTP cells, resend, verify, alternate-email, and back controls rendered |
| Email OTP keyboard dismissal and back behavior | Pass | Numeric input accepted `123456`; all six cells updated; dismissal succeeded |
| `/auth/create-new-password` | Pass | New/confirm password fields, strength guidance, and Update control rendered |
| Create New Password keyboard dismissal and back behavior | Pass | Password input accepted focus/content and dismissal; back returned OTP, then Forgot Password, then Login |
| Demo login with `gg@gmail.com` / `coffee123` | Pass | Login advanced to Home |
| Home | Pass | Greeting, Today's special, Categories, Popular recipes, and tab bar rendered |
| Search | Pass | Search tab, query field, and recipe results rendered; input dismissal succeeded |
| Filters | Pass | Reset, sort, cooking time, calories, servings, and Apply rendered; native back returned Search |
| Add Recipe wizard | Pass | All six sections rendered; required basics/image/ingredient/cooking-step validation was satisfied; native Photo Picker supplied one gallery image |
| Add Recipe Preview | Pass | Entered basics and thumbnail rendered with Back and Save recipe; Back returned Nutrition |
| Favourites grid | Pass | Empty state and Grid/List controls rendered |
| Favourites list | Pass | List toggle remained in-app; Grid toggle restored the grid mode |
| Profile | Pass | Mock profile, Edit, Log out, authored recipes, favourites actions, and tabs rendered |
| Recipe Detail | Pass after fix | Home's Juicy pepper wings card rendered its real detail route, ingredients, steps, nutrition summary, and ratings action |
| Reviews | Pass after fix | Reviews rendered sort, three mocked reviews, 1-5 star controls, optional comment, and Leave a review |
| Protected tab switching | Pass | Home, Search, Favourites, Add Recipe, and Profile transitions remained in the protected app |
| Protected-route back behavior | Pass | Filters→Search, Reviews→Detail, Detail→Home, Preview→Nutrition, and dirty Add Recipe close→Discard→Home behaved as expected |
| Logout | Pass | Profile Log out returned the Login route |

The agent-device Android test IME reports itself as not visibly drawn while it
owns the focused app input. Keyboard evidence therefore uses input ownership,
correct input type, successful content entry, and successful
`keyboard dismiss`, rather than a visible Gboard screenshot.

## Failures found and tested fixes

Home initially opened Expo Router's sitemap fallback (`letyoucook:///`) instead
of Recipe Detail. Source inspection showed that
`src/features/recipe-detail/navigation.ts` pushed `/recipe/:recipeId`, while the
actual protected route is `src/app/private/recipe/[recipeId].tsx`.

Strict TDD evidence:

- focused RED expected
  `/private/recipe/pepper%20wings%2F42` and received
  `/recipe/pepper%20wings%2F42`;
- the helper was changed to include `/private` while preserving
  `encodeURIComponent`;
- focused GREEN passed.

Recipe Detail then opened correctly, but its ratings action exposed the same
problem for Reviews. `useRecipeDetailScreen.handleOpenReviews` pushed
`/recipe/:recipeId/reviews`, while the route lives at
`src/app/private/recipe/[recipeId]/reviews.tsx`.

Strict TDD evidence:

- focused RED expected `/private/recipe/today-1/reviews` and received
  `/recipe/today-1/reviews`;
- the hook route was changed to the protected prefix;
- focused GREEN passed.

After both fixes, `npm.cmd run check` exited `0`, and the full Jest suite passed
15 suites / 61 tests. Native replay confirmed Home→Recipe Detail→Reviews and
the reverse back path.

## Controller and development-client notes

- The first development-client launch required selecting the running Metro
  server and dismissing the one-time dev-menu introduction.
- Expo's floating `Tools` button physically overlapped the Favourites List
  control. Raw native hierarchy confirmed the overlap. The development-client
  Tools-button switch was safely turned off, after which List and Grid both
  worked. This was a development overlay issue, not an application route
  defect; no app code was changed for it.
- Some co-located Android accessibility parent/child refs dispatch differently.
  When a parent press appeared unchanged, a fresh snapshot, child ref, or
  settled coordinate press was used and the resulting screen was verified.
- One repository mock image was copied to the emulator's Pictures directory and
  indexed only as a disposable Photo Picker fixture. It was selected through
  the Android system picker; no production persistence was inferred.

## Local artifacts

- Native build:
  `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/android-recovery.out.log`
  and `android-recovery.err.log`
- Emulator:
  `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/emulator.out.log`
  and `emulator.err.log`
- Focused native log:
  `C:\Users\Meh Chow\.agent-device\sessions\base03\app.log`
- Initial route failure:
  `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/failure-recipe-detail.png`
- Fixed Recipe Detail:
  `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/recipe-detail-fixed.png`
- Fixed Reviews:
  `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/recipe-reviews-fixed.png`
- Favourites:
  `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/favourites-list.png`
  and `favourites-grid.png`
- Add Recipe Preview:
  `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/add-recipe-preview.png`
- Profile:
  `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/profile.png`

The `.superpowers` evidence directory and generated native `android` directory
remain ignored local artifacts. They are not source-of-truth and are not
committed.
