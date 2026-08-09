import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

import type { RequestIdEnv } from "../http/requestId";

export type OperationalClassification =
  | "database_failure"
  | "email_delivery_failure"
  | "rate_limited"
  | "unexpected_failure";

export interface OperationalLogEvent {
  classification: OperationalClassification;
  level: "warn" | "error";
  method: string;
  requestId: string;
  routeScope: "auth" | "account" | "system";
  status: number;
}

export interface OperationalLogger {
  write(event: OperationalLogEvent): void;
}

// Carries only an allowlisted operational category across error boundaries.
export class OperationalFailure extends Error {
  constructor(readonly classification: OperationalClassification) {
    super("The operation failed.");
    this.name = "OperationalFailure";
  }
}

// Drops events when a caller deliberately supplies no logging sink.
export const noopOperationalLogger: OperationalLogger = {
  write: () => undefined,
};

// Emits the already-redacted structured event to server error output.
export const consoleOperationalLogger: OperationalLogger = {
  write: (event) => console.error(JSON.stringify(event)),
};

// Reduces request paths to an allowlisted family without identifiers or query.
export const operationalRouteScope = (
  path: string,
): OperationalLogEvent["routeScope"] =>
  path.startsWith("/v1/auth/")
    ? "auth"
    : path.startsWith("/v1/users/")
      ? "account"
      : "system";

// Classifies failures without retaining raw exception messages or properties.
export const classifyOperationalFailure = (
  error: unknown,
): OperationalClassification => {
  if (error instanceof OperationalFailure) {
    return error.classification;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return "database_failure";
  }

  return "unexpected_failure";
};

// Writes one allowlisted failure event while isolating logger failures.
export const writeOperationalFailure = (
  logger: OperationalLogger,
  context: Context<RequestIdEnv>,
  error: unknown,
): void => {
  if (error instanceof HTTPException && error.status < 500) {
    return;
  }

  try {
    logger.write({
      classification: classifyOperationalFailure(error),
      level: "error",
      method: context.req.method,
      requestId: context.get("requestId"),
      routeScope: operationalRouteScope(context.req.path),
      status: 500,
    });
  } catch {
    // Logging must never replace the original safe API response.
  }
};
