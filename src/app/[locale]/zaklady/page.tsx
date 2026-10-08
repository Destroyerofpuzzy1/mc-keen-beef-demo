import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { entities, type EntityId } from '@/content/entities';
import { entityProfiles } from '@/content/plants';
import { products, uppz } from '@/content/products';
import { currentCertificates, standardName, todayIso } from '@/content/certificates';
import { media, type MediaKey } from '@/content/media';
import { PageHeader } from '@/components/layout/PageHeader';
import { EntityCard } from '@/components/contacts/EntityCard';
import { Photo } from '@/components/ui/Photo';
import { formatDate, formatScore } from '@/components/certificates/format';

export async function generateMetadata({ params }: PageProps<'/[locale]/zaklady'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'plants', { title: d.plants.title, description: d.plants.description });
}

/** Photo per company: matched to what the company does. */
const entityPhoto: Record<EntityId, MediaKey> = {
  centrala: 'staffBeef',
  sh: 'carcassInspection',
  sh2: 'herefordBull',
  cp: 'butcherCutting',
  gmbh: 'truck',
};

export default async function PlantsPage({ params }: PageProps<'/[locale]/zaklady'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const today = todayIso();
  const current = currentCertificates(today);
  const order: EntityId[] = ['sh', 'sh2', 'cp', 'gmbh', 'centrala'];

  return (
    <>
      <PageHeader locale={locale} routeKey="plants" title={d.plants.title} lead={d.plants.lead} />

      <section className="section section--tight" aria-labelledby="struct-h">
        <div className="container">
          <h2 id="struct-h" className="h-section">
            {d.plants.structureTitle}
          </h2>
          <ol className="structure plain">
            {order.map((id) => {
              const e = entities.find((x) => x.id === id)!;
              const profile = entityProfiles.find((p) => p.entity === id)!;
              return (
                <li key={id} className="structure__item">
                  <a href={`#${e.anchor}`} className="structure__link">
                    <span className="structure__role">{t(e.role, locale)}</span>
                    <span className="structure__activity">{t(profile.activity, locale)}</span>
                    <span className="structure__place">{(e.productionAddress ?? e.registeredAddress).locality ?? (e.productionAddress ?? e.registeredAddress).city}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="section section--flush-top" aria-labelledby="sites-h">
        <div className="container">
          <h2 id="sites-h" className="visually-hidden">
            {d.plants.sitesTitle}
          </h2>
          <div className="facilities">
            {order.map((id, i) => {
              const e = entities.find((x) => x.id === id)!;
              const profile = entityProfiles.find((p) => p.entity === id)!;
              const made = [...products, uppz].filter((p) => p.sites.includes(id));
              const certs = current.filter((c) => c.entity === id);
              const showsCertStatus = id === 'sh' || id === 'sh2' || id === 'cp';
              return (
                <div key={id} className={`facility${i % 2 ? ' facility--flip' : ''}`}>
                  <Photo
                    item={media[entityPhoto[id]]}
                    locale={locale}
                    className="facility__photo"
                    sizes="(min-width: 64rem) 45vw, 100vw"
                    reveal
                  />
                  <EntityCard entity={e} locale={locale} headingLevel={3}>
                    <p className="facility__activity">{t(profile.activity, locale)}</p>
                    {profile.details.length ? (
                      <ul className="ticks facility__details">
                        {profile.details.map((x) => (
                          <li key={x.pl}>{t(x, locale)}</li>
                        ))}
                      </ul>
                    ) : null}
                    {made.length ? (
                      <p className="facility__meta">
                        <span className="facility__label">{d.nav.products}:</span>{' '}
                        {made.map((p, j) => (
                          <span key={p.id}>
                            {j ? ', ' : ''}
                            <Link href={`${href(locale, 'products')}#${p.id}`}>{t(p.name, locale)}</Link>
                          </span>
                        ))}
                      </p>
                    ) : null}
                    {showsCertStatus ? (
                      <p className="facility__meta">
                        <span className="facility__label">{d.nav.certificates}:</span>{' '}
                        {certs.length ? (
                          certs.map((c, j) => (
                            <span key={c.id}>
                              {j ? ', ' : ''}
                              {t(standardName[c.standard], locale)} {c.result}
                              {c.score ? ` ${formatScore(c.score, locale)}` : ''} ({d.common.validUntil} <span className="tnum">{formatDate(c.expiresOn, locale)}</span>)
                            </span>
                          ))
                        ) : (
                          <>
                            {d.cert.noCurrent}
                          </>
                        )}
                      </p>
                    ) : null}
                  </EntityCard>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cold chain: refrigerated trailer (no photo of the cold store exists yet). */}
      <section className="section section--paper2" id="mroznia" aria-labelledby="cold-h">
        <div className="container cold">
          <Photo item={media.truckTrailer} locale={locale} ratio="4 / 3" sizes="(min-width: 64rem) 48vw, 100vw" className="cold__photo" reveal />
          <div className="cold__body">
            <h2 id="cold-h" className="h-section">
              {d.plants.coldTitle}
            </h2>
            <p className="lead">{d.plants.coldText}</p>
            <Link href={href(locale, 'sales')} className="btn btn--line btn--arrow">
              {d.nav.sales}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
