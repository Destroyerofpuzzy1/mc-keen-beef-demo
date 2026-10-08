import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, type Locale } from './i18n/config';
import { folderForSlug, href, keyForFolder, routes } from './i18n/routes';
import { buildCsp } from './lib/security/csp';

/**
 * Next.js 16 proxy (formerly middleware). Responsibilities:
 * 1. Canonical PL URLs without prefix (/pl/... → 308 → /...).
 * 2. Rewrite public URLs (PL folders, localised EN/DE slugs) onto app/[locale]/<folder>.
 * 3. Per-request CSP nonce (docs/security.md §6).
 * Static security headers are set in next.config.ts for every response.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = '/' + segments.slice(1).join('/');
    return NextResponse.redirect(url, 308);
  }

  let locale: Locale = defaultLocale;
  let rest = segments;
  if (segments[0] === 'en' || segments[0] === 'de') {
    locale = segments[0];
    rest = segments.slice(1);
  }

  let target = `/${locale}`;
  if (rest.length > 0) {
    const folder = folderForSlug(locale, rest[0]!);
    if (folder !== null) {
      target = ['', locale, folder, ...rest.slice(1)].join('/');
    } else {
      // A Polish folder name used under EN/DE → redirect to the localised slug.
      const key = locale !== defaultLocale ? keyForFolder(rest[0]!) : null;
      if (key && routes[key][locale] !== rest[0] && rest.length === 1) {
        const url = request.nextUrl.clone();
        url.pathname = href(locale, key);
        return NextResponse.redirect(url, 308);
      }
      // Unknown path: rendered by app/[locale]/[...rest] → notFound() → 404.
      target = ['', locale, ...rest].join('/');
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce, {
    dev: process.env.NODE_ENV === 'development',
    // Same rule as turnstileEnabled(): both keys or no challenge at all.
    turnstile: Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() && process.env.TURNSTILE_SECRET_KEY?.trim()),
  });

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('Content-Security-Policy', csp);

  const url = request.nextUrl.clone();
  url.pathname = target;
  url.search = search;
  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    // Pages only. Skips API routes, Next internals, every public folder (assets, photos,
    // documents) and any request for a file with an extension (robots.txt, icon.svg, …).
    '/((?!api/|_next/|assets/|photos/|documents/|.*\\.[a-zA-Z0-9]{2,5}$).*)',
  ],
};
