import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import type {
  FieldErrors,
  NonValidationErrorCode,
} from "../contracts/common";
import type { RequestIdEnv } from "./requestId";

export type {
  ApiErrorEnvelope,
  FieldErrors,
  NonValidationApiError,
  NonValidationErrorCode,
  ValidationApiError,
} from "../contracts/common";

interface ValidationIssue {
  path: ReadonlyArray<PropertyKey>;
  message: string;
}

type ValidationHookResult =
  | { success: true }
  | { success: false; error: { issues: ReadonlyArray<ValidationIssue> } };

export const errorDefinitions = {
  malformed_request: { status: 400, message: "The request could not be read." },
  authentication_required: { status: 401, message: "Authentication is required." },
  invalid_access_token: {
    status: 401,
    message: "Authentication is invalid or expired.",
  },
  invalid_credentials: { status: 401, message: "Email or password is incorrect." },
  invalid_refresh_token: { status: 401, message: "Refresh token is invalid." },
  refresh_token_expired: { status: 401, message: "Refresh token has expired." },
  refresh_token_reuse_detected: {
    status: 403,
    message: "This session is no longer valid.",
  },
  resource_not_found: {
    status: 404,
    message: "The requested resource was not found.",
  },
  route_not_found: {
    status: 404,
    message: "The requested endpoint was not found.",
  },
  email_already_registered: { status: 409, message: "Email is already registered." },
  not_implemented: {
    status: 501,
    message: "This operation is not available yet.",
  },
  internal_server_error: {
    status: 500,
    message: "The server could not complete the request.",
  },
} as const satisfies Record<
  NonValidationErrorCode,
  { status: ContentfulStatusCode; message: string }
>;

// Builds a safe non-validation response from its stable definition.
export const errorResponse = <E extends RequestIdEnv>(
  c: Context<E>,
  code: NonValidationErrorCode,
) => {
  const definition = errorDefinitions[code];
  return c.json(
    {
      error: {
        code,
        message: definition.message,
        requestId: c.get("requestId"),
      },
    },
    definition.status,
  );
};

// Converts Zod issues into deterministic field-error arrays.
export const fieldErrorsFromIssues = (
  issues: ReadonlyArray<ValidationIssue>,
): FieldErrors => {
  const fieldErrors: FieldErrors = {};
  for (const issue of issues) {
    const path =
      issue.path.length === 0 ? "_root" : issue.path.map(String).join(".");
    (fieldErrors[path] ??= []).push(issue.message);
  }
  return fieldErrors;
};

// Builds the sole response shape allowed to include field errors.
export const validationErrorResponse = <E extends RequestIdEnv>(
  c: Context<E>,
  fieldErrors: FieldErrors,
) =>
  c.json(
    {
      error: {
        code: "validation_failed" as const,
        message: "Some fields need attention.",
        fieldErrors,
        requestId: c.get("requestId"),
      },
    },
    400,
  );

// Converts unsuccessful validator results into the shared error response.
export const validationErrorHook = <E extends RequestIdEnv>(
  result: ValidationHookResult,
  c: Context<E>,
) => {
  if (!result.success) {
    return validationErrorResponse(
      c,
      fieldErrorsFromIssues(result.error.issues),
    );
  }
};

// Converts unmatched routes into the stable endpoint-not-found response.
export const handleNotFound = <E extends RequestIdEnv>(c: Context<E>) =>
  errorResponse(c, "route_not_found");

// Converts thrown failures into safe root-level error responses.
export const handleAppError = <E extends RequestIdEnv>(
  error: Error,
  c: Context<E>,
) =>
  error instanceof HTTPException && error.status === 400
    ? errorResponse(c, "malformed_request")
    : errorResponse(c, "internal_server_error");
