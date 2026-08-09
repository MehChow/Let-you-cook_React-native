import {
  clearEmailVerificationFlow,
  readEmailVerificationFlow,
  saveEmailVerificationFlow,
  type AuthFlowStorage,
} from "@/features/auth/emailVerificationStateCore";

class MemoryStorage implements AuthFlowStorage {
  private readonly numbers = new Map<string, number>();
  private readonly strings = new Map<string, string>();

  // Reads a stored numeric auth-flow value.
  getNumber(key: string) {
    return this.numbers.get(key);
  }

  // Reads a stored string auth-flow value.
  getString(key: string) {
    return this.strings.get(key);
  }

  // Stores a numeric auth-flow value.
  setNumber(key: string, value: number) {
    this.numbers.set(key, value);
  }

  // Stores a string auth-flow value.
  setString(key: string, value: string) {
    this.strings.set(key, value);
  }

  // Removes either shape of stored auth-flow value.
  remove(key: string) {
    this.numbers.delete(key);
    this.strings.delete(key);
  }
}

const response = {
  ok: true as const,
  challengeId: "f6822e40-7c3a-40ec-a77f-c3291888dc0c",
  expiresAt: "2026-08-09T10:10:00.000Z",
  resendAvailableAt: "2026-08-09T10:01:00.000Z",
};

test("email verification state persists only resumable challenge fields", () => {
  const storage = new MemoryStorage();

  saveEmailVerificationFlow(storage, "COOK@example.com", response);

  expect(readEmailVerificationFlow(storage, Date.parse("2026-08-09T10:00:30.000Z"))).toEqual({
    email: "cook@example.com",
    challengeId: response.challengeId,
    expiresAt: Date.parse(response.expiresAt),
    resendAvailableAt: Date.parse(response.resendAvailableAt),
  });
});

test("expired verification state is cleared instead of resumed", () => {
  const storage = new MemoryStorage();
  saveEmailVerificationFlow(storage, "cook@example.com", response);

  expect(readEmailVerificationFlow(storage, Date.parse(response.expiresAt))).toBeNull();
  expect(readEmailVerificationFlow(storage, 0)).toBeNull();
});

test("email verification state clears after successful confirmation", () => {
  const storage = new MemoryStorage();
  saveEmailVerificationFlow(storage, "cook@example.com", response);

  clearEmailVerificationFlow(storage);

  expect(readEmailVerificationFlow(storage, 0)).toBeNull();
});
