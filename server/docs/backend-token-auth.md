# Backend Token Auth

## Decision

Use token auth instead of cookie sessions.

```text
Access token: 15 minutes
Refresh token: 30 days
Client storage: expo-secure-store
Request auth: Authorization: Bearer <accessToken>
```

## Token Model

Use stateless JWT access tokens.

Use opaque random refresh tokens with server-side rotation:

- store only a hash of the refresh token
- store `userId`, `expiresAt`, `revokedAt`, `replacedByTokenId`, and `createdAt`
- rotate the refresh token on every successful refresh
- revoke the whole token family if an old refresh token is reused

This is not a cookie session, but refresh tokens still need server-side state so logout, token theft, and account deletion can be handled.

## Endpoints

```text
POST /v1/auth/signup
POST /v1/auth/login
POST /v1/auth/refresh
POST /v1/auth/logout
POST /v1/auth/email-verification/requests
POST /v1/auth/email-verification/confirmations
POST /v1/auth/password-reset/requests
POST /v1/auth/password-reset/verifications
POST /v1/auth/password-reset/completions
DELETE /v1/users/me
```

`/v1/auth/login`, email confirmation, and `/v1/auth/refresh` return tokens.
Signup returns a resumable verification challenge and never returns tokens.
Unverified login is denied until email confirmation creates the first session.

Token responses contain:

```ts
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
```

## Client Flow

Store both tokens in `expo-secure-store`.

For protected requests:

1. Read the access token.
2. Send `Authorization: Bearer <accessToken>`.
3. If the response is `401` because the access token expired, call `/auth/refresh`.
4. Store the new token pair.
5. Retry the original request once.
6. If refresh fails, delete both tokens and send the user to auth.

Use one shared API client wrapper so screens and feature hooks never implement refresh logic directly.

Password-reset completion revokes all refresh-token rows for the account.
Already-issued access JWTs remain bounded by their normal short lifetime.

## Retry Rules

- Retry the original request once after refresh.
- Do not refresh forever on repeated `401`.
- Do not refresh after `/v1/auth/login`, `/v1/auth/signup`, `/v1/auth/refresh`, or
  `/v1/auth/logout`.
- Use a single in-flight refresh promise so multiple expired requests do not rotate the same refresh token at the same time.
- Clear tokens if refresh returns `401` or `403`.

## SecureStore Notes

Install SecureStore before wiring auth:

```text
npx expo install expo-secure-store
```

Use small values only: access token, refresh token, and optionally the current user id. Keep profile data in normal app state or TanStack Query cache.

## Server Notes

Access token claims:

```ts
interface AccessTokenClaims {
  sub: string;
  tokenType: "access";
  exp: number;
}
```

Refresh token database row:

```ts
interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
  createdAt: Date;
}
```

Use Hono middleware on protected route groups to verify the access token and attach the authenticated user id to the request context.

## References

- Hono Bearer Auth: https://hono.dev/docs/middleware/builtin/bearer-auth
- Hono JWT helper: https://hono.dev/docs/helpers/jwt
- Expo SecureStore v56: https://docs.expo.dev/versions/v56.0.0/sdk/securestore/
