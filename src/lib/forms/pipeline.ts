import 'server-only';
import { hasLocale, type Locale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { configWarnings, env } from '@/lib/env';
import { rateLimit, type LimitOptions } from '@/lib/rate-limit';
import { clientIp, clientKey, contentLengthWithin, isSameOrigin, wantsJson } from '@/lib/security/request';
import { logEvent, newId } from '@/lib/security/log';
import { verifyTurnstile } from '@/lib/security/turnstile';
import type { FieldErrorCode } from '@/lib/validation/forms';
import { checkFormSession } from './session';

export type FormName = 'enquiry' | 'careers';
/**
 * `expired` and `tooFast` are recoverable: nothing was delivered, the client keeps the data,
 * takes the fresh `startedAt` (if any) and the person sends again.
 */
export type Outcome = 'ok' | 'invalid' | 'rate' | 'unavailable' | 'error' | 'forbidden' | 'expired' | 'tooFast';

const STATUS: Record<Outcome, number> = {
  ok: 200,
  invalid: 400,
  rate: 429,
  unavailable: 503,
  error: 500,
  forbidden: 403,
  expired: 409,
  tooFast: 409,
};

const noStore = { 'Cache-Control': 'no-store' };

/** JSON for fetch clients, 303 redirect to the result page for no-JS submissions. */
export function respond(
  req: Request,
  form: FormName,
  locale: Locale,
  outcome: Outcome,
  extra: { errors?: Record<string, FieldErrorCode>; id?: string; retryAfter?: number; startedAt?: number } = {},
): Response {
  const headers: Record<string, string> = { ...noStore };
  if (extra.retryAfter) headers['Retry-After'] = String(extra.retryAfter);
  if (wantsJson(req)) {
    return Response.json(
      { ok: outcome === 'ok', outcome, errors: extra.errors, id: extra.id, startedAt: extra.startedAt },
      { status: STATUS[outcome], headers },
    );
  }
  const url = new URL(href(locale, 'sent'), env.siteUrl);
  url.searchParams.set('form', form);
  url.searchParams.set('status', outcome);
  return new Response(null, { status: 303, headers: { ...headers, Location: url.pathname + url.search } });
}

interface GuardOptions {
  form: FormName;
  maxBytes: number;
  limit: LimitOptions;
}

export type Guarded =
  | { ok: true; fd: FormData; locale: Locale; id: string; ip: string }
  | { ok: false; response: Response };

/**
 * Ordered checks shared by both form endpoints (docs/security.md §2):
 * method/type → size → same-origin → rate limit → parse → honeypot → session timing → Turnstile.
 */
let configChecked = false;

export async function guardFormRequest(req: Request, opts: GuardOptions): Promise<Guarded> {
  if (!configChecked) {
    configChecked = true;
    for (const message of configWarnings()) logEvent('error', 'config.invalid', { message });
  }
  const id = newId();
  const fallbackLocale: Locale = 'pl';
  const fail = (outcome: Outcome, reason: string, extra: Parameters<typeof respond>[4] = {}, locale: Locale = fallbackLocale) => {
    logEvent(outcome === 'error' ? 'error' : 'warn', `form.${opts.form}.rejected`, { id, reason });
    return { ok: false as const, response: respond(req, opts.form, locale, outcome, { ...extra, id }) };
  };

  const type = (req.headers.get('content-type') ?? '').toLowerCase();
  if (!type.startsWith('multipart/form-data') && !type.startsWith('application/x-www-form-urlencoded')) {
    return { ok: false, response: new Response('Unsupported Media Type', { status: 415, headers: noStore }) };
  }
  if (!contentLengthWithin(req, opts.maxBytes)) {
    return { ok: false, response: new Response('Payload Too Large', { status: 413, headers: noStore }) };
  }
  if (!isSameOrigin(req)) return fail('forbidden', 'origin');

  const key = clientKey(req);
  const rl = await rateLimit(opts.form, key, opts.limit);
  if (!rl.ok) return fail('rate', rl.degraded ? 'rate-backend' : 'rate', { retryAfter: rl.retryAfterSec });

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return fail('invalid', 'parse');
  }

  const rawLocale = String(fd.get('locale') ?? 'pl');
  const locale: Locale = hasLocale(rawLocale) ? rawLocale : fallbackLocale;

  // Honeypot: bots get a fake success so they learn nothing.
  // Fill time: never a fake success. An expired or very fast (autofill) session is answered
  // with a recoverable outcome so a real person can send again without retyping.
  const session = checkFormSession({ honeypot: fd.get('website'), startedAt: fd.get('startedAt'), now: Date.now() });
  if (session.kind === 'bot') {
    logEvent('warn', `form.${opts.form}.bot-suspected`, { id, reason: 'honeypot' });
    return { ok: false, response: respond(req, opts.form, locale, 'ok', { id }) };
  }
  if (session.kind !== 'ok') {
    logEvent('warn', `form.${opts.form}.session-${session.kind}`, { id });
    return { ok: false, response: respond(req, opts.form, locale, session.kind, { id, startedAt: session.startedAt }) };
  }

  const ip = clientIp(req);
  const token = fd.get('cf-turnstile-response');
  if (!(await verifyTurnstile(typeof token === 'string' ? token : null, ip))) return fail('invalid', 'turnstile', {}, locale);

  return { ok: true, fd, locale, id, ip };
}
