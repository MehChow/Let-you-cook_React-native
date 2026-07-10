import { useMutation } from "@tanstack/react-query";

import { authApi, type SignUpInput } from "./api";

export function useCreateAccount() {
  const mutation = useMutation({ mutationFn: (input: SignUpInput) => authApi.signUp(input) });

  return {
    createAccount: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
