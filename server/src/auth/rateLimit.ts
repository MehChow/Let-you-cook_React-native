import { createHmac } from "node:crypto";

import type { Context, MiddlewareHandler } from "hono";

import { errorResponse } from "../http/errors";
import type { RequestIdEnv } from "../http/requestId";
import { getRequiredEnv } from "../config";
import {
  noopOperationalLogger,
  operationalRouteScope,
  type OperationalLogger,
} from "../observability/operationalLogger";

export type AuthRateLimitScope =
  | "signup"
  | "login"
  | "refresh"
  | "logout"
  | "email_verification_request"
  | "email_verification_confirmation"
  | "password_reset_request"
  | "password_reset_verification"
  | "password_reset_completion";

interface AuthRateLimitPolicy {
  limit: number;
  windowMs: number;
}

export interface AuthRateLimitOptions {
  now?: () => number;
  keyForRequest?: (
    context: Context<RequestIdEnv>,
    scope: AuthRateLimitScope,
  ) => string | Promise<string>;
  policies?: Partial<Record<AuthRateLimitScope, AuthRateLimitPolicy>>;
  logger?: OperationalLogger;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const DEFAULT_POLICIES: Record<AuthRateLimitScope, AuthRateLimitPolicy> = {
  signup: { limit: 5, windowMs: 15 * 60_000 },
  login: { limit: 10, windowMs: 15 * 60_000 },
  refresh: { limit: 30, windowMs: 60_000 },
  logout: { limit: 30, windowMs: 60_000 },
  email_verification_request: { limit: 3, windowMs: 10 * 60_000 },
  email_verification_confirmation: { limit: 10, windowMs: 10 * 60_000 },
  password_reset_request: { limit: 3, windowMs: 10 * 60_000 },
  password_reset_verification: { limit: 10, windowMs: 10 * 60_000 },
  password_reset_completion: { limit: 5, windowMs: 10 * 60_000 },
};

const PATH_SCOPES = new Map<string, AuthRateLimitScope>([
  ["/v1/auth/signup", "signup"],
  ["/v1/auth/login", "login"],
  ["/v1/auth/refresh", "refresh"],
  ["/v1/auth/logout", "logout"],
  ["/v1/auth/email-verification/requests", "email_verification_request"],
  [
    "/v1/auth/email-verification/confirmations",
    "email_verification_confirmation",
  ],
  ["/v1/auth/password-reset/requests", "password_reset_request"],
  ["/v1/auth/password-reset/verifications", "password_reset_verification"],
  ["/v1/auth/password-reset/completions", "password_reset_completion"],
]);

// Extracts only the route-specific selector needed for a safe hashed key.
const readSelector = async (
  context: Context<RequestIdEnv>,
  scope: AuthRateLimitScope,
): Promise<string> => {
  try {
    const body = (await context.req.json()) as Record<string, unknown>;
    const field =
      scope === "signup" ||
      scope === "login" ||
      scope === "email_verification_request" ||
      scope === "password_reset_request"
        ? "email"
        : scope === "email_verification_confirmation" ||
            scope === "password_reset_verification"
          ? "challengeId"
          : scope === "password_reset_completion"
            ? "resetGrant"
            : "refreshToken";
    const value = body[field];
    if (typeof value !== "string") {
      return "missing";
    }

    const normalized = value.trim();
    return field === "email" ? normalized.toLowerCase() : normalized;
  } catch {
    return "malformed";
  }
};

// Derives a non-reversible key without retaining raw identifiers or secrets.
const safeKeyForRequest = async (
  context: Context<RequestIdEnv>,
  scope: AuthRateLimitScope,
): Promise<string> => {
  const client = context.req.header("cf-connecting-ip") ?? "unattributed";
  const selector = await readSelector(context, scope);
  const secret = process.env.AUTH_RATE_LIMIT_SECRET ?? getRequiredEnv("JWT_SECRET");
  return createHmac("sha256", secret)
    .update(`${scope}:${client}:${selector}`)
    .digest("base64url");
};

// Applies deterministic in-memory buckets to only versioned Auth operations.
export const createAuthRateLimitMiddleware = ({
  now = Date.now,
  keyForRequest = safeKeyForRequest,
  policies = {},
  logger = noopOperationalLogger,
}: AuthRateLimitOptions = {}): MiddlewareHandler<RequestIdEnv> => {
  const buckets = new Map<string, RateLimitBucket>();
  const effectivePolicies = { ...DEFAULT_POLICIES, ...policies };

  return async (context, next) => {
    const scope = PATH_SCOPES.get(context.req.path);
    if (!scope) {
      return next();
    }

    const policy = effectivePolicies[scope];
    const key = `${scope}:${await keyForRequest(context, scope)}`;
    const currentTime = now();
    const currentBucket = buckets.get(key);
    const bucket =
      !currentBucket || currentBucket.resetAt <= currentTime
        ? { count: 0, resetAt: currentTime + policy.windowMs }
        : currentBucket;

    if (bucket.count >= policy.limit) {
      context.header(
        "Retry-After",
        String(Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1_000))),
      );
      try {
        logger.write({
          classification: "rate_limited",
          level: "warn",
          method: context.req.method,
          requestId: context.get("requestId"),
          routeScope: operationalRouteScope(context.req.path),
          status: 429,
        });
      } catch {
        // Logging must not alter the stable rate-limit response.
      }
      return errorResponse(context, "rate_limited");
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    return next();
  };
};
