/**
 * Content-Security-Policy builder (see docs/security.md §6).
 * Runs inside src/proxy.ts, so it must not import server-only modules.
 */
export function buildCsp(nonce: string, opts: { dev: boolean; turnstile: boolean }): string {
  const cf = 'https://challenges.cloudflare.com';
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(opts.turnstile ? [cf] : []), ...(opts.dev ? ["'unsafe-eval'"] : [])],
    // React style attributes cannot carry nonces; scripts stay nonce-bound.
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'media-src': ["'self'"],
    'connect-src': ["'self'", ...(opts.turnstile ? [cf] : []), ...(opts.dev ? ['ws:'] : [])],
    'frame-src': opts.turnstile ? [cf] : ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'manifest-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
  };
  const parts = Object.entries(directives).map(([k, v]) => `${k} ${v.join(' ')}`);
  if (!opts.dev) parts.push('upgrade-insecure-requests');
  return parts.join('; ');
}

/** Static security headers shared by proxy (pages) and next.config (everything else). */
export function baseSecurityHeaders(prod: boolean): [string, string][] {
  const h: [string, string][] = [
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()'],
    ['X-Frame-Options', 'DENY'],
    ['Cross-Origin-Opener-Policy', 'same-origin'],
    ['Cross-Origin-Resource-Policy', 'same-origin'],
  ];
  if (prod) h.push(['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload']);
  return h;
}
