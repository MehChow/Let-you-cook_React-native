import { createTransport } from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

interface SmtpDelivery extends EmailMessage {
  from: string;
}

export interface SmtpTransport {
  sendMail(delivery: SmtpDelivery): Promise<unknown>;
}

interface SmtpTransportOptions {
  host: string;
  port: number;
  secure: boolean;
}

interface SmtpEmailSenderOptions {
  from: string;
  transport: SmtpTransport;
}

type SmtpTransportFactory = (options: SmtpTransportOptions) => SmtpTransport;

// Records complete messages only inside explicitly injected automated tests.
export class InMemoryEmailSender implements EmailSender {
  readonly messages: EmailMessage[] = [];

  // Stores a copy so callers cannot mutate a recorded delivery later.
  async send(message: EmailMessage): Promise<void> {
    this.messages.push({ ...message });
  }
}

// Delivers application-owned messages through an injected SMTP transport.
export class SmtpEmailSender implements EmailSender {
  private readonly from: string;
  private readonly transport: SmtpTransport;

  constructor({ from, transport }: SmtpEmailSenderOptions) {
    this.from = from;
    this.transport = transport;
  }

  // Adds the configured sender identity before handing off to SMTP.
  async send(message: EmailMessage): Promise<void> {
    await this.transport.sendMail({ from: this.from, ...message });
  }
}

// Builds the development SMTP sender from validated server-only settings.
export const createSmtpEmailSenderFromEnv = (
  env: Readonly<Record<string, string | undefined>> = process.env,
  createSmtpTransport: SmtpTransportFactory = createTransport,
): EmailSender => {
  const host = env.SMTP_HOST?.trim();
  const from = env.SMTP_FROM?.trim();
  const port = Number(env.SMTP_PORT);

  if (!host) {
    throw new Error("SMTP_HOST is required");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("SMTP_PORT must be an integer between 1 and 65535");
  }
  if (!from) {
    throw new Error("SMTP_FROM is required");
  }

  return new SmtpEmailSender({
    from,
    transport: createSmtpTransport({ host, port, secure: false }),
  });
};
