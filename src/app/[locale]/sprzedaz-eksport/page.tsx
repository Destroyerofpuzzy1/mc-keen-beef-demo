import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { media } from '@/content/media';
import { contactsFor, salesContacts } from '@/content/contacts';
import { entityById } from '@/content/entities';
import { PageHeader } from '@/components/layout/PageHeader';
import { EntityLegal } from '@/components/contacts/EntityCard';
import { MailLink, PhoneLink } from '@/components/ui/Contact';
import { Photo } from '@/components/ui/Photo';
import { MarketsLedger } from '@/components/sections/MarketsLedger';
import { BrandIcon, BrandPatch } from '@/components/brand/BrandMarks';

export async function generateMetadata({ params }: PageProps<'/[locale]/sprzedaz-eksport'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'sales', { title: d.sales.title, description: d.sales.description });
}

export default async function SalesPage({ params }: PageProps<'/[locale]/sprzedaz-eksport'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const s = d.sales;
  const gmbh = entityById('gmbh');
  const transport = contactsFor('transport');

  return (
    <>
      <PageHeader
        locale={locale}
        routeKey="sales"
        title={s.title}
        lead={s.lead}
        motif={<BrandPatch id="sales" motif="truck" bottom={d.nav.sales.toUpperCase()} />}
      />

      <section className="wide-photo">
        <Photo item={media.truck} locale={locale} ratio="21 / 8" sizes="100vw" priority quality={80} />
      </section>

      <section className="section" aria-labelledby="mk-h">
        <div className="container layout-split">
          <div>
            <BrandIcon name="globe" className="section-icon" />
            <h2 id="mk-h" className="h-section">
              {s.marketsTitle}
            </h2>
            <p className="lead">{s.marketsText}</p>
            <MarketsLedger locale={locale} />
          </div>
          <div>
            <BrandIcon name="truck" className="section-icon" />
            <h2 className="h-section">{s.logisticsTitle}</h2>
            <ul className="ticks ticks--check">
              {s.logistics.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <ul className="plain stack-s logistics-contacts">
              {transport.map((c) => (
                <li key={c.id} className="person">
                  <p className="person__dept">{t(c.department, locale)}</p>
                  <p className="person__name">{c.name}</p>
                  <p className="person__links">
                    {c.phone ? <PhoneLink phone={c.phone} /> : null}
                    {c.email ? <MailLink email={c.email} /> : null}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="team-h">
        <div className="container layout-split">
          <div>
            <p className="eyebrow-plain">{t(gmbh.role, locale)}</p>
            <h2 id="team-h" className="h-section">
              {gmbh.legalName}
            </h2>
            <EntityLegal entity={gmbh} locale={locale} />
          </div>
          <div className="sales-card sales-card--dark">
            <h3 className="sales-card__title">{s.teamTitle}</h3>
            <ul className="plain sales-card__people">
              {salesContacts.map((c) => (
                <li key={c.id}>
                  <p className="person__name">{c.name}</p>
                  <PhoneLink phone={c.phone!} className="clink clink--light" />
                  <MailLink email={c.email!} className="clink clink--light" />
                </li>
              ))}
            </ul>
            <Link href={href(locale, 'enquiry')} className="btn btn--primary btn--block" data-enquiry="">
              {d.nav.enquiry}
            </Link>
            {/* UXA-05 stage 3: the assortment as the secondary step after the enquiry (the dark-surface
                button of the home sales panel); each product there leads on to an enquiry. */}
            <p className="link-row">
              <Link href={href(locale, 'products')} className="btn btn--ghost-light btn--arrow">
                {d.nav.products}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
