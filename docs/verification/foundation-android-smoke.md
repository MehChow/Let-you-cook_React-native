# Foundation Android Route Smoke Baseline

Date: 2026-07-27

## Overall result

**BLOCKED / INCOMPLETE.** No Android target was available, so the development
client could not be compiled, installed, or opened. No application route or
interaction is recorded as passing.

## Environment and startup evidence

| Item | Observed result |
| --- | --- |
| Tested Git commit | `af42e1bf5e15c9db1c50500f9a72c89eaaca0960` |
| Native controller | `agent-device` `0.20.0`; `agent-device help workflow` read before device discovery |
| Android SDK | `ANDROID_HOME=F:\Android`; `emulator.exe` and `adb.exe` present |
| Emulator / Android API | None; no configured AVD was returned, so API level is unavailable |
| Connected devices | None from `agent-device devices --platform android` or `adb devices -l` |
| Backend | `npm.cmd run server:dev`; `GET http://127.0.0.1:8787/health` returned `200 {"ok":true}` |
| Android build | `npm.cmd run android`; Expo prebuild completed, then stopped before native compilation because no connected device or startable emulator existed |

The SDK emulator query `F:\Android\emulator\emulator.exe -list-avds` returned
no AVD names. `C:\Users\Meh Chow\.android\avd` exists but contains no configured
AVD.

## Route and interaction matrix

`Blocked` means the route was not exercised because the app never launched.

| Surface / behavior | Result | Evidence |
| --- | --- | --- |
| `/auth/login` | Blocked - not tested | No Android target |
| Login keyboard dismissal and back behavior | Blocked - not tested | No Android target |
| `/auth/create-account` | Blocked - not tested | No Android target |
| Create Account keyboard dismissal and back behavior | Blocked - not tested | No Android target |
| `/auth/forgot-password` | Blocked - not tested | No Android target |
| Forgot Password keyboard dismissal and back behavior | Blocked - not tested | No Android target |
| `/auth/email-otp` | Blocked - not tested | No Android target |
| Email OTP keyboard dismissal and back behavior | Blocked - not tested | No Android target |
| `/auth/create-new-password` | Blocked - not tested | No Android target |
| Create New Password keyboard dismissal and back behavior | Blocked - not tested | No Android target |
| Demo login with `gg@gmail.com` / `coffee123` | Blocked - not tested | No Android target |
| Home | Blocked - not tested | No Android target |
| Search | Blocked - not tested | No Android target |
| Filters | Blocked - not tested | No Android target |
| Add Recipe wizard | Blocked - not tested | No Android target |
| Add Recipe Preview | Blocked - not tested | No Android target |
| Favourites grid | Blocked - not tested | No Android target |
| Favourites list | Blocked - not tested | No Android target |
| Profile | Blocked - not tested | No Android target |
| Recipe Detail | Blocked - not tested | No Android target |
| Reviews | Blocked - not tested | No Android target |
| Protected tab switching | Blocked - not tested | No Android target |
| Protected-route back behavior | Blocked - not tested | No Android target |
| Logout | Blocked - not tested | No Android target |

## Failure evidence and required follow-up

Expo reported:

> CommandError: No Android connected device found, and no emulators could be
> started automatically.

Local artifacts:

- `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/android.out.log`
- `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/android.err.log`
- `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/server.out.log`
- `.superpowers/sdd/2026-07-26-foundation/task-3-artifacts/server.err.log`

No failure screenshot exists because there was no device display to capture.

To resume `BASE-03`, connect and authorize an Android device with USB debugging
enabled, or create and start an Android Virtual Device. Confirm
`agent-device devices --platform android` lists the target, rerun
`npm.cmd run android`, and exercise every matrix row above. Capture screenshots
and focused native logs for any route or interaction failure.
