import assert from "node:assert/strict";
import { test } from "node:test";

import {
  InMemoryEmailSender,
  SmtpEmailSender,
  createSmtpEmailSenderFromEnv,
  type EmailMessage,
  type SmtpTransport,
} from "./emailSender";

const message: EmailMessage = {
  to: "cook@example.com",
  subject: "Verify your Let You Cook email",
  text: "Your verification code is 123456.",
};

test("in-memory sender records complete messages for auth tests", async () => {
  const sender = new InMemoryEmailSender();

  await sender.send(message);

  assert.deepEqual(sender.messages, [message]);
});

test("SMTP sender supplies the configured From address", async () => {
  const deliveries: unknown[] = [];
  const transport: SmtpTransport = {
    sendMail: async (delivery) => {
      deliveries.push(delivery);
    },
  };
  const sender = new SmtpEmailSender({
    from: "Let You Cook <no-reply@letyoucook.local>",
    transport,
  });

  await sender.send(message);

  assert.deepEqual(deliveries, [
    {
      from: "Let You Cook <no-reply@letyoucook.local>",
      ...message,
    },
  ]);
});

test("SMTP factory reads the local Mailpit connection from environment", () => {
  let options: unknown;
  const sender = createSmtpEmailSenderFromEnv(
    {
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: "1025",
      SMTP_FROM: "Let You Cook <no-reply@letyoucook.local>",
    },
    (nextOptions) => {
      options = nextOptions;
      return { sendMail: async () => undefined };
    },
  );

  assert.ok(sender instanceof SmtpEmailSender);
  assert.deepEqual(options, { host: "127.0.0.1", port: 1025, secure: false });
});

test("SMTP factory rejects an invalid port before delivery", () => {
  assert.throws(
    () =>
      createSmtpEmailSenderFromEnv(
        {
          SMTP_HOST: "localhost",
          SMTP_PORT: "invalid",
          SMTP_FROM: "no-reply@letyoucook.local",
        },
        () => ({ sendMail: async () => undefined }),
      ),
    /SMTP_PORT must be an integer between 1 and 65535/,
  );
});
