import { createMMKV } from "react-native-mmkv";
import { useEffect, useState } from "react";

import type { AuthChallengeResponse } from "./api";
import {
  clearEmailVerificationFlow as clearStoredFlow,
  readEmailVerificationFlow,
  saveEmailVerificationFlow as saveStoredFlow,
  type AuthFlowStorage,
} from "./emailVerificationStateCore";

const storage = createMMKV();
const listeners = new Set<() => void>();

const emailVerificationStorage: AuthFlowStorage = {
  getNumber: (key) => storage.getNumber(key),
  getString: (key) => storage.getString(key),
  setNumber: (key, value) => storage.set(key, value),
  setString: (key, value) => storage.set(key, value),
  remove: (key) => storage.remove(key),
};

// Notifies mounted verification screens after persisted flow changes.
const notifyFlowChanged = () => listeners.forEach((listener) => listener());

// Persists a new or replacement email-verification challenge.
export const saveEmailVerificationFlow = (
  email: string,
  response: AuthChallengeResponse,
) => {
  saveStoredFlow(emailVerificationStorage, email, response);
  notifyFlowChanged();
};

// Clears resumable verification state after completion or abandonment.
export const clearEmailVerificationFlow = () => {
  clearStoredFlow(emailVerificationStorage);
  notifyFlowChanged();
};

// Exposes the current persisted verification flow to native screens.
export const useEmailVerificationFlow = () => {
  const [now, setNow] = useState(() => Date.now());
  const [, refresh] = useState(0);
  const flow = readEmailVerificationFlow(emailVerificationStorage, now);
  const remainingSeconds = flow
    ? Math.max(0, Math.ceil((flow.resendAvailableAt - now) / 1_000))
    : 0;

  useEffect(() => {
    const listener = () => {
      setNow(Date.now());
      refresh((version) => version + 1);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0) {
      return undefined;
    }

    const interval = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  return { flow, remainingSeconds };
};
