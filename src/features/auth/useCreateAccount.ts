import { useMutation } from "@tanstack/react-query";

import type { SignUpInput } from "./api";

const createLocalAccount = async (_input: SignUpInput): Promise<void> => {
  await Promise.resolve();
};

export function useCreateAccount() {
  const mutation = useMutation({ mutationFn: createLocalAccount });

  return {
    createAccount: mutation.mutateAsync,
    isCreating: mutation.isPending,
  };
}
