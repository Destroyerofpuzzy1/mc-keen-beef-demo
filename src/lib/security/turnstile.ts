import 'server-only';
import { env, turnstileEnabled } from '@/lib/env';

/**
 * Cloudflare Turnstile verification. Only active when both the site key and the
 * secret are configured; otherwise returns true (honeypot + rate limit still apply).
 */
export async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (!token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret: env.turnstile.secret!, response: token, remoteip: ip });
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // fail closed
  }
}
