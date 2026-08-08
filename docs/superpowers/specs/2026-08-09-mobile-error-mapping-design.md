# Mobile Error Mapping Design

## Objective

Complete `API-07` with one reusable mobile boundary that parses the shared API
error envelope and maps API, network, cancellation, and unexpected failures to
stable UI-facing categories without importing a toast or navigation library.

## Scope

API-07 will add a strict `ApiError` model, a response parser, and a pure
presentation mapper. The result exposes a kind, safe app-owned message,
retryability, toast eligibility, optional field errors, retry delay, and request
ID. API-07 will not migrate auth endpoints, wire screens, clear sessions,
navigate, or change server contracts.

## Approaches Considered

1. **Pure parser plus presentation union — selected.** Keeps transport facts
   separate from UI policy and is reusable by future hooks and screens.
2. **Call Sonner directly from the API layer.** Smaller at call sites but makes
   cancellation, inline validation, navigation, and tests UI-framework coupled.
3. **Map errors independently in every feature.** Avoids a shared abstraction
   but guarantees copy and session/offline behavior drift.

## Behavior

`apiErrorFromResponse(response)` safely reads `{ error }`, falls back to the
response request-ID header, parses `Retry-After` seconds, and never trusts a
malformed server message. `toErrorPresentation(error)` maps:

- `AbortError` to silent `cancelled`;
- fetch `TypeError` to retryable `offline`;
- validation failures to `validation` with field errors;
- session credential/token failures to `authentication`;
- status 404, 409, 429, and 5xx to their stable categories;
- invalid credentials and registered email to specific app-owned copy;
- malformed/unknown failures to safe generic copy.

Request IDs remain available for diagnostics but are not automatically shown.

## Verification

Native-focused Jest tests cover valid/malformed envelopes, request-ID fallback,
Retry-After, every presentation family, safe message ownership, cancellation,
network errors, and unknown failures. Closure also requires root/server checks,
all root/server tests, review, docs, and `git diff --check`. Never run Expo web.
