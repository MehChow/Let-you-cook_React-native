import assert from "node:assert/strict";
import { after, test } from "node:test";

import { eq } from "drizzle-orm";

import { createApp } from "../app";
import { db, pool } from "../db/client";
import { users } from "../db/schema";
import type { EmailMessage, EmailSender } from "../email/emailSender";
import { REQUEST_ID_HEADER } from "../http/requestId";

process.env.JWT_SECRET ??= "test-secret";

interface CapturedEvent {
  classification: string;
  level: string;
  method: string;
  requestId: string;
  routeScope: string;
  status: number;
}

// Records only the structured events supplied by the application boundary.
class CapturingLogger {
  readonly events: CapturedEvent[] = [];

  // Retains a copied event for redaction assertions.
  write(event: CapturedEvent): void {
    this.events.push({ ...event });
  }
}

// Fails delivery with deliberately sensitive exception prose.
class FailingEmailSender implements EmailSender {
  constructor(private readonly secret: string) {}

  // Simulates an external provider failure without recording the message.
  async send(_message: EmailMessage): Promise<void> {
    throw new Error(this.secret);
  }
}

// Sends one signup request through the full versioned route boundary.
const signUp = (app: ReturnType<typeof createApp>, email: string, password: string) =>
  app.request("/v1/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password, displayName: "Private Name" }),
  });

after(async () => {
  await pool.end();
});

test("email failures log only safe operational classification and request ID", async () => {
  const email = `logging-email-${Date.now()}@example.com`;
  const password = "private-password-123";
  const providerSecret = `smtp-secret-for-${email}`;
  const logger = new CapturingLogger();
  const app = createApp({
    emailSender: new FailingEmailSender(providerSecret),
    logger,
  });

  try {
    const response = await signUp(app, email, password);
    const body = await response.text();
    const serializedEvents = JSON.stringify(logger.events);

    assert.equal(response.status, 500);
    assert.equal(logger.events.length, 1);
    assert.deepEqual(logger.events[0], {
      classification: "email_delivery_failure",
      level: "error",
      method: "POST",
      requestId: response.headers.get(REQUEST_ID_HEADER),
      routeScope: "auth",
      status: 500,
    });
    for (const secret of [email, password, providerSecret, "Private Name"]) {
      assert.equal(body.includes(secret), false);
      assert.equal(serializedEvents.includes(secret), false);
    }
  } finally {
    await db.delete(users).where(eq(users.email, email));
  }
});

test("database failures retain classification without leaking connection details", async () => {
  const email = `logging-database-${Date.now()}@example.com`;
  const password = "private-password-456";
  const databaseSecret = "postgres://owner:secret@private-db.example/production";
  const logger = new CapturingLogger();
  const failingDatabase = {
    transaction: async () => {
      throw Object.assign(new Error(databaseSecret), { code: "ECONNREFUSED" });
    },
  } as unknown as typeof db;
  const app = createApp({
    emailSender: new FailingEmailSender("delivery must not run"),
    database: failingDatabase,
    logger,
  });

  const response = await signUp(app, email, password);
  const body = await response.text();
  const serializedEvents = JSON.stringify(logger.events);

  assert.equal(response.status, 500);
  assert.deepEqual(logger.events[0], {
    classification: "database_failure",
    level: "error",
    method: "POST",
    requestId: response.headers.get(REQUEST_ID_HEADER),
    routeScope: "auth",
    status: 500,
  });
  for (const secret of [email, password, databaseSecret]) {
    assert.equal(body.includes(secret), false);
    assert.equal(serializedEvents.includes(secret), false);
  }
});
