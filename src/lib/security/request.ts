import 'server-only';
import { createHash } from 'node:crypto';
import { env } from '@/lib/env';

/**
 * Same-origin check for form endpoints. Accepts the request when Origin matches the
 * site origin (or the request's own host in development); falls back to
 * Sec-Fetch-Site / Referer when Origin is absent. No CORS headers are ever sent.
 */
export function isSameOrigin(req: Request): boolean {
  const allowed = new Set<string>([env.siteUrl]);
  const host = req.headers.get('host');
  if (!env.isProd && host) {
    allowed.add(`http://${host}`);
    allowed.add(`https://${host}`);
  }
  const origin = req.headers.get('origin');
  if (origin) return allowed.has(origin);

  const fetchSite = req.headers.get('sec-fetch-site');
  if (fetchSite) return fetchSite === 'same-origin';

  const referer = req.headers.get('referer');
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return false;
}

/** Client IP as reported by the hosting proxy. Used only in hashed form. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/** Salted SHA-256 of the client IP; the raw IP is never stored or logged. */
export function clientKey(req: Request): string {
  return createHash('sha256').update(`${env.rateLimit.salt}:${clientIp(req)}`).digest('hex').slice(0, 32);
}

/** Reads Content-Length and enforces an upper bound before the body is parsed. */
export function contentLengthWithin(req: Request, max: number): boolean {
  const raw = req.headers.get('content-length');
  if (!raw) return false;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= max;
}

export function wantsJson(req: Request): boolean {
  return (req.headers.get('accept') ?? '').includes('application/json');
}
