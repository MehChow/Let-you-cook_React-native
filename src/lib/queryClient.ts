import { QueryClient } from "@tanstack/react-query";

const MAX_QUERY_RETRIES = 2;

// Reads an HTTP-like status without coupling queries to one error class.
const getErrorStatus = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }

  const { status } = error;
  return typeof status === "number" ? status : undefined;
};

// Retries bounded transient query failures while excluding cancellations.
export const shouldRetryQuery = (failureCount: number, error: unknown) => {
  if (failureCount >= MAX_QUERY_RETRIES) {
    return false;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return false;
  }

  const status = getErrorStatus(error);
  if (status !== undefined) {
    return status === 408 || status === 429 || status >= 500;
  }

  return error instanceof TypeError;
};

// Computes a capped exponential delay for transient query retries.
export const getQueryRetryDelay = (attemptIndex: number) =>
  Math.min(1_000 * 2 ** attemptIndex, 30_000);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      retryDelay: getQueryRetryDelay,
    },
    mutations: {
      retry: false,
    },
  },
});
