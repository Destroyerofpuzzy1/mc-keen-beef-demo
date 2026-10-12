import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { currentCertificates, todayIso } from '@/content/certificates';
import { environmentFacts } from '@/content/environment';
import { media, video } from '@/content/media';
import { PageHeader } from '@/components/layout/PageHeader';
import { CertificateLabel } from '@/components/certificates/CertificateStatus';
import { QualityContactLink } from '@/components/certificates/QualityContactLink';
import { AmbientVideo } from '@/components/ui/AmbientVideo';
import { Photo } from '@/components/ui/Photo';
import { BrandIcon, BrandPatch } from '@/components/brand/BrandMarks';

export async function generateMetadata({ params }: PageProps<'/[locale]/jakosc'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'quality', { title: d.quality.title, description: d.quality.description });
}

export default async function QualityPage({ params }: PageProps<'/[locale]/jakosc'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const q = d.quality;
  const current = currentCertificates(todayIso());

  return (
    <>
      <PageHeader
        locale={locale}
        routeKey="quality"
        title={q.title}
        lead={q.lead}
        motif={<BrandPatch id="quality" motif="seal" bottom={d.nav.quality.toUpperCase()} />}
      />

      <section className="section" id="system-jakosci" aria-labelledby="sys-h">
        <div className="container">
          <div className="section__head">
            <h2 id="sys-h" className="h-section">
              {q.systemTitle}
            </h2>
            <p className="lead">{q.systemLead}</p>
          </div>
          <dl className="spec-list">
            {q.systems.map((s) => (
              <div key={s.name} className="spec-list__row">
                <dt>{s.name}</dt>
                <dd>{s.text}</dd>
              </div>
            ))}
          </dl>
          <p className="note">{q.policy}</p>
        </div>
      </section>

      {/* Origin: feeding photograph full-bleed, statements on an oxblood panel. */}
      <section className="origin" id="zrodla" aria-labelledby="src-h">
        <div className="origin__photo">
          <Photo item={media.feedingCattle} locale={locale} ratio="1440 / 860" sizes="(min-width: 64rem) 60vw, 100vw" reveal />
        </div>
        <div className="origin__panel">
          <BrandIcon name="cow" className="origin__icon" />
          <h2 id="src-h" className="h-section">
            {q.sourcesTitle}
          </h2>
          <ul className="ticks ticks--light">
            {q.sourcesText.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Control: editorial two columns, large 5:4 inspection photograph. */}
      <section className="section" id="kontrola" aria-labelledby="ctrl-h">
        <div className="container control">
          <div className="control__body">
            <h2 id="ctrl-h" className="h-section">
              {q.controlTitle}
            </h2>
            <p className="lead">{d.home.qualityTitle}.</p>
            <dl className="control__rows">
              {q.control.map((c) => (
                <div key={c.name} className="control__row">
                  <dt>{c.name}</dt>
                  <dd>{c.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Photo item={media.carcassInspection} locale={locale} ratio="5 / 4" sizes="(min-width: 64rem) 46vw, 100vw" className="control__photo" reveal />
        </div>
      </section>

      <section className="section section--paper2" id="certyfikaty" aria-labelledby="qc-h">
        <div className="container">
          <div className="section__head section__head--split">
            <h2 id="qc-h" className="h-section">
              {q.certTitle}
            </h2>
            <Link href={href(locale, 'certificates')} className="btn btn--line btn--arrow">
              {d.home.certLink}
            </Link>
          </div>
          <div className="cert-grid">
            {current.map((c) => (
              <CertificateLabel key={c.id} cert={c} locale={locale} compact />
            ))}
          </div>
          <p className="note">{d.cert.scopeNote}</p>
          {/* UXA-05 stage 2: audits and certificate questions go to the quality departments (the
              router's quality topic lists every plant; no person is picked for the visitor). */}
          <p className="link-row">
            <QualityContactLink locale={locale} />
          </p>
        </div>
      </section>

      <section className="section" id="srodowisko" aria-labelledby="env-h">
        <div className="container control">
          <div className="control__body">
            <h2 id="env-h" className="h-section">
              {q.envTitle}
            </h2>
            <p className="lead">{q.envLead}</p>
            <ul className="facts-col plain">
              {environmentFacts.map((f) => (
                <li key={f.title.pl}>
                  <h3 className="facts-row__title">{t(f.title, locale)}</h3>
                  <p>{t(f.text, locale)}</p>
                </li>
              ))}
            </ul>
            <Link href={href(locale, 'biogas')} className="btn btn--line btn--arrow">
              {d.home.envLink}
            </Link>
          </div>
          <figure className="media-frame media-frame--video">
            <AmbientVideo src={video.src} poster={video.poster.src} label={q.videoLabel} width={video.poster.width} height={video.poster.height} />
          </figure>
        </div>
      </section>
    </>
  );
}
