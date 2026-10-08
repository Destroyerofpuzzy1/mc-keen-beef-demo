'use client';

import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { href, routes, type RouteKey } from '@/i18n/routes';

const labels: Record<Locale, { short: string; full: string }> = {
  pl: { short: 'PL', full: 'Polski' },
  en: { short: 'EN', full: 'English' },
  de: { short: 'DE', full: 'Deutsch' },
};

/** Maps the current public URL to the same page in the other languages. */
function currentKey(pathname: string, locale: Locale): RouteKey {
  const segs = pathname.split('/').filter(Boolean);
  const slug = (locale === 'pl' ? segs[0] : segs[1]) ?? '';
  const key = (Object.keys(routes) as RouteKey[]).find((k) => routes[k][locale] === slug);
  return key ?? 'home';
}

export function LanguageSwitch({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? '/';
  const key = currentKey(pathname, locale);
  return (
    <nav className="lang" aria-label={label}>
      <ul>
        {locales.map((l) => (
          <li key={l}>
            {l === locale ? (
              <span className="lang__item is-current" aria-current="true" title={labels[l].full}>
                {labels[l].short}
              </span>
            ) : (
              <a className="lang__item" href={href(l, key)} hrefLang={l} lang={l} title={labels[l].full}>
                <span aria-hidden="true">{labels[l].short}</span>
                <span className="visually-hidden">{labels[l].full}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
