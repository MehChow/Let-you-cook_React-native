import {
  ApiError,
  apiErrorFromResponse,
  toErrorPresentation,
} from "@/lib/apiError";

const REQUEST_ID = "00000000-0000-4000-8000-000000000001";

// Creates a response with optional request metadata.
const createResponse = (
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", ...headers },
});

describe("apiErrorFromResponse", () => {
  it("parses validation details and keeps app-owned presentation copy", async () => {
    const error = await apiErrorFromResponse(createResponse({
      error: {
        code: "validation_failed",
        message: "Untrusted server prose",
        fieldErrors: { title: ["Enter a title."] },
        requestId: REQUEST_ID,
      },
    }, 400));

    expect(error).toMatchObject({
      name: "ApiError",
      message: "Request failed",
      code: "validation_failed",
      status: 400,
      requestId: REQUEST_ID,
      fieldErrors: { title: ["Enter a title."] },
    });
    expect(toErrorPresentation(error)).toEqual({
      kind: "validation",
      message: "Some fields need attention.",
      retryable: false,
      shouldToast: true,
      fieldErrors: { title: ["Enter a title."] },
      requestId: REQUEST_ID,
    });
  });

  it("falls back safely for malformed envelopes and reads response metadata", async () => {
    const response = createResponse({ message: "Leak this detail" }, 429, {
      "X-Request-Id": REQUEST_ID,
      "Retry-After": "7",
    });

    const error = await apiErrorFromResponse(response);

    expect(error).toMatchObject({
      code: "unknown_api_error",
      message: "Request failed",
      requestId: REQUEST_ID,
      retryAfterMs: 7_000,
      status: 429,
    });
    expect(toErrorPresentation(error)).toMatchObject({
      kind: "rate-limited",
      message: "Too many requests. Please wait and try again.",
      retryable: true,
    });
  });

  it("ignores malformed fields and uses a non-empty header request ID", async () => {
    const error = await apiErrorFromResponse(createResponse({
      error: {
        code: "validation_failed",
        message: "Bad input",
        fieldErrors: { title: "not-an-array" },
        requestId: "",
      },
    }, 400, {
      "Retry-After": "999999999999999999999999",
      "X-Request-Id": REQUEST_ID,
    }));

    expect(error.fieldErrors).toBeUndefined();
    expect(error.retryAfterMs).toBeUndefined();
    expect(error.requestId).toBe(REQUEST_ID);
  });

  it("discards field errors from non-validation envelopes", async () => {
    const error = await apiErrorFromResponse(createResponse({
      error: {
        code: "invalid_credentials",
        message: "Invalid credentials",
        fieldErrors: { password: ["Leaked server copy"] },
        requestId: REQUEST_ID,
      },
    }, 401));

    expect(error.fieldErrors).toBeUndefined();
    expect(toErrorPresentation(error)).not.toHaveProperty("fieldErrors");
  });

  it.each(["__proto__", "constructor", "profile.prototype.name"])(
    "rejects the dangerous validation path %s",
    async (path) => {
      const response = new Response(JSON.stringify({
        error: {
          code: "validation_failed",
          message: "Bad input",
          fieldErrors: { [path]: ["Do not apply this path"] },
          requestId: REQUEST_ID,
        },
      }), { status: 400, headers: { "Content-Type": "application/json" } });

      const error = await apiErrorFromResponse(response);

      expect(error.fieldErrors).toBeUndefined();
    },
  );

  it("prefers a valid body request ID and trims a header fallback", async () => {
    const bodyId = "00000000-0000-4000-8000-000000000002";
    const bodyError = await apiErrorFromResponse(createResponse({
      error: { code: "resource_not_found", message: "Missing", requestId: bodyId },
    }, 404, { "X-Request-Id": `  ${REQUEST_ID}  ` }));
    const headerError = await apiErrorFromResponse(createResponse({}, 500, {
      "X-Request-Id": `  ${REQUEST_ID}  `,
    }));

    expect(bodyError.requestId).toBe(bodyId);
    expect(headerError.requestId).toBe(REQUEST_ID);
  });
});

describe("toErrorPresentation", () => {
  it("maps cancellation silently and network failures to offline retry", () => {
    const abortError = new Error("Aborted");
    abortError.name = "AbortError";

    expect(toErrorPresentation(abortError)).toMatchObject({
      kind: "cancelled",
      shouldToast: false,
      retryable: false,
    });
    expect(toErrorPresentation(new TypeError("Network request failed"))).toMatchObject({
      kind: "offline",
      message: "Check your connection and try again.",
      shouldToast: true,
      retryable: true,
    });
  });

  it("maps authentication failures to app-owned messages", () => {
    expect(toErrorPresentation(new ApiError({
      code: "invalid_credentials",
      status: 401,
    }))).toMatchObject({
      kind: "authentication",
      message: "Email or password is incorrect.",
      retryable: false,
    });
    expect(toErrorPresentation(new ApiError({
      code: "refresh_token_expired",
      status: 401,
      requestId: REQUEST_ID,
    }))).toMatchObject({
      kind: "authentication",
      message: "Your session has expired. Please sign in again.",
      requestId: REQUEST_ID,
    });
  });

  it.each([
    [404, "resource_not_found", "not-found", "We couldn’t find that."],
    [409, "email_already_registered", "conflict", "That email is already registered."],
    [501, "not_implemented", "server", "This feature isn’t available yet."],
    [503, "internal_server_error", "server", "The service is unavailable. Please try again."],
  ])("maps status %s and code %s", (status, code, kind, message) => {
    expect(toErrorPresentation(new ApiError({ code, status }))).toMatchObject({
      kind,
      message,
    });
  });

  it("uses a safe fallback for unexpected failures", () => {
    expect(toErrorPresentation({ secret: "do not leak" })).toEqual({
      kind: "unknown",
      message: "Something went wrong. Please try again.",
      retryable: false,
      shouldToast: true,
    });
  });

  it("maps a generic conflict without using resource-specific copy", () => {
    expect(toErrorPresentation(new ApiError({
      code: "state_conflict",
      status: 409,
    }))).toMatchObject({
      kind: "conflict",
      message: "That change conflicts with newer data.",
      retryable: false,
    });
  });
});
