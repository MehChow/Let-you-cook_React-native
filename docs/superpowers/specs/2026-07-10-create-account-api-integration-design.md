# Create Account API Integration Design

## Goal

Replace the mobile create-account mock flow with the existing `POST /auth/signup` backend API, persist the returned authenticated session, and navigate into the private app only after signup succeeds.

Forgot-password integration, email delivery, login integration, and refresh-on-hydration remain out of scope for this change.

## Existing Contract

The backend already accepts:

```ts
POST /auth/signup
{
  email: string;
  password: string;
  displayName?: string;
}
```

and returns:

```ts
{
  user: { id: string; email: string };
  tokens: { accessToken: string; refreshToken: string };
}
```

The endpoint also returns `409` with `{ message: "Email is already registered" }` for duplicate email addresses.

## Architecture

Reuse the existing `createAuthApi()` wrapper and SecureStore-backed token storage. The create-account React Query mutation will call `authApi.signUp()` and return the backend `AuthResponse` rather than returning `void`.

`AuthProvider` will expose a small session-establishment method that accepts the backend response, stores the token pair and session user, and updates React state. The session will use the backend JWT expiry decoded from its payload so the existing session shape remains compatible without adding a JWT dependency.

No root `shared/` folder will be added yet. The current frontend API types already describe the backend signup response, and adding a shared package would expand TypeScript/build configuration without solving a current mismatch. A shared contract can be introduced when login, refresh, and protected profile contracts are integrated together.

## Data Flow

```text
CreateAccountScreen
  -> useCreateAccount().createAccount(input)
  -> authApi.signUp(input)
  -> POST /auth/signup
  -> AuthResponse
  -> AuthProvider.establishSession(response)
  -> SecureStore + React session state
  -> /private/(tabs)
```

The screen must not call the current mock `login()` after signup. A failed API request must leave the existing session unchanged and show the existing toast error.

## Files

- Modify `src/features/auth/useCreateAccount.ts` to call `authApi.signUp()` and return `AuthResponse`.
- Modify `src/features/auth/AuthProvider.tsx` to establish a real session from `AuthResponse`.
- Modify `src/features/auth/session.ts` to decode the JWT `exp` claim with a safe fallback.
- Modify `src/features/auth/CreateAccountScreen.tsx` to establish the returned session instead of calling mock login.
- Add or update focused tests under `__tests__/` for the mutation, session establishment, and screen behavior.
- Do not modify forgot-password files or backend routes unless verification exposes a contract bug.

## Error Handling

- Preserve `AuthApiError.status` and backend messages.
- Show duplicate-email errors through the existing toast path.
- Do not persist tokens when signup fails.
- If the returned access token has no readable `exp`, use the existing 15-minute client fallback rather than treating the session as permanently valid.

## Testing

Tests will be written first and must fail before implementation:

1. `useCreateAccount` calls `authApi.signUp` and returns the response.
2. Session establishment stores the real user/tokens and derives expiry.
3. The create-account screen no longer calls mock login and navigates only after the real signup response is persisted.
4. A rejected signup displays the backend error and does not navigate.

Verification commands:

```text
npm test -- --runInBand __tests__/auth-api.test.ts __tests__/auth-screens.test.tsx
npm run check
npm run server:check
```

The backend smoke test remains useful for confirming the existing endpoint, but its `tsx` IPC behavior may require an environment without the current sandbox pipe restriction.
