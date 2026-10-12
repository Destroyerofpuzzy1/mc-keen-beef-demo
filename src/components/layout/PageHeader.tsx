import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { href, type RouteKey } from '@/i18n/routes';
import { breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/ui/JsonLd';

/**
 * Compact page header: breadcrumb, title, one lead paragraph. Replaces the legacy
 * full-height photo headers (research/03-design-audit.md). `motif` (DESIGN-002) is the page's
 * main beef-identity mark (an embroidered patch or the cuts diagram), placed beside the text.
 */
export function PageHeader({
  locale,
  routeKey,
  title,
  lead,
  children,
  motif,
  tone = 'paper',
}: {
  locale: Locale;
  routeKey: RouteKey;
  title: string;
  lead?: string;
  children?: ReactNode;
  motif?: ReactNode;
  tone?: 'paper' | 'dark';
}) {
  const d = getDictionary(locale);
  const crumbs = [
    { name: d.nav.home, path: href(locale, 'home') },
    { name: title, path: href(locale, routeKey) },
  ];
  return (
    <header className={`page-head page-head--${tone}${motif ? ' page-head--motif' : ''}`}>
      <div className="container">
        {motif ? <div className="page-head__motif">{motif}</div> : null}
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
