import 'server-only';
import { headers } from 'next/headers';
import { env, turnstileEnabled } from '@/lib/env';

/**
 * Per-request values every form needs: CSP nonce, fill-time start, optional Turnstile key.
 * The widget is rendered only when the server can verify it (both keys set). A site key
 * without its secret would show a challenge that is never checked.
 */
export async function formContext() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return { nonce, startedAt: Date.now(), turnstileSiteKey: turnstileEnabled() ? env.turnstile.siteKey : undefined };
}
