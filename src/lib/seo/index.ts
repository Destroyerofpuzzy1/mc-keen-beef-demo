import 'server-only';
import type { Metadata } from 'next';
import { isIndexable, locales, ogLocale, type Locale } from '@/i18n/config';
import { href, type RouteKey } from '@/i18n/routes';
import { env } from '@/lib/env';
import assets from '@/content/generated/assets.json';
import { entities, type Entity } from '@/content/entities';
import { company } from '@/content/company';
import type { Job } from '@/content/jobs';

export const absolute = (path: string) => `${env.siteUrl}${path === '/' ? '' : path}` || env.siteUrl;

/**
 * Route-specific Open Graph cards (public/og/<card>-<locale>.jpg, spec in scripts/og/cards.json),
 * composed from existing assets. Other routes use the default herd image.
 */
const OG_CARDS: Partial<Record<RouteKey, 'home' | 'products' | 'quality' | 'careers'>> = {
  home: 'home',
  products: 'products',
  quality: 'quality',
  certificates: 'quality',
  careers: 'careers',
};

export function ogImageFor(key: RouteKey, locale: Locale): { url: string; width: number; height: number } {
  const card = OG_CARDS[key];
  if (card) return { url: absolute(`/og/${card}-${locale}.jpg`), width: 1200, height: 630 };
  const og = assets.images['og-default'];
  return { url: absolute(og.src), width: og.width, height: og.height };
}

/** Metadata for a page: unique title/description, canonical, hreflang, OG, robots. */
export function pageMetadata(
  locale: Locale,
  key: RouteKey,
  { title, description, noindex = false }: { title: string; description: string; noindex?: boolean },
): Metadata {
  const indexable = isIndexable(locale) && !noindex;
  const languages: Record<string, string> = {};
  for (const l of locales) if (isIndexable(l)) languages[l] = absolute(href(l, key));
  if (Object.keys(languages).length > 1) languages['x-default'] = absolute(href('pl', key));

  const og = ogImageFor(key, locale);
  return {
    title,
    description,
    alternates: { canonical: absolute(href(locale, key)), languages: Object.keys(languages).length > 1 ? languages : undefined },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      type: 'website',
      siteName: 'McKeen Beef',
      locale: ogLocale[locale],
      url: absolute(href(locale, key)),
      title,
      description,
      images: [{ url: og.url, width: og.width, height: og.height, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [og.url] },
  };
}

const address = (e: Entity) => {
  const a = e.productionAddress ?? e.registeredAddress;
  return { '@type': 'PostalAddress', streetAddress: a.street, postalCode: a.postalCode, addressLocality: a.city, addressCountry: a.country };
};

/** Organization graph: the group, each legal entity as a member organisation. No ratings or reviews. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${env.siteUrl}/#organization`,
        name: 'MCKEEN-BEEF',
        alternateName: company.brand,
        url: env.siteUrl,
        logo: absolute('/assets/brand/logo.svg'),
        foundingDate: String(company.foundedYear),
        sameAs: [company.facebook],
        subOrganization: entities.map((e) => ({ '@id': `${env.siteUrl}/#${e.id}` })),
      },
      ...entities.map((e) => ({
        '@type': 'Organization',
        '@id': `${env.siteUrl}/#${e.id}`,
        name: e.legalName,
        address: address(e),
        ...(e.taxId.label === 'NIP' ? { taxID: e.taxId.value } : { vatID: e.taxId.value }),
        ...(e.office.phone ? { telephone: e.office.phone } : {}),
        ...(e.office.email ? { email: e.office.email } : {}),
        parentOrganization: { '@id': `${env.siteUrl}/#organization` },
      })),
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absolute(it.path) })),
  };
}

/** JobPosting only with a confirmed publication date (see Job.datePosted); otherwise null. */
export function jobPostingJsonLd(job: Job, locale: Locale, e: Entity) {
  if (!job.datePosted) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title[locale],
    description: `${job.description[locale]} ${job.schedule[locale]}. ${job.benefits.map((b) => b[locale]).join(', ')}.`,
    datePosted: job.datePosted,
    employmentType: 'FULL_TIME',
    hiringOrganization: { '@type': 'Organization', name: e.legalName, sameAs: env.siteUrl },
    jobLocation: { '@type': 'Place', address: address(e) },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'PLN',
      value: {
        '@type': 'QuantitativeValue',
        minValue: Math.min(...job.pay.map((p) => p.min)),
        maxValue: Math.max(...job.pay.map((p) => p.max)),
        unitText: 'MONTH',
      },
    },
    directApply: true,
  };
}

/** Serialises JSON-LD safely for a <script> tag. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
