import 'server-only';
import { headers } from 'next/headers';
import { env, turnstileEnabled } from '@/lib/env';
import { verifyFormResult } from './result';

/**
 * Per-request values every form needs: CSP nonce, fill-time start, optional Turnstile key.
 * The widget is rendered only when the server can verify it (both keys set). A site key
 * without its secret would show a challenge that is never checked.
 */
export async function formContext() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return { nonce, startedAt: Date.now(), turnstileSiteKey: turnstileEnabled() ? env.turnstile.siteKey : undefined };
}

/** Whether result-page parameters carry a valid, fresh signature of the form endpoints (lib/forms/result.ts). */
export function isConfirmedFormResult(params: { form?: unknown; status?: unknown; t?: unknown; sig?: unknown }): boolean {
  // RATE_LIMIT_SALT as configured, never a fallback: without it nothing is confirmed (SECURITY-001).
  return verifyFormResult(env.forms.resultSecret, params, Date.now() / 1000);
}
