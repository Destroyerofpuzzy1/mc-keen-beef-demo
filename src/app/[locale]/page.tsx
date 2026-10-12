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
import { salesContacts } from '@/content/contacts';
import { environmentFacts } from '@/content/environment';
import { heroVideo, media } from '@/content/media';
import { uppz } from '@/content/products';
import { ProductTiles } from '@/components/products/ProductTiles';
import { ProductionChain } from '@/components/sections/ProductionChain';
import { MarketsLedger } from '@/components/sections/MarketsLedger';
import { CertificateLabel } from '@/components/certificates/CertificateStatus';
import { formatDate, formatScore } from '@/components/certificates/format';
import { MailLink, PhoneLink } from '@/components/ui/Contact';
import { Photo } from '@/components/ui/Photo';
import { HeroVideo } from '@/components/ui/HeroVideo';
import { BrandIcon, BrandPatch, type BrandIconName } from '@/components/brand/BrandMarks';

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
  const poster = heroVideo.poster;
  const envMeasures = environmentFacts.filter((f) => f.id !== 'biogas');
  const envProject = environmentFacts.find((f) => f.id === 'biogas')!;
  const envIcon: Record<(typeof environmentFacts)[number]['id'], BrandIconName> = { waste: 'recycle', solar: 'solar', biogas: 'biogas' };
  // The other audiences' topics, with the contact router's own labels and hints.
  const contactHref = href(locale, 'contact');
  const coopPaths: { key: string; icon: BrandIconName; label: string; hint: string; href: string }[] = [
    { key: 'sell-cattle', icon: 'cow', label: d.contact.routes['sell-cattle'], hint: d.contact.routeHints['sell-cattle'], href: `${contactHref}?temat=sell-cattle#pomoc` },
    { key: 'supply', icon: 'box', label: d.contact.routes.supply, hint: d.contact.routeHints.supply, href: `${contactHref}?temat=supply#pomoc` },
    { key: 'quality', icon: 'seal', label: d.contact.routes.quality, hint: d.contact.routeHints.quality, href: `${contactHref}?temat=quality#pomoc` },
    { key: 'jobs', icon: 'knife', label: d.nav.careers, hint: d.contact.routeHints.jobs, href: href(locale, 'careers') },
  ];

  return (
    <>
      {/* Hero: full-bleed footage in natural colour over its poster (the LCP image); only the
          headline and one CTA. The copy sits in the darker band of the frame (no veil). */}
      <section className="hero" aria-labelledby="hero-h">
        <div className="hero__media">
          <Image
            src={poster.src}
            alt={t(poster.alt, locale)}
            fill
            loading="eager"
            fetchPriority="high"
            // Rendered width of the 2.4:1 cover image in each hero shape; never smaller than rendered,
            // or LCP would treat the poster as upscaled and pick the later video frame instead.
            sizes="(min-width: 64rem) 2000px, (min-width: 48rem) calc(180vw + 4px), calc(240vw + 4px)"
            quality={80}
            className="hero__poster"
          />
          <HeroVideo desktop={heroVideo.desktop} mobile={heroVideo.mobile} labels={{ pause: h.heroVideoPause, play: h.heroVideoPlay }} />
        </div>
        <div className="hero__copy container">
          <h1 id="hero-h" className="hero__title">
            {h.heroTitle}
          </h1>
          <Link href={href(locale, 'enquiry')} className="btn btn--primary btn--lg btn--arrow hero__cta" data-enquiry="">
            {d.nav.enquiry}
          </Link>
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
              {/* The former hero lead opens the product overview. */}
              <p className="lead">
                {h.heroLead} {h.productsLead}
              </p>
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

      {/* Environment, between quality and sales (UX-IA-001 stages 1 and 1.3): the plants' own measures
          as ruled rows, the biogas plant project as the one stitched card with the link to its
          documentation. Texts from environment.ts (shared with Jakość); the eyebrow is Jakość's
          section title. No company is named with the project (GAP-07, C-64). */}
      <section className="section env-home" aria-labelledby="env-h">
        <div className="container env-home__grid">
          <div className="env-home__head">
            <p className="eyebrow-plain">{d.quality.envTitle}</p>
            <h2 id="env-h" className="h-section">
              {h.envTitle}
            </h2>
          </div>
          <ul className="env-home__list plain">
            {envMeasures.map((f) => (
              <li key={f.id} className="env-home__item">
                <BrandIcon name={envIcon[f.id]} />
                <div>
                  <h3 className="env-home__title">{t(f.title, locale)}</h3>
                  <p>{t(f.text, locale)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="env-home__project stitched">
            <BrandPatch id="biogas" motif={envIcon.biogas} size="sm" />
            <h3 className="env-home__title">{t(envProject.title, locale)}</h3>
            <p>{t(envProject.text, locale)}</p>
            <Link href={href(locale, 'biogas')} className="btn btn--line btn--arrow">
              {h.envLink}
            </Link>
          </div>
        </div>
      </section>

      {/* Sales, markets and sites as one composition: the truck full-bleed, the sales panel
          overlapping it, markets and sites beside the panel (below it on phones). Formerly two
          sections ("Rynki i zakłady" was its own band). The band's GmbH line was removed with the
          user's consent: the panel text and the Oelde ledger row carry the same facts. */}
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
          <div className="logistics__markets">
            <h3 className="logistics__subhead">{h.exportTitle}</h3>
            <MarketsLedger locale={locale} headingLevel={4} />
          </div>
        </div>
      </section>

      {/* Contact and cooperation: the buyer's path first, then the other audiences' topics of the
          contact router and the full directory. Phones and e-mail stay in the sales panel above. */}
      <section className="coop" aria-labelledby="coop-h">
        <div className="container">
          <p className="eyebrow-plain">{h.coopEyebrow}</p>
          <h2 id="coop-h" className="h-section">
            {h.coopTitle}
          </h2>
          {/* One sewn board: the buyer's side, a seam, the other audiences' topics. */}
          <div className="coop__board">
            <div className="coop__buy">
              <h3 className="coop__label">
                <BrandIcon name="handshake" className="coop__icon" />
                {d.contact.routes['buy-beef']}
              </h3>
              <p>{d.contact.routeHints['buy-beef']}</p>
              <Link href={href(locale, 'enquiry')} className="btn btn--primary btn--lg btn--arrow" data-enquiry="">
                {d.nav.enquiry}
              </Link>
            </div>
            <div className="coop__paths">
              <p className="coop__intro">{d.contact.routerLead}</p>
              <ul className="coop__list plain">
                {coopPaths.map((p) => (
                  <li key={p.key}>
                    <Link href={p.href} className="coop__path">
                      <BrandIcon name={p.icon} className="coop__path-icon" />
                      <span className="coop__path-text">
                        <span className="coop__path-label">{p.label}</span>
                        <span className="coop__path-hint">{p.hint}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={href(locale, 'contact', 'dzialy')} className="arrow-link coop__all">
                {d.contact.directoryTitle}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
