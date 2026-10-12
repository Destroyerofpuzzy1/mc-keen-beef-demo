import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { href } from '@/i18n/routes';
import { entityById } from '@/content/entities';
import { products, type ProductGroup } from '@/content/products';
import { currentCertificates, sitesWithoutCurrentCertificate, standardName, todayIso } from '@/content/certificates';
import { Fragment, type CSSProperties } from 'react';
import { icons, productIcon } from '@/content/media';
import { ProductVisual } from './ProductVisual';
import { formatDate, formatScore } from '@/components/certificates/format';
import { QualityContactLink } from '@/components/certificates/QualityContactLink';
import { CertificateDocumentsLink } from '@/components/certificates/CertificateDocumentsLink';

/**
 * The four product groups as real HTML (replaces the legacy flat image).
 * - `catalogue` (Produkty page): alternating editorial blocks with spec rows.
 * - `overview` (home page): compact four-column overview.
 * Offer links carry `data-enquiry` so the modal opens with the product pre-selected;
 * the href is the no-JS fallback.
 */
export function ProductGroups({ locale, variant = 'overview' }: { locale: Locale; variant?: 'overview' | 'catalogue' }) {
  if (variant === 'catalogue') {
    return (
      <div className="catalogue">
        {products.map((p, i) => (
          <CatalogueBlock key={p.id} product={p} locale={locale} flip={i % 2 === 1} priority={i === 0} />
        ))}
      </div>
    );
  }
  const d = getDictionary(locale);
  return (
    <ul className="poverview plain">
      {products.map((p) => (
        <li key={p.id} className="poverview__item">
          <Link href={`${href(locale, 'products')}#${p.id}`} className="poverview__link">
            <span className="photo poverview__photo" style={{ '--ratio': '3 / 2' } as CSSProperties}>
              <ProductVisual id={p.id} locale={locale} sizes="(min-width: 64rem) 22vw, (min-width: 40rem) 45vw, 100vw" decorative />
            </span>
            <h3 className="poverview__name">{t(p.name, locale)}</h3>
          </Link>
          <p className="poverview__summary">{t(p.summary, locale)}</p>
          <Link href={`${href(locale, 'enquiry')}?produkt=${p.id}`} className="arrow-link" data-enquiry={p.id}>
            {d.nav.enquiry}
            <span className="visually-hidden">: {t(p.name, locale)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CatalogueBlock({ product: p, locale, flip, priority }: { product: ProductGroup; locale: Locale; flip: boolean; priority: boolean }) {
  const d = getDictionary(locale);
  const today = todayIso();
  const certs = currentCertificates(today).filter((c) => p.sites.includes(c.entity));
  // Certificates belong to a plant: one line per certificate with its own validity, then the plant.
  const certPlants = [...new Set(certs.map((c) => c.entity))];
  // Plants of this product whose current certificate is not published (as on Certyfikaty and
  // Zakłady): the same neutral sentence and the way to their quality department (UXA-03).
  const pendingPlants = sitesWithoutCurrentCertificate(today).filter((s) => p.sites.includes(s));
  return (
    <article className={`cblock${flip ? ' cblock--flip' : ''}`} id={p.id} aria-labelledby={`${p.id}-h`}>
      <figure className={`photo cblock__photo${priority ? '' : ' photo--reveal'}`} style={{ '--ratio': '660 / 280' } as CSSProperties}>
        <ProductVisual id={p.id} locale={locale} sizes="(min-width: 64rem) 560px, 100vw" priority={priority} />
      </figure>
      <div className="cblock__body">
        <h2 id={`${p.id}-h`} className="cblock__name">
          <span className="cat-icon" aria-hidden="true" style={{ '--icon': `url(${icons[productIcon[p.id]]})` } as CSSProperties} />
          {t(p.name, locale)}
        </h2>
        <p className="cblock__summary">{t(p.summary, locale)}</p>
        <dl className="specs">
          {p.facts.map((f, i) => (
            <div key={i} className="specs__row">
              <dt>{t(f.label, locale)}</dt>
              <dd>
                {t(f.value, locale)}
                {f.site && p.sites.length > 1 ? (
                  <span className="specs__site">
                    {d.common.appliesTo}: {t(entityById(f.site).place, locale)}
                  </span>
                ) : null}
                <span className="specs__src">
                  {d.common.source}: {t(f.source, locale)}
                </span>
              </dd>
            </div>
          ))}
          <div className="specs__row">
            <dt>{d.common.producedAt}</dt>
            <dd>
              {p.sites.map((s, i) => (
                <span key={s}>
                  {i ? ', ' : ''}
                  <Link href={`${href(locale, 'plants')}#${entityById(s).anchor}`}>{t(entityById(s).place, locale)}</Link>
                </span>
              ))}
            </dd>
          </div>
          {certs.length || pendingPlants.length ? (
            <div className="specs__row">
              <dt>{d.nav.certificates}</dt>
              <dd>
                {pendingPlants.map((plant) => (
                  <Fragment key={plant}>
                    {d.cert.noCurrent}
                    <br />
                    <QualityContactLink locale={locale} />
                    <span className="specs__src">{t(entityById(plant).place, locale)}</span>
                  </Fragment>
                ))}
                {certPlants.map((plant) => (
                  <Fragment key={plant}>
                    <ul className="plain">
                      {certs
                        .filter((c) => c.entity === plant)
                        .map((c) => (
                          <li key={c.id}>
                            {t(standardName[c.standard], locale)} {c.score ? formatScore(c.score, locale) : c.result},{' '}
                            <span className="specs__validity">
                              {d.common.validUntil} <span className="tnum">{formatDate(c.expiresOn, locale)}</span>
                            </span>
                          </li>
                        ))}
                    </ul>
                    {/* UXA-05 stage 2: the plant's documents, in the place where Linne products have the
                        quality link (UXA-03). */}
                    <CertificateDocumentsLink locale={locale} entity={plant} />
                    <span className="specs__src">{t(entityById(plant).place, locale)}</span>
                  </Fragment>
                ))}
              </dd>
            </div>
          ) : null}
          {p.facts.length === 0 ? (
            <div className="specs__row">
              <dt>{d.common.specs}</dt>
              <dd className="muted">{d.common.specsOnRequest}</dd>
            </div>
          ) : null}
        </dl>
        <div className="cblock__actions">
          <Link href={`${href(locale, 'enquiry')}?produkt=${p.id}`} className="btn btn--primary btn--arrow" data-enquiry={p.id}>
            {d.nav.enquiry}
            <span className="visually-hidden">: {t(p.name, locale)}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
