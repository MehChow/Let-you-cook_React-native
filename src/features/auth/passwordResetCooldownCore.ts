import type { AuthChallengeResponse } from "./api";

export interface CooldownStorage {
  getNumber(key: string): number | undefined;
  getString(key: string): string | undefined;
  set(key: string, value: number): void;
  setString(key: string, value: string): void;
  remove(key: string): void;
}

export const PASSWORD_RESET_COOLDOWN_MS = 60_000;
export const PASSWORD_RESET_COOLDOWN_KEY = "auth.password-reset.available-at";
export const PASSWORD_RESET_EMAIL_KEY = "auth.password-reset.email";
export const PASSWORD_RESET_CHALLENGE_ID_KEY = "auth.password-reset.challenge-id";
export const PASSWORD_RESET_EXPIRES_AT_KEY = "auth.password-reset.expires-at";

export function readPasswordResetAvailableAt(storage: CooldownStorage): number | null {
  const availableAt = storage.getNumber(PASSWORD_RESET_COOLDOWN_KEY);

  return typeof availableAt === "number" && Number.isFinite(availableAt) ? availableAt : null;
}

export function getPasswordResetRemainingSeconds(availableAt: number | null, now: number): number {
  if (availableAt === null) {
    return 0;
  }

  return Math.max(0, Math.ceil((availableAt - now) / 1_000));
}

export function canSendPasswordResetCode(storage: CooldownStorage, now: number): boolean {
  return getPasswordResetRemainingSeconds(readPasswordResetAvailableAt(storage), now) === 0;
}

export function startPasswordResetCooldown(storage: CooldownStorage, now: number): number {
  const availableAt = now + PASSWORD_RESET_COOLDOWN_MS;
  storage.set(PASSWORD_RESET_COOLDOWN_KEY, availableAt);
  return availableAt;
}

export function readPasswordResetEmail(storage: CooldownStorage): string | null {
  const email = storage.getString(PASSWORD_RESET_EMAIL_KEY)?.trim();

  return email ? email : null;
}

export function startPasswordResetFlow(
  storage: CooldownStorage,
  email: string,
  response: AuthChallengeResponse,
): number {
  const availableAt = Date.parse(response.resendAvailableAt);
  const expiresAt = Date.parse(response.expiresAt);
  if (!Number.isFinite(availableAt) || !Number.isFinite(expiresAt)) {
    throw new Error("The password reset challenge timestamps are invalid.");
  }

  storage.set(PASSWORD_RESET_COOLDOWN_KEY, availableAt);
  storage.set(PASSWORD_RESET_EXPIRES_AT_KEY, expiresAt);
  storage.setString(PASSWORD_RESET_EMAIL_KEY, email.trim());
  storage.setString(PASSWORD_RESET_CHALLENGE_ID_KEY, response.challengeId);
  return availableAt;
}

export function clearPasswordResetFlow(storage: CooldownStorage): void {
  storage.remove(PASSWORD_RESET_COOLDOWN_KEY);
  storage.remove(PASSWORD_RESET_EXPIRES_AT_KEY);
  storage.remove(PASSWORD_RESET_CHALLENGE_ID_KEY);
  clearPasswordResetEmail(storage);
}

export function clearPasswordResetEmail(storage: CooldownStorage): void {
  storage.remove(PASSWORD_RESET_EMAIL_KEY);
}

// Reads the opaque challenge identifier required for verification.
export function readPasswordResetChallengeId(storage: CooldownStorage): string | null {
  const challengeId = storage.getString(PASSWORD_RESET_CHALLENGE_ID_KEY)?.trim();
  return challengeId ? challengeId : null;
}

// Reads the absolute server challenge expiry timestamp.
export function readPasswordResetExpiresAt(storage: CooldownStorage): number | null {
  const expiresAt = storage.getNumber(PASSWORD_RESET_EXPIRES_AT_KEY);
  return typeof expiresAt === "number" && Number.isFinite(expiresAt)
    ? expiresAt
    : null;
}
