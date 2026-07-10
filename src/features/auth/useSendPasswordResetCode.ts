import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAuth } from "./useAuth";
import { passwordResetCooldownStorage } from "./passwordResetCooldown";
import {
  canSendPasswordResetCode,
  clearPasswordResetEmail,
  clearPasswordResetFlow as clearPasswordResetFlowFromStorage,
  getPasswordResetRemainingSeconds,
  readPasswordResetAvailableAt,
  readPasswordResetEmail,
  startPasswordResetFlow,
} from "./passwordResetCooldownCore";

let sendInFlight = false;
const cooldownListeners = new Set<() => void>();

export function subscribePasswordResetCooldown(listener: () => void) {
  cooldownListeners.add(listener);
  return () => {
    cooldownListeners.delete(listener);
  };
}

function notifyPasswordResetCooldownChanged() {
  cooldownListeners.forEach((listener) => listener());
}

export function useSendPasswordResetCode() {
  const { sendPasswordResetCode } = useAuth();
  const mutation = useMutation({
    mutationFn: async (email: string) => {
      if (sendInFlight) {
        throw new Error("Another code request is already in progress.");
      }

      const isCoolingDown = !canSendPasswordResetCode(
        passwordResetCooldownStorage,
        Date.now(),
      );
      if (isCoolingDown) {
        throw new Error("Please wait before requesting another code.");
      }

      sendInFlight = true;
      startPasswordResetFlow(passwordResetCooldownStorage, email, Date.now());
      notifyPasswordResetCooldownChanged();

      try {
        await sendPasswordResetCode(email);
      } catch (error) {
        clearPasswordResetFlowFromStorage(passwordResetCooldownStorage);
        notifyPasswordResetCooldownChanged();
        throw error;
      } finally {
        sendInFlight = false;
      }
    },
  });

  return {
    sendCode: mutation.mutateAsync,
    isSending: mutation.isPending,
  };
}

export function clearPasswordResetFlow() {
  clearPasswordResetFlowFromStorage(passwordResetCooldownStorage);
  notifyPasswordResetCooldownChanged();
}

export function clearPasswordResetForAnotherEmail() {
  if (canSendPasswordResetCode(passwordResetCooldownStorage, Date.now())) {
    clearPasswordResetFlowFromStorage(passwordResetCooldownStorage);
  } else {
    clearPasswordResetEmail(passwordResetCooldownStorage);
  }

  notifyPasswordResetCooldownChanged();
}

export function usePasswordResetCooldown() {
  const [now, setNow] = useState(() => Date.now());
  const [, setRefreshVersion] = useState(0);
  const availableAt = readPasswordResetAvailableAt(passwordResetCooldownStorage);
  const remainingSeconds = getPasswordResetRemainingSeconds(availableAt, now);

  useEffect(() => {
    return subscribePasswordResetCooldown(() => {
      setNow(Date.now());
      setRefreshVersion((version) => version + 1);
    });
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0) {
      return undefined;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
      setRefreshVersion((version) => version + 1);
    }, 1_000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  return {
    remainingSeconds,
    isCoolingDown: remainingSeconds > 0,
  };
}

export function usePasswordResetResume() {
  const [now, setNow] = useState(() => Date.now());
  const [, setRefreshVersion] = useState(0);
  const email = readPasswordResetEmail(passwordResetCooldownStorage);
  const remainingSeconds = getPasswordResetRemainingSeconds(
    readPasswordResetAvailableAt(passwordResetCooldownStorage),
    now,
  );

  useEffect(() => {
    return subscribePasswordResetCooldown(() => {
      setNow(Date.now());
      setRefreshVersion((version) => version + 1);
    });
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0) {
      if (email) {
        clearPasswordResetFlow();
      }
      return undefined;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
      setRefreshVersion((version) => version + 1);
    }, 1_000);
    return () => clearInterval(interval);
  }, [email, remainingSeconds]);

  return {
    pendingEmail: email,
    shouldResume: Boolean(email && remainingSeconds > 0),
  };
}
