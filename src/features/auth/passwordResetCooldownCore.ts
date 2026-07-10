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
  now: number,
): number {
  const availableAt = startPasswordResetCooldown(storage, now);
  storage.setString(PASSWORD_RESET_EMAIL_KEY, email.trim());
  return availableAt;
}

export function clearPasswordResetFlow(storage: CooldownStorage): void {
  storage.remove(PASSWORD_RESET_COOLDOWN_KEY);
  clearPasswordResetEmail(storage);
}

export function clearPasswordResetEmail(storage: CooldownStorage): void {
  storage.remove(PASSWORD_RESET_EMAIL_KEY);
}
