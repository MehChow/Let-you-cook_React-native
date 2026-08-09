import { useMutation } from "@tanstack/react-query";

import { authApi, type AuthCredentials } from "./api";

// Exposes real backend login state through a focused mutation hook.
export function useLogin() {
  const mutation = useMutation({
    mutationFn: (input: AuthCredentials) => authApi.login(input),
  });

  return {
    login: mutation.mutateAsync,
    isLoggingIn: mutation.isPending,
  };
}
