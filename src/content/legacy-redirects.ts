import { href, type RouteKey } from '../i18n/routes';
import type { Locale } from '../i18n/config';
import { certificates } from './certificates';

/**
 * Legacy URLs of http://www.mckeen-beef.eu (research/05-current-sitemap.md).
 * Consumed by next.config.ts → redirects() as permanent (308) redirects.
 * Unknown legacy URLs are NOT redirected to the homepage; they return 404.
 */
const pages: [string, Locale, RouteKey][] = [
  // PL
  ['/html', 'pl', 'home'],
  ['/p/index', 'pl', 'home'],
  ['/p/o-firmie', 'pl', 'about'],
  ['/p/katalog', 'pl', 'products'],
  ['/p/jakosc', 'pl', 'quality'],
  ['/p/certyfikaty', 'pl', 'certificates'],
  ['/p/kariera', 'pl', 'careers'],
  ['/p/kontakt', 'pl', 'contact'],
  ['/p/biogazownia', 'pl', 'biogas'],
  ['/p/rodo', 'pl', 'privacy'],
  ['/p/strategia_podatkowa_2023_sh', 'pl', 'tax'],
  ['/p/strategia_podatkowa_2023_cp', 'pl', 'tax'],
  // EN
  ['/en/p', 'en', 'home'],
  ['/en/p/index', 'en', 'home'],
  ['/en/p/about-us', 'en', 'about'],
  ['/en/p/catalog', 'en', 'products'],
  ['/en/p/quality', 'en', 'quality'],
  ['/en/p/certificates', 'en', 'certificates'],
  ['/en/p/career', 'en', 'careers'],
  ['/en/p/contact', 'en', 'contact'],
  ['/en/p/rodo', 'en', 'privacy'],
  ['/en/p/certyfikaty', 'en', 'certificates'],
  ['/en/p/jakosc', 'en', 'quality'],
  ['/en/p/kontakt', 'en', 'contact'],
  // DE
  ['/de/p', 'de', 'home'],
  ['/de/p/index', 'de', 'home'],
  ['/de/p/uber-uns', 'de', 'about'],
  ['/de/p/kataloge', 'de', 'products'],
  ['/de/p/qualitat', 'de', 'quality'],
  ['/de/p/zertifikate', 'de', 'certificates'],
  ['/de/p/karriere', 'de', 'careers'],
  ['/de/p/kontakt', 'de', 'contact'],
  ['/de/p/rodo', 'de', 'privacy'],
  ['/de/p/certyfikaty', 'de', 'certificates'],
  ['/de/p/jakosc', 'de', 'quality'],
];

export function legacyRedirects(): { source: string; destination: string; permanent: true }[] {
  const out = pages.map(([source, locale, key]) => ({ source, destination: href(locale, key), permanent: true as const }));
  for (const c of certificates) {
    for (const f of c.files) {
      for (const legacy of f.legacy) {
        out.push({ source: `/html/${legacy}`, destination: f.path, permanent: true });
      }
    }
  }
  return out;
}
