# Password-reset OTP setup guideline

This document records the implemented backend contract for the mobile
forgot-password flow. The backend is authoritative and local delivery uses
Mailpit SMTP.

## Request and cooldown

Implemented request:

```text
POST /v1/auth/password-reset/requests
```

```json
{
  "email": "cook@example.com"
}
```

Validate the body with Zod at the route boundary. Trim and lowercase the email before lookup and rate-limit decisions. Use a 60-second cooldown for the password-reset purpose, keyed by normalized email plus purpose.

The server must atomically check and reserve `next_allowed_at` so concurrent requests cannot send multiple emails. Store an absolute timestamp, not a decrementing counter. PostgreSQL is the preferred current-project storage; do not add Redis or another service until a measured bottleneck requires it.

Example record:

```text
password_reset_requests
  id
  normalized_email
  purpose
  next_allowed_at
  challenge_id
  otp_hash
  otp_expires_at
  created_at
```

Use a unique constraint on `(normalized_email, purpose)`. Keep OTP expiry separate from resend cooldown, and invalidate or replace the previous challenge when a resend succeeds.

## Responses and security

Successful requests should preferably return a generic response to prevent account enumeration:

```http
202 Accepted
```

```json
{
  "ok": true,
  "challengeId": "opaque-server-generated-id",
  "expiresAt": "2026-07-10T06:00:00.000Z",
  "resendAvailableAt": "2026-07-10T05:51:00.000Z"
}
```

Requests during cooldown return the same generic `202` challenge state and do
not send another message, avoiding an account-existence side channel.

Be careful that different responses for known and unknown email addresses can leak account existence. Generate OTPs with a cryptographically secure source, store only their hashes, limit verification attempts, and never log or return the OTP.

## OTP challenge session

The send-code response must return an opaque `challengeId`. The frontend must persist it with the pending reset flow:

```text
email
challengeId
resendAvailableAt
```

When the user leaves and later resumes Verify Email, the app must reuse the same `challengeId` and must not call the send-code endpoint again. Verification should use:

```text
POST /v1/auth/password-reset/verifications
{
  "challengeId": "opaque-server-generated-id",
  "code": "123456"
}
```

If resend rotates the challenge, return the replacement `challengeId` and update the pending flow atomically. Bind the challenge server-side to the normalized email and password-reset purpose; do not trust the client email as the authority.

## Frontend integration behavior

The current frontend behavior is:

1. Initial send checks the local MMKV cooldown.
2. After the server accepts the request, MMKV stores email, opaque challenge
   ID, challenge expiry, and the authoritative resend timestamp.
3. A failed request leaves no new pending flow.
4. When the forgot-password screen opens with an active pending email, it navigates to Verify Email without sending another code.
5. “Use another email” uses Expo Router `dismissTo` with `mode=another-email`, preserving the pending email and cooldown while suppressing auto-resume for that visit only.
6. Reopening forgot password normally, returning after login, or restarting the app resumes the existing Verify Email flow.
7. A resend must use the same challenge session lineage and update the stored challenge ID if the backend rotates it.
8. Successful verification keeps the short-lived reset grant only in provider
   memory; successful password completion clears the pending reset flow.

The local MMKV timestamp is only a UX guard. The backend must independently enforce cooldowns, challenge expiry, verification attempts, and challenge ownership.

Password completion uses `POST /v1/auth/password-reset/completions` with the
short-lived reset grant and new password. Screen code remains independent from
provider-specific email delivery details.

## Verification checklist

- Repeated requests within 60 seconds do not send another email.
- Two simultaneous requests result in at most one email.
- Resuming Verify Email does not call the send-code endpoint again.
- Resend updates the active challenge session correctly.
- Requests for unknown emails do not reveal account existence.
- OTPs expire and cannot be reused after successful verification.
- Route tests cover cooldown expiry, concurrency, normalized email casing, challenge rotation, and provider failure.
