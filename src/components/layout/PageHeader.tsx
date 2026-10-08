import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { href, type RouteKey } from '@/i18n/routes';
import { breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/ui/JsonLd';

/**
 * Compact page header: breadcrumb, title, one lead paragraph. Replaces the legacy
 * full-height photo headers (research/03-design-audit.md).
 */
export function PageHeader({
  locale,
  routeKey,
  title,
  lead,
  children,
  tone = 'paper',
}: {
  locale: Locale;
  routeKey: RouteKey;
  title: string;
  lead?: string;
  children?: ReactNode;
  tone?: 'paper' | 'dark';
}) {
  const d = getDictionary(locale);
  const crumbs = [
    { name: d.nav.home, path: href(locale, 'home') },
    { name: title, path: href(locale, routeKey) },
  ];
  return (
    <header className={`page-head page-head--${tone}`}>
      <div className="container">
        <nav aria-label={d.a11y.breadcrumb} className="crumbs">
          <ol>
            <li>
              <Link href={crumbs[0]!.path}>{crumbs[0]!.name}</Link>
            </li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
        <h1 className="page-head__title">{title}</h1>
        {lead ? <p className="page-head__lead">{lead}</p> : null}
        {children}
      </div>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </header>
  );
}
