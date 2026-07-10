import { useMutation } from "@tanstack/react-query";

import type { AuthCredentials } from "./api";

const DEMO_CREDENTIALS: AuthCredentials = {
  email: "gg@gmail.com",
  password: "coffee123",
};

const loginLocally = async (input: AuthCredentials): Promise<void> => {
  if (
    input.email !== DEMO_CREDENTIALS.email ||
    input.password !== DEMO_CREDENTIALS.password
  ) {
    throw new Error("Invalid credentials.");
  }
};

export function useLogin() {
  const mutation = useMutation({ mutationFn: loginLocally });

  return {
    login: mutation.mutateAsync,
    isLoggingIn: mutation.isPending,
  };
}
