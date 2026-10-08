import 'server-only';
import { env } from '@/lib/env';
import { logEvent } from '@/lib/security/log';

/**
 * Mail provider adapter. Business logic only calls `getMailer()` and `send()`;
 * the provider is chosen by MAIL_PROVIDER (smtp | resend | log).
 * - In production a missing provider/recipient is a configuration error:
 *   `getMailer()` returns null and the API answers 503 with direct contacts.
 *   Submissions are never silently discarded.
 * - In development the `log` adapter prints a redacted summary only.
 */
export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface MailMessage {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: MailAttachment[];
}

export interface Mailer {
  name: string;
  send(msg: MailMessage): Promise<void>;
}

// Header injection guard: no CR/LF in anything that ends up in a header.
const header = (v: string) => v.replace(/[\r\n]+/g, ' ').trim();

function logMailer(): Mailer {
  return {
    name: 'log',
    async send(msg) {
      logEvent('info', 'mail.dev-log', {
        note: 'MAIL_PROVIDER=log (development). Message not delivered.',
        to: msg.to,
        subject: msg.subject,
        textPreview: msg.text
          .split('\n')
          .map((l) => (l.length > 20 ? `${l.slice(0, 20)}…` : l))
          .slice(0, 30),
        attachments: (msg.attachments ?? []).map((a) => ({ filename: a.filename, bytes: a.content.length })),
      });
    },
  };
}

function smtpMailer(): Mailer {
  return {
    name: 'smtp',
    async send(msg) {
      const nodemailer = await import('nodemailer');
      const s = env.mail.smtp;
      const transport = nodemailer.createTransport({
        host: s.host,
        port: s.port,
        secure: s.secure,
        auth: s.user ? { user: s.user, pass: s.pass } : undefined,
        requireTLS: !s.secure,
        connectionTimeout: 10_000,
        socketTimeout: 20_000,
      });
      await transport.sendMail({
        from: header(env.mail.from!),
        to: header(msg.to),
        replyTo: msg.replyTo ? header(msg.replyTo) : undefined,
        subject: header(msg.subject),
        text: msg.text,
        html: msg.html,
        attachments: msg.attachments?.map((a) => ({ filename: a.filename, content: a.content, contentType: a.contentType })),
        disableUrlAccess: true,
        disableFileAccess: true,
      });
    },
  };
}

function resendMailer(): Mailer {
  return {
    name: 'resend',
    async send(msg) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.mail.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: header(env.mail.from!),
          to: [header(msg.to)],
          reply_to: msg.replyTo ? header(msg.replyTo) : undefined,
          subject: header(msg.subject),
          text: msg.text,
          html: msg.html,
          attachments: msg.attachments?.map((a) => ({ filename: a.filename, content: a.content.toString('base64') })),
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`resend ${res.status}`);
    },
  };
}

/** Returns the configured mailer, or null if the configuration is incomplete. */
export function getMailer(): Mailer | null {
  const provider = env.mail.provider ?? (env.isProd ? undefined : 'log');
  if (provider === 'log') {
    if (env.isProd) {
      logEvent('error', 'mail.log-provider-in-production');
      return null;
    }
    return logMailer();
  }
  if (!env.mail.from) return null;
  if (provider === 'smtp' && env.mail.smtp.host) return smtpMailer();
  if (provider === 'resend' && env.mail.resendApiKey) return resendMailer();
  return null;
}

/** Recipient for a form; in development falls back to a placeholder for the log adapter. */
export function recipientFor(form: 'enquiry' | 'careers'): string | null {
  const r = form === 'enquiry' ? env.mail.salesRecipient : env.mail.careersRecipient;
  if (r) return r;
  return env.isProd ? null : `${form}-recipient-not-configured@localhost`;
}
