import assert from "node:assert/strict";
import { test } from "node:test";

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import {
  type ApiErrorEnvelope,
  errorResponse,
  fieldErrorsFromIssues,
  handleAppError,
  handleNotFound,
  validationErrorHook,
} from "./errors";
import {
  REQUEST_ID_HEADER,
  requestIdMiddleware,
  type RequestIdEnv,
} from "./requestId";

test("non-validation errors omit fieldErrors and match the response header", async () => {
  const testApp = new Hono<RequestIdEnv>()
    .use("*", requestIdMiddleware)
    .get("/error", (c) => errorResponse(c, "authentication_required"));

  const response = await testApp.request("/error");
  const body = (await response.json()) as ApiErrorEnvelope;

  assert.equal(response.status, 401);
  assert.equal(body.error.code, "authentication_required");
  assert.equal(body.error.message, "Authentication is required.");
  assert.equal(body.error.requestId, response.headers.get(REQUEST_ID_HEADER));
  assert.equal("fieldErrors" in body.error, false);
});

test("validation issues are grouped by dot path in encounter order", () => {
  const fieldErrors = fieldErrorsFromIssues([
    { path: ["ingredients", 1, "amount"], message: "Enter a quantity." },
    { path: ["ingredients", 1, "amount"], message: "Use a positive quantity." },
    { path: [], message: "Invalid form." },
  ]);

  assert.deepEqual(fieldErrors, {
    "ingredients.1.amount": [
      "Enter a quantity.",
      "Use a positive quantity.",
    ],
    _root: ["Invalid form."],
  });
});

test("validation hook returns grouped validation details", async () => {
  const testApp = new Hono<RequestIdEnv>()
    .use("*", requestIdMiddleware)
    .post(
      "/validate",
      zValidator(
        "json",
        z.object({ name: z.string().min(1, "Enter a name.") }),
        validationErrorHook,
      ),
      (c) => c.json({ ok: true }, 200),
    );

  const response = await testApp.request("/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "" }),
  });
  const body = (await response.json()) as ApiErrorEnvelope;

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    error: {
      code: "validation_failed",
      message: "Some fields need attention.",
      fieldErrors: { name: ["Enter a name."] },
      requestId: response.headers.get(REQUEST_ID_HEADER),
    },
  });
});

test("not-found handler returns a safe route error", async () => {
  const testApp = new Hono<RequestIdEnv>().use("*", requestIdMiddleware);
  testApp.notFound(handleNotFound);

  const response = await testApp.request("/missing");
  const body = (await response.json()) as ApiErrorEnvelope;

  assert.equal(response.status, 404);
  assert.deepEqual(body, {
    error: {
      code: "route_not_found",
      message: "The requested endpoint was not found.",
      requestId: response.headers.get(REQUEST_ID_HEADER),
    },
  });
});

test("unexpected failures return a safe internal error", async () => {
  const testApp = new Hono<RequestIdEnv>()
    .use("*", requestIdMiddleware)
    .get("/error", () => {
      throw new Error("secret SQL");
    });
  testApp.onError(handleAppError);

  const response = await testApp.request("/error");
  const serializedBody = await response.text();
  const body = JSON.parse(serializedBody) as ApiErrorEnvelope;

  assert.equal(response.status, 500);
  assert.deepEqual(body, {
    error: {
      code: "internal_server_error",
      message: "The server could not complete the request.",
      requestId: response.headers.get(REQUEST_ID_HEADER),
    },
  });
  assert.equal(serializedBody.includes("secret SQL"), false);
});

test("HTTP 400 exceptions return a safe malformed-request error", async () => {
  const testApp = new Hono<RequestIdEnv>()
    .use("*", requestIdMiddleware)
    .get("/malformed", () => {
      throw new HTTPException(400);
    });
  testApp.onError(handleAppError);

  const response = await testApp.request("/malformed");
  const body = (await response.json()) as ApiErrorEnvelope;

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    error: {
      code: "malformed_request",
      message: "The request could not be read.",
      requestId: response.headers.get(REQUEST_ID_HEADER),
    },
  });
});
