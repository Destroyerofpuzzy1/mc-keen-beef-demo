'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';
import { href, routes, type RouteKey } from '@/i18n/routes';
import { languageSwitchSuffix } from '@/i18n/language-switch';

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

type SwitchProps = { locale: Locale; label: string };
type Context = { search: string; hash: string; onIntent?: () => void };

function Links({ locale, label, search, hash, onIntent }: SwitchProps & Context) {
  const pathname = usePathname() ?? '/';
  const key = currentKey(pathname, locale);
  const suffix = languageSwitchSuffix(key, search, hash);
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
              <a
                className="lang__item"
                href={href(l, key) + suffix}
                hrefLang={l}
                lang={l}
                title={labels[l].full}
                onPointerEnter={onIntent}
                onPointerDown={onIntent}
                onFocus={onIntent}
              >
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

/**
 * With JavaScript: the live query (also after `history.replaceState`, e.g. a chosen contact
 * topic) and the current anchor. The anchor is read again on hover, touch and focus, so an
 * in-page jump that did not fire `hashchange` is picked up before the click.
 */
function ContextLinks(props: SwitchProps) {
  const search = useSearchParams()?.toString() ?? '';
  const [hash, setHash] = useState('');
  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  return <Links {...props} search={search} hash={hash} onIntent={() => setHash(window.location.hash)} />;
}

/**
 * The links keep the page's context (UXA-02). `useSearchParams` suspends during server rendering,
 * so the server-rendered links (what a browser without JavaScript keeps) come from the request's
 * query, passed down from the layout (`x-search`, set by src/proxy.ts). JavaScript then swaps in
 * the live version.
 */
export function LanguageSwitch({ serverSearch, ...props }: SwitchProps & { serverSearch: string }) {
  return (
    <Suspense fallback={<Links {...props} search={serverSearch} hash="" />}>
      <ContextLinks {...props} />
    </Suspense>
  );
}
