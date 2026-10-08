import type { MetadataRoute } from 'next';
import { isIndexable, locales } from '@/i18n/config';
import { href, routes, type RouteKey } from '@/i18n/routes';
import { env } from '@/lib/env';

/** Only approved locales are listed; draft translations (EN/DE) stay out until reviewed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const keys = (Object.keys(routes) as RouteKey[]).filter((k) => k !== 'sent');
  const indexable = locales.filter(isIndexable);
  return keys.flatMap((key) =>
    indexable.map((locale) => ({
      url: `${env.siteUrl}${href(locale, key) === '/' ? '' : href(locale, key)}` || env.siteUrl,
      changeFrequency: key === 'certificates' || key === 'careers' ? ('monthly' as const) : ('yearly' as const),
      priority: key === 'home' ? 1 : key === 'products' || key === 'certificates' ? 0.8 : 0.6,
    })),
  );
}
