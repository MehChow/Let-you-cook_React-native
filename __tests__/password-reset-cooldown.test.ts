import {
  canSendPasswordResetCode,
  getPasswordResetRemainingSeconds,
  PASSWORD_RESET_COOLDOWN_KEY,
  PASSWORD_RESET_COOLDOWN_MS,
  PASSWORD_RESET_EMAIL_KEY,
  clearPasswordResetEmail,
  clearPasswordResetFlow,
  readPasswordResetAvailableAt,
  readPasswordResetChallengeId,
  readPasswordResetEmail,
  startPasswordResetFlow,
  startPasswordResetCooldown,
  type CooldownStorage,
} from "@/features/auth/passwordResetCooldownCore";

const challenge = {
  ok: true as const,
  challengeId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
  expiresAt: "2026-08-09T10:10:00.000Z",
  resendAvailableAt: "2026-08-09T10:01:00.000Z",
};

class MemoryStorage implements CooldownStorage {
  private readonly values = new Map<string, number>();
  private readonly strings = new Map<string, string>();

  getNumber(key: string) {
    return this.values.get(key);
  }

  set(key: string, value: number) {
    this.values.set(key, value);
  }

  remove(key: string) {
    this.values.delete(key);
    this.strings.delete(key);
  }

  getString(key: string) {
    return this.strings.get(key);
  }

  setString(key: string, value: string) {
    this.strings.set(key, value);
  }
}

describe("password reset cooldown core", () => {
  it("returns zero when no cooldown is stored", () => {
    expect(getPasswordResetRemainingSeconds(null, 1_000)).toBe(0);
  });

  it("rounds an active cooldown up to the next whole second", () => {
    expect(getPasswordResetRemainingSeconds(61_001, 1_000)).toBe(61);
    expect(getPasswordResetRemainingSeconds(61_000, 1_001)).toBe(60);
  });

  it("allows sending at and after the available timestamp", () => {
    const storage = new MemoryStorage();
    storage.set(PASSWORD_RESET_COOLDOWN_KEY, 60_000);

    expect(canSendPasswordResetCode(storage, 59_999)).toBe(false);
    expect(canSendPasswordResetCode(storage, 60_000)).toBe(true);
  });

  it("persists a timestamp exactly sixty seconds after the supplied time", () => {
    const storage = new MemoryStorage();

    expect(startPasswordResetCooldown(storage, 10_000)).toBe(10_000 + PASSWORD_RESET_COOLDOWN_MS);
    expect(readPasswordResetAvailableAt(storage)).toBe(70_000);
  });

  it("treats stale timestamps as expired", () => {
    const storage = new MemoryStorage();
    storage.set(PASSWORD_RESET_COOLDOWN_KEY, 60_000);

    expect(readPasswordResetAvailableAt(storage)).toBe(60_000);
    expect(canSendPasswordResetCode(storage, 60_001)).toBe(true);
  });

  it("persists the email and opaque challenge with a new password reset flow", () => {
    const storage = new MemoryStorage();

    startPasswordResetFlow(storage, "gg@gmail.com", challenge);

    expect(readPasswordResetEmail(storage)).toBe("gg@gmail.com");
    expect(readPasswordResetChallengeId(storage)).toBe(challenge.challengeId);
    expect(readPasswordResetAvailableAt(storage)).toBe(
      Date.parse(challenge.resendAvailableAt),
    );
  });

  it("clears the email and cooldown when the flow is abandoned or completed", () => {
    const storage = new MemoryStorage();
    storage.set(PASSWORD_RESET_COOLDOWN_KEY, 70_000);
    storage.setString(PASSWORD_RESET_EMAIL_KEY, "gg@gmail.com");

    clearPasswordResetFlow(storage);

    expect(readPasswordResetEmail(storage)).toBeNull();
    expect(readPasswordResetAvailableAt(storage)).toBeNull();
  });

  it("can clear only the email while preserving the global cooldown", () => {
    const storage = new MemoryStorage();
    storage.set(PASSWORD_RESET_COOLDOWN_KEY, 70_000);
    storage.setString(PASSWORD_RESET_EMAIL_KEY, "gg@gmail.com");

    clearPasswordResetEmail(storage);

    expect(readPasswordResetEmail(storage)).toBeNull();
    expect(readPasswordResetAvailableAt(storage)).toBe(70_000);
  });
});
