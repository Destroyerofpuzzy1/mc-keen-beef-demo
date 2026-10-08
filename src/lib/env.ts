import 'server-only';

/**
 * Server-side configuration. Never import this from a client component.
 * Only NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_TURNSTILE_SITE_KEY are public by design.
 */
const str = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export const env = {
  isProd: process.env.NODE_ENV === 'production',
  siteUrl: (str(process.env.NEXT_PUBLIC_SITE_URL) ?? 'http://localhost:3000').replace(/\/$/, ''),

  mail: {
    /** 'smtp' | 'resend' | 'log'. Defaults to 'log' in development only. */
    provider: str(process.env.MAIL_PROVIDER),
    from: str(process.env.FORM_FROM_EMAIL),
    salesRecipient: str(process.env.SALES_FORM_RECIPIENT),
    careersRecipient: str(process.env.CAREERS_FORM_RECIPIENT),
    smtp: {
      host: str(process.env.SMTP_HOST),
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      user: str(process.env.SMTP_USER),
      pass: str(process.env.SMTP_PASSWORD),
    },
    resendApiKey: str(process.env.RESEND_API_KEY),
  },

  rateLimit: {
    upstashUrl: str(process.env.UPSTASH_REDIS_REST_URL),
    upstashToken: str(process.env.UPSTASH_REDIS_REST_TOKEN),
    salt: str(process.env.RATE_LIMIT_SALT) ?? 'dev-only-salt',
  },

  turnstile: {
    siteKey: str(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
    secret: str(process.env.TURNSTILE_SECRET_KEY),
  },
};

export const turnstileEnabled = () => Boolean(env.turnstile.siteKey && env.turnstile.secret);

/**
 * Production configuration problems, reported once per process by the form endpoints
 * (never thrown: `next build` also runs with NODE_ENV=production and no secrets).
 */
export function configWarnings(): string[] {
  if (!env.isProd) return [];
  const w: string[] = [];
  if (!process.env.NEXT_PUBLIC_SITE_URL?.trim()) w.push('NEXT_PUBLIC_SITE_URL missing: canonical URLs and the same-origin check fall back to http://localhost:3000');
  else if (!env.siteUrl.startsWith('https://')) w.push('NEXT_PUBLIC_SITE_URL is not https');
  if (Boolean(env.turnstile.siteKey) !== Boolean(env.turnstile.secret)) w.push('Turnstile half-configured: set both NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY or neither (challenge disabled)');
  if (!process.env.RATE_LIMIT_SALT?.trim()) w.push('RATE_LIMIT_SALT missing: using the development salt');
  return w;
}
