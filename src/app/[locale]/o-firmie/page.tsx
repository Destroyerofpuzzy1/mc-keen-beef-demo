import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { media } from '@/content/media';
import { PageHeader } from '@/components/layout/PageHeader';
import { HistoryTimeline } from '@/components/sections/HistoryTimeline';
import { Photo } from '@/components/ui/Photo';
import { BrandPatch } from '@/components/brand/BrandMarks';

export async function generateMetadata({ params }: PageProps<'/[locale]/o-firmie'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'about', { title: d.about.title, description: d.about.description });
}

export default async function AboutPage({ params }: PageProps<'/[locale]/o-firmie'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const a = d.about;

  return (
    <>
      <PageHeader
        locale={locale}
        routeKey="about"
        title={a.title}
        lead={a.lead}
        motif={<BrandPatch id="about" motif="cattle" bottom="LISKÓW · 2009" size="lg" className="patch--hero" />}
      />

      <section className="wide-photo" aria-hidden="false">
        <Photo item={media.herefordPasture} locale={locale} ratio="21 / 8" sizes="100vw" priority quality={80} className="photo--natural" />
      </section>

      <section className="section" id="o-nas" aria-label={a.title}>
        <div className="container layout-split">
          <div className="prose">
            {a.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {a.familyNote ? <p>{a.familyNote}</p> : null}
          </div>
          <Photo item={media.feedingCattle} locale={locale} ratio="3 / 2" sizes="(min-width: 64rem) 45vw, 100vw" reveal />
        </div>
      </section>

      <section className="section section--paper2" id="historia" aria-labelledby="hist-h">
        <div className="container layout-aside layout-aside--wide">
          <div>
            <h2 id="hist-h" className="h-section">
              {a.historyTitle}
            </h2>
            <HistoryTimeline locale={locale} />
            <p className="note">{a.historyNote}</p>
          </div>
          <div className="photo-stack">
            <Photo item={media.carcassInspection} locale={locale} ratio="4 / 3" sizes="(min-width: 64rem) 22rem, 100vw" reveal />
            <Photo item={media.butcherCutting} locale={locale} ratio="4 / 3" sizes="(min-width: 64rem) 22rem, 100vw" reveal />
          </div>
        </div>
      </section>

      <section className="section" id="po-pierwsze-klient" aria-labelledby="cust-h">
        <div className="container layout-split layout-split--media">
          <Photo item={media.staffBeef} locale={locale} ratio="3 / 2" sizes="(min-width: 64rem) 45vw, 100vw" reveal />
          <div>
            <h2 id="cust-h" className="h-section">
              {a.customerTitle}
            </h2>
            <p className="lead">{a.customerText}</p>
            <p className="link-row">
              <Link href={href(locale, 'plants')} className="link-strong">
                {d.nav.plants}
              </Link>
              <Link href={href(locale, 'certificates')} className="link-strong">
                {d.nav.certificates}
              </Link>
              <Link href={href(locale, 'tax')} className="link-strong">
                {d.nav.tax}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
