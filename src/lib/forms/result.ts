import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signed form result for the no-JavaScript result page (GAP-14, UXA-02).
 *
 * Without JavaScript a form post ends in a 303 redirect to `/wyslano?form=…&status=…`. A bare
 * `status` parameter can be typed by anyone, so the page must not claim a success (or a failure)
 * on its strength alone. The form endpoints therefore add the time `t` and an HMAC `sig` over
 * form, status and time. The result page states the outcome only for a valid, fresh signature and
 * otherwise says that it cannot confirm the result. The signature does not cover the language, so
 * the language switch can carry the same parameters to `/en/sent` and `/de/gesendet`.
 *
 * Fail closed (SECURITY-001): only a real secret of at least `MIN_SECRET_LENGTH` characters can
 * sign or confirm anything. Without one, `signFormResult` returns null (the redirect carries no
 * signature) and `verifyFormResult` is always false (the page stays neutral), in every
 * environment. Callers pass `RATE_LIMIT_SALT` as it is configured, never a fallback value.
 *
 * Pure apart from `node:crypto` (no path aliases), so `node --test` can import it directly.
 */

/** How long a signed result stays confirmable (refresh, language switch, back button). */
export const RESULT_MAX_AGE_S = 60 * 60;
/** Shortest secret accepted, as required by the deployment checklist ("random 32+ byte value"). */
export const MIN_SECRET_LENGTH = 32;
/** Tolerated clock difference for a time stamp from the future. */
const FUTURE_SKEW_S = 60;
const PURPOSE = 'mckeen-beef:form-result:v1';

export interface SignedResult {
  t: string;
  sig: string;
}

/** Whether `secret` may key result signatures: a string of at least `MIN_SECRET_LENGTH` characters. */
export function isUsableResultSecret(secret: unknown): secret is string {
  return typeof secret === 'string' && secret.trim().length >= MIN_SECRET_LENGTH;
}

function keyFrom(secret: string): Buffer {
  // A dedicated key derived from the server secret, so the signature cannot be reused elsewhere.
  return createHmac('sha256', secret).update(PURPOSE).digest();
}

function mac(secret: string, form: string, status: string, t: string): string {
  return createHmac('sha256', keyFrom(secret)).update(`${form}|${status}|${t}`).digest('base64url').slice(0, 22);
}

/** Parameters to append to the result-page redirect, or null without a usable secret. `nowS` is in seconds. */
export function signFormResult(secret: string | null | undefined, form: string, status: string, nowS: number): SignedResult | null {
  if (!isUsableResultSecret(secret)) return null;
  const t = String(Math.floor(nowS));
  return { t, sig: mac(secret, form, status, t) };
}

/**
 * True only for a signature made by `signFormResult` with this secret, at most `RESULT_MAX_AGE_S`
 * old. Always false without a usable secret.
 */
export function verifyFormResult(
  secret: string | null | undefined,
  params: { form?: unknown; status?: unknown; t?: unknown; sig?: unknown },
  nowS: number,
): boolean {
  if (!isUsableResultSecret(secret)) return false;
  const { form, status, t, sig } = params;
  if (typeof form !== 'string' || typeof status !== 'string' || typeof t !== 'string' || typeof sig !== 'string') return false;
  if (!/^\d{1,12}$/.test(t) || !/^[\w-]{22}$/.test(sig)) return false;
  const age = nowS - Number(t);
  if (age > RESULT_MAX_AGE_S || age < -FUTURE_SKEW_S) return false;
  const expected = Buffer.from(mac(secret, form, status, t));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
