import type { AuthChallengeResponse } from "./api";

export interface AuthFlowStorage {
  getNumber(key: string): number | undefined;
  getString(key: string): string | undefined;
  setNumber(key: string, value: number): void;
  setString(key: string, value: string): void;
  remove(key: string): void;
}

export interface PendingEmailVerification {
  email: string;
  challengeId: string;
  expiresAt: number;
  resendAvailableAt: number;
}

const EMAIL_KEY = "auth.email-verification.email";
const CHALLENGE_ID_KEY = "auth.email-verification.challenge-id";
const EXPIRES_AT_KEY = "auth.email-verification.expires-at";
const RESEND_AVAILABLE_AT_KEY = "auth.email-verification.resend-available-at";
const FLOW_KEYS = [
  EMAIL_KEY,
  CHALLENGE_ID_KEY,
  EXPIRES_AT_KEY,
  RESEND_AVAILABLE_AT_KEY,
];

// Removes every persisted field owned by email verification.
export const clearEmailVerificationFlow = (storage: AuthFlowStorage) => {
  FLOW_KEYS.forEach((key) => storage.remove(key));
};

// Persists only the fields required to resume a verification challenge.
export const saveEmailVerificationFlow = (
  storage: AuthFlowStorage,
  email: string,
  response: AuthChallengeResponse,
) => {
  const expiresAt = Date.parse(response.expiresAt);
  const resendAvailableAt = Date.parse(response.resendAvailableAt);

  if (!Number.isFinite(expiresAt) || !Number.isFinite(resendAvailableAt)) {
    throw new Error("The verification challenge timestamps are invalid.");
  }

  storage.setString(EMAIL_KEY, email.trim().toLowerCase());
  storage.setString(CHALLENGE_ID_KEY, response.challengeId);
  storage.setNumber(EXPIRES_AT_KEY, expiresAt);
  storage.setNumber(RESEND_AVAILABLE_AT_KEY, resendAvailableAt);
};

// Restores a complete unexpired challenge or clears partial stale state.
export const readEmailVerificationFlow = (
  storage: AuthFlowStorage,
  now = Date.now(),
): PendingEmailVerification | null => {
  const email = storage.getString(EMAIL_KEY)?.trim();
  const challengeId = storage.getString(CHALLENGE_ID_KEY)?.trim();
  const expiresAt = storage.getNumber(EXPIRES_AT_KEY);
  const resendAvailableAt = storage.getNumber(RESEND_AVAILABLE_AT_KEY);

  if (
    !email ||
    !challengeId ||
    !Number.isFinite(expiresAt) ||
    !Number.isFinite(resendAvailableAt) ||
    (expiresAt ?? 0) <= now
  ) {
    clearEmailVerificationFlow(storage);
    return null;
  }

  return {
    email,
    challengeId,
    expiresAt: expiresAt as number,
    resendAvailableAt: resendAvailableAt as number,
  };
};
