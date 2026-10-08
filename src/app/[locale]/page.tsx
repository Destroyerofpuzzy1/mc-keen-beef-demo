import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { company } from '@/content/company';
import { entities } from '@/content/entities';
import { currentCertificates, todayIso } from '@/content/certificates';
import { primarySalesPhone, salesContacts } from '@/content/contacts';
import { environmentFacts } from '@/content/environment';
import { media } from '@/content/media';
import { uppz } from '@/content/products';
import { ProductTiles } from '@/components/products/ProductTiles';
import { ProductionChain } from '@/components/sections/ProductionChain';
import { MarketsLedger } from '@/components/sections/MarketsLedger';
import { CertificateLabel } from '@/components/certificates/CertificateStatus';
import { formatDate, formatScore } from '@/components/certificates/format';
import { MailLink, PhoneLink } from '@/components/ui/Contact';
import { Photo } from '@/components/ui/Photo';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return { ...pageMetadata(locale, 'home', { title: d.home.title, description: d.home.description }), title: { absolute: d.home.title } };
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const h = d.home;
  const today = todayIso();
  const current = currentCertificates(today);
  const brc = current.find((c) => c.standard === 'brcgs');
  const ifs = current.find((c) => c.standard === 'ifs-food');
  const vetCount = entities.filter((e) => e.vetNumber).length;
  const office = entities.find((e) => e.id === 'gmbh')!.office.email!;
  const hero = media.heroHerd;

  return (
    <>
      {/* Hero: editorial asymmetry, photo ~62% of the field, slanted oxblood panel. */}
      <section className="hero" aria-labelledby="hero-h">
        <div className="hero__media">
          <Image
            src={hero.src}
            alt={t(hero.alt, locale)}
            fill
            priority
            fetchPriority="high"
            sizes="(min-width: 64rem) 64vw, 100vw"
            quality={80}
            style={{ objectPosition: hero.position }}
          />
        </div>
        <div className="hero__panel">
          <div className="hero__inner">
            <p className="hero__label">{h.heroLabel}</p>
            <h1 id="hero-h" className="hero__title">
              {h.heroTitle}
            </h1>
            <p className="hero__sub">{h.heroSub}</p>
            <p className="hero__lead">{h.heroLead}</p>
            <div className="hero__actions">
              <Link href={href(locale, 'enquiry')} className="btn btn--primary btn--lg btn--arrow" data-enquiry="">
                {d.nav.enquiry}
              </Link>
              <Link href={href(locale, 'products')} className="btn btn--ghost-light btn--lg">
                {h.ctaProducts}
              </Link>
            </div>
            <p className="hero__sales">
              <span>{d.common.salesDept}</span>
              <PhoneLink phone={primarySalesPhone} className="clink clink--light" />
            </p>
          </div>
        </div>
      </section>

      {/* Proof strip: every number carries its meaning and scope. */}
      <section className="trust" aria-label={h.certTitle}>
        <div className="container">
          <ul className="trust__list plain">
            <li className="trust__item">
              <span className="trust__value tnum">{company.foundedYear}</span>
              <span className="trust__label">{h.trustSince}</span>
              <span className="trust__scope">Lisków</span>
            </li>
            {brc ? (
              <li className="trust__item">
                <span className="trust__value tnum">{brc.result}</span>
                <span className="trust__label">
                  BRCGS Food Safety, {d.common.validUntil} <span className="tnum">{formatDate(brc.expiresOn, locale)}</span>
                </span>
                <span className="trust__scope">{h.trustCertNote}</span>
              </li>
            ) : null}
            {ifs?.score ? (
              <li className="trust__item">
                <span className="trust__value tnum">{formatScore(ifs.score, locale)}</span>
                <span className="trust__label">
                  IFS Food {ifs.result}, {d.common.validUntil} <span className="tnum">{formatDate(ifs.expiresOn, locale)}</span>
                </span>
                <span className="trust__scope">{h.trustCertNote}</span>
              </li>
            ) : null}
            <li className="trust__item">
              <span className="trust__value tnum">{vetCount}</span>
              <span className="trust__label">{h.trustVet}</span>
              <span className="trust__scope">Linne, Wydrzyn, Lisków</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="products-h">
        <div className="container">
          <div className="section__head section__head--split">
            <div>
              <h2 id="products-h" className="h-section">
                {h.productsTitle}
              </h2>
              <p className="lead">{h.productsLead}</p>
            </div>
            <Link href={href(locale, 'products')} className="btn btn--line btn--arrow">
              {d.nav.products}
            </Link>
          </div>
          <ProductTiles locale={locale} />
          <aside className="uppz-note">
            <div>
              <h3 className="uppz-note__title">{t(uppz.name, locale)}</h3>
              <p>{d.products.uppzText}</p>
            </div>
            <Link href={`${href(locale, 'contact')}?temat=offal-uppz#pomoc`} className="btn btn--line btn--arrow">
              {d.common.contactOffal}
            </Link>
          </aside>
        </div>
      </section>

      <ProductionChain locale={locale} />

      {/* Quality: inspection photograph + current certification. */}
      <section className="section quality-home" aria-labelledby="q-h">
        <div className="container quality-home__grid">
          <Photo item={media.carcassInspection} locale={locale} ratio="5 / 4" sizes="(min-width: 64rem) 40vw, 100vw" className="quality-home__photo" reveal />
          <div className="quality-home__body">
            <h2 id="q-h" className="h-section">
              {h.qualityTitle}
            </h2>
            <p className="lead">{h.qualityText}</p>
            {brc && ifs ? (
              <div className="cert-grid cert-grid--tight">
                <CertificateLabel cert={brc} locale={locale} compact />
                <CertificateLabel cert={ifs} locale={locale} compact />
              </div>
            ) : null}
            <p className="link-row">
              <Link href={href(locale, 'quality')} className="btn btn--line btn--arrow">
                {h.qualityLink}
              </Link>
              <Link href={href(locale, 'certificates')} className="arrow-link">
                {h.certLink}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Logistics & export: the truck as a full-bleed photograph, panel overlapping. */}
      <section className="logistics" aria-labelledby="sales-h">
        <div className="logistics__photo">
          <Image src={media.truck.src} alt={t(media.truck.alt, locale)} fill sizes="100vw" quality={80} style={{ objectPosition: media.truck.position }} />
        </div>
        <div className="container logistics__inner">
          <div className="logistics__panel">
            <h2 id="sales-h" className="h-section">
              {h.salesTitle}
            </h2>
            <p>{h.salesText}</p>
            <ul className="logistics__people plain">
              {salesContacts.map((c) => (
                <li key={c.id}>
                  <span className="logistics__name">{c.name}</span>
                  <PhoneLink phone={c.phone!} className="clink clink--light" />
                </li>
              ))}
              <li>
                <MailLink email={office} className="clink clink--light" />
              </li>
            </ul>
            <Link href={href(locale, 'sales')} className="btn btn--ghost-light btn--arrow">
              {h.salesLink}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--paper2 export" aria-labelledby="export-h">
        <div className="container export__grid">
          <div>
            <h2 id="export-h" className="h-section">
              {h.exportTitle}
            </h2>
            <p className="note">{h.exportSales}</p>
          </div>
          <MarketsLedger locale={locale} />
        </div>
      </section>

      <section className="section" aria-labelledby="env-h">
        <div className="container">
          <div className="section__head section__head--split">
            <h2 id="env-h" className="h-section">
              {h.envTitle}
            </h2>
            <Link href={href(locale, 'biogas')} className="btn btn--line btn--arrow">
              {h.envLink}
            </Link>
          </div>
          <ul className="facts-row plain">
            {environmentFacts.map((f) => (
              <li key={f.title.pl}>
                <h3 className="facts-row__title">{t(f.title, locale)}</h3>
                <p>{t(f.text, locale)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
