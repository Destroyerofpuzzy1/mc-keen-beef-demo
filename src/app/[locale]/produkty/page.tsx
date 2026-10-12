import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { contactsFor, salesContacts } from '@/content/contacts';
import { entityById } from '@/content/entities';
import { products, uppz } from '@/content/products';
import { media } from '@/content/media';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductGroups } from '@/components/products/ProductGroups';
import { MailLink, PhoneLink } from '@/components/ui/Contact';
import { Photo } from '@/components/ui/Photo';
import { BrandPatch, CutsDiagram } from '@/components/brand/BrandMarks';

export async function generateMetadata({ params }: PageProps<'/[locale]/produkty'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'products', { title: d.products.title, description: d.products.description });
}

export default async function ProductsPage({ params }: PageProps<'/[locale]/produkty'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const offal = contactsFor('offal-uppz');
  const gmbh = entityById('gmbh');

  return (
    <>
      <PageHeader
        locale={locale}
        routeKey="products"
        title={d.products.title}
        lead={d.products.lead}
        motif={
          <>
            <BrandPatch id="products" motif="steak" size="sm" className="motif--phone" />
            <CutsDiagram plate />
          </>
        }
      >
        <nav className="jump" aria-label={d.products.title}>
          <ul className="plain">
            {products.map((p) => (
              <li key={p.id}>
                <a href={`#${p.id}`}>{t(p.name, locale)}</a>
              </li>
            ))}
            <li>
              <a href="#uppz">{d.products.uppzTitle}</a>
            </li>
          </ul>
        </nav>
      </PageHeader>

      <section className="section" aria-label={d.products.title}>
        <div className="container">
          <ProductGroups locale={locale} variant="catalogue" />
          <p className="note">
            {d.products.pendingNote}
          </p>
        </div>
      </section>

      <section className="section section--paper2" id="uppz" aria-labelledby="uppz-h">
        <div className="container layout-split layout-split--media">
          <div>
            <h2 id="uppz-h" className="h-section">
              {d.products.uppzTitle}
            </h2>
            <p className="lead">{d.products.uppzText}</p>
            <p className="muted">{t(uppz.summary, locale)}</p>
            <ul className="plain stack-s">
              {offal.map((c) => (
                <li key={c.id} className="person">
                  <p className="person__dept">{t(c.department, locale)}</p>
                  <p className="person__name">{c.name}</p>
                  <p className="person__place">{t(entityById(c.entity).place, locale)}</p>
                  <p className="person__links">
                    {c.phone ? <PhoneLink phone={c.phone} /> : null}
                    {c.email ? <MailLink email={c.email} /> : null}
                  </p>
                </li>
              ))}
            </ul>
            <Link href={`${href(locale, 'enquiry')}?produkt=uppz`} className="btn btn--line btn--arrow" data-enquiry="uppz">
              {d.nav.enquiry}
              <span className="visually-hidden">: {t(uppz.name, locale)}</span>
            </Link>
          </div>
          <Photo item={media.carcassInspection} locale={locale} ratio="3 / 2" sizes="(min-width: 64rem) 560px, 100vw" reveal />
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="sales-h">
        <div className="container sales-card-row">
          <div>
            <p className="eyebrow-plain">{t(gmbh.place, locale)}</p>
            <h2 id="sales-h" className="h-section">
              {d.products.salesBoxTitle}
            </h2>
            <p className="lead lead--light">{d.common.specsOnRequest}</p>
            <Link href={href(locale, 'enquiry')} className="btn btn--primary btn--lg btn--arrow" data-enquiry="">
              {d.nav.enquiry}
            </Link>
          </div>
          <ul className="sales-people plain">
            {salesContacts.map((c) => (
              <li key={c.id}>
                <p className="sales-people__name">{c.name}</p>
                <p className="sales-people__role">{t(c.department, locale)}</p>
                <PhoneLink phone={c.phone!} className="clink clink--light" />
                <MailLink email={c.email!} className="clink clink--light" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
