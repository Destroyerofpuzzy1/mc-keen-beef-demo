import { defaultLocale, type Locale, locales } from './config';

/**
 * Route keys map to the Polish folder names under src/app/[locale]/.
 * EN/DE use localised slugs; src/proxy.ts rewrites them onto the Polish folders.
 * Keep this file free of server-only imports: it runs inside the proxy.
 */
export const routes = {
  home: { pl: '', en: '', de: '' },
  products: { pl: 'produkty', en: 'products', de: 'produkte' },
  quality: { pl: 'jakosc', en: 'quality', de: 'qualitaet' },
  certificates: { pl: 'certyfikaty', en: 'certificates', de: 'zertifikate' },
  plants: { pl: 'zaklady', en: 'plants', de: 'standorte' },
  about: { pl: 'o-firmie', en: 'about-us', de: 'ueber-uns' },
  sales: { pl: 'sprzedaz-eksport', en: 'sales-export', de: 'vertrieb-export' },
  careers: { pl: 'kariera', en: 'careers', de: 'karriere' },
  contact: { pl: 'kontakt', en: 'contact', de: 'kontakt' },
  enquiry: { pl: 'zapytaj-o-oferte', en: 'request-a-quote', de: 'angebot-anfragen' },
  biogas: { pl: 'biogazownia', en: 'biogas-plant', de: 'biogasanlage' },
  tax: { pl: 'strategia-podatkowa', en: 'tax-strategy', de: 'steuerstrategie' },
  privacy: { pl: 'polityka-prywatnosci', en: 'privacy-policy', de: 'datenschutz' },
  sent: { pl: 'wyslano', en: 'sent', de: 'gesendet' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

/** Public URL path for a route in a locale. PL has no prefix. */
export function href(locale: Locale, key: RouteKey, hash?: string): string {
  const slug = routes[key][locale];
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const path = slug ? `${prefix}/${slug}` : prefix || '/';
  return hash ? `${path}#${hash}` : path;
}

/** Internal folder for a localised slug, used by the proxy. */
export function folderForSlug(locale: Locale, slug: string): string | null {
  for (const key of Object.keys(routes) as RouteKey[]) {
    if (routes[key][locale] === slug) return routes[key].pl;
  }
  return null;
}

/** Route key for a Polish folder name. */
export function keyForFolder(folder: string): RouteKey | null {
  for (const key of Object.keys(routes) as RouteKey[]) {
    if (routes[key].pl === folder) return key;
  }
  return null;
}

/** All locale variants of a route, used for hreflang and the language switch. */
export function alternates(key: RouteKey): Record<Locale, string> {
  return Object.fromEntries(locales.map((l) => [l, href(l, key)])) as Record<Locale, string>;
}
