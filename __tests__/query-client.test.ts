import {
  getQueryRetryDelay,
  queryClient,
  shouldRetryQuery,
} from "@/lib/queryClient";

// Creates an error carrying an HTTP response status.
const createHttpError = (status: number) => Object.assign(new Error("Request failed"), { status });

describe("query client policy", () => {
  it("retries only bounded transient query failures", () => {
    expect(shouldRetryQuery(0, new TypeError("Network request failed"))).toBe(true);
    expect(shouldRetryQuery(1, createHttpError(503))).toBe(true);
    expect(shouldRetryQuery(1, createHttpError(429))).toBe(true);
    expect(shouldRetryQuery(2, createHttpError(503))).toBe(false);
    expect(shouldRetryQuery(0, createHttpError(400))).toBe(false);
    expect(shouldRetryQuery(0, new Error("Invalid JSON"))).toBe(false);
  });

  it("never retries explicit cancellation", () => {
    const abortError = new Error("Aborted");
    abortError.name = "AbortError";

    expect(shouldRetryQuery(0, abortError)).toBe(false);
  });

  it("uses capped exponential delay and disables mutation retries", () => {
    expect(getQueryRetryDelay(0)).toBe(1_000);
    expect(getQueryRetryDelay(4)).toBe(16_000);
    expect(getQueryRetryDelay(8)).toBe(30_000);
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(shouldRetryQuery);
    expect(queryClient.getDefaultOptions().queries?.retryDelay).toBe(getQueryRetryDelay);
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
  });
});
