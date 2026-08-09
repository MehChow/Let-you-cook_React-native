export type ErrorPresentationKind =
  | "cancelled"
  | "offline"
  | "validation"
  | "authentication"
  | "not-found"
  | "conflict"
  | "rate-limited"
  | "server"
  | "unknown";

export interface ApiErrorOptions {
  code: string;
  status: number;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  retryAfterMs?: number;
}

export interface ErrorPresentation {
  kind: ErrorPresentationKind;
  message: string;
  retryable: boolean;
  shouldToast: boolean;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  retryAfterMs?: number;
}

// Represents a failed HTTP response using safe structured metadata.
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly requestId?: string;
  readonly retryAfterMs?: number;

  constructor(options: ApiErrorOptions) {
    super(options.message ?? "Request failed");
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.fieldErrors = options.fieldErrors;
    this.requestId = options.requestId;
    this.retryAfterMs = options.retryAfterMs;
  }
}

const FORBIDDEN_FIELD_SEGMENTS = new Set(["__proto__", "constructor", "prototype"]);

// Accepts only inert dotted paths suitable for future form adapters.
const isSafeFieldPath = (path: string) => path.length > 0 && path.split(".").every(
  (segment) => /^[A-Za-z0-9_-]+$/.test(segment) && !FORBIDDEN_FIELD_SEGMENTS.has(segment),
);

// Validates the field-error subset needed by mobile forms.
const readFieldErrors = (value: unknown) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value);
  if (!entries.every(([path, messages]) =>
    isSafeFieldPath(path) && Array.isArray(messages) && messages.length > 0
      && messages.every((message) => typeof message === "string")
  )) {
    return undefined;
  }

  return Object.fromEntries(entries) as Record<string, string[]>;
};

// Parses a delta-seconds Retry-After header into milliseconds.
const readRetryAfterMs = (value: string | null) => {
  if (value === null || !/^\d+$/.test(value)) {
    return undefined;
  }

  const seconds = Number(value);
  return Number.isSafeInteger(seconds) && seconds <= Number.MAX_SAFE_INTEGER / 1_000
    ? seconds * 1_000
    : undefined;
};

// Converts an unsuccessful response into the shared mobile error model.
export const apiErrorFromResponse = async (response: Response) => {
  const body = await response.json().catch(() => null) as unknown;
  const candidate = typeof body === "object" && body !== null && "error" in body
    ? body.error
    : undefined;
  const error = typeof candidate === "object" && candidate !== null
    ? candidate as Record<string, unknown>
    : undefined;
  const code = typeof error?.code === "string" && error.code.length > 0
    ? error.code
    : "unknown_api_error";
  const bodyRequestId = typeof error?.requestId === "string" && error.requestId.trim().length > 0
    ? error.requestId.trim()
    : undefined;
  const headerRequestId = response.headers.get("X-Request-Id")?.trim() || undefined;

  return new ApiError({
    code,
    status: response.status,
    fieldErrors: code === "validation_failed" && response.status === 400
      ? readFieldErrors(error?.fieldErrors)
      : undefined,
    requestId: bodyRequestId ?? headerRequestId,
    retryAfterMs: readRetryAfterMs(response.headers.get("Retry-After")),
  });
};

// Adds diagnostic API metadata without changing presentation policy.
const withApiMetadata = (
  presentation: ErrorPresentation,
  error: ApiError,
): ErrorPresentation => ({
  ...presentation,
  ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
  ...(error.requestId ? { requestId: error.requestId } : {}),
  ...(error.retryAfterMs !== undefined ? { retryAfterMs: error.retryAfterMs } : {}),
});

const SESSION_ERROR_CODES = new Set([
  "authentication_required",
  "invalid_access_token",
  "invalid_refresh_token",
  "refresh_token_expired",
  "refresh_token_reuse_detected",
]);

// Maps transport failures to stable, UI-framework-independent presentation.
export const toErrorPresentation = (error: unknown): ErrorPresentation => {
  if (error instanceof Error && error.name === "AbortError") {
    return { kind: "cancelled", message: "", retryable: false, shouldToast: false };
  }
  if (error instanceof TypeError) {
    return {
      kind: "offline",
      message: "Check your connection and try again.",
      retryable: true,
      shouldToast: true,
    };
  }
  if (!(error instanceof ApiError)) {
    return {
      kind: "unknown",
      message: "Something went wrong. Please try again.",
      retryable: false,
      shouldToast: true,
    };
  }

  let presentation: ErrorPresentation;
  if (error.code === "validation_failed") {
    presentation = { kind: "validation", message: "Some fields need attention.", retryable: false, shouldToast: true };
  } else if (error.code === "invalid_credentials") {
    presentation = { kind: "authentication", message: "Email or password is incorrect.", retryable: false, shouldToast: true };
  } else if (error.code === "email_verification_required") {
    presentation = { kind: "authentication", message: "Verify your email to continue.", retryable: false, shouldToast: true };
  } else if (error.code === "invalid_auth_challenge") {
    presentation = { kind: "authentication", message: "That code is invalid or expired. Request a new one.", retryable: false, shouldToast: true };
  } else if (SESSION_ERROR_CODES.has(error.code)) {
    presentation = { kind: "authentication", message: "Your session has expired. Please sign in again.", retryable: false, shouldToast: true };
  } else if (error.code === "email_already_registered") {
    presentation = { kind: "conflict", message: "That email is already registered.", retryable: false, shouldToast: true };
  } else if (error.code === "not_implemented") {
    presentation = { kind: "server", message: "This feature isn’t available yet.", retryable: false, shouldToast: true };
  } else if (error.status === 404) {
    presentation = { kind: "not-found", message: "We couldn’t find that.", retryable: false, shouldToast: true };
  } else if (error.status === 409) {
    presentation = { kind: "conflict", message: "That change conflicts with newer data.", retryable: false, shouldToast: true };
  } else if (error.status === 429) {
    presentation = { kind: "rate-limited", message: "Too many requests. Please wait and try again.", retryable: true, shouldToast: true };
  } else if (error.status >= 500 && error.status < 600) {
    presentation = { kind: "server", message: "The service is unavailable. Please try again.", retryable: true, shouldToast: true };
  } else {
    presentation = { kind: "unknown", message: "Something went wrong. Please try again.", retryable: false, shouldToast: true };
  }

  return withApiMetadata(presentation, error);
};
