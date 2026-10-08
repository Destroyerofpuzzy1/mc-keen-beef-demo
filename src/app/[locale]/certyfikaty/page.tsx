import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { pageMetadata } from '@/lib/seo';
import { entityById } from '@/content/entities';
import { currentCertificates, sitesWithoutCurrentCertificate, todayIso } from '@/content/certificates';
import { PageHeader } from '@/components/layout/PageHeader';
import { CertificateArchive } from '@/components/certificates/CertificateArchive';
import { CertificateLabel, CertificateThumb } from '@/components/certificates/CertificateStatus';

export async function generateMetadata({ params }: PageProps<'/[locale]/certyfikaty'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'certificates', { title: d.certificates.title, description: d.certificates.description });
}

export default async function CertificatesPage({ params }: PageProps<'/[locale]/certyfikaty'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const today = todayIso();
  const current = currentCertificates(today);
  const pending = sitesWithoutCurrentCertificate(today);

  return (
    <>
      <PageHeader locale={locale} routeKey="certificates" title={d.certificates.title} lead={d.certificates.lead} />

      <section className="section" aria-labelledby="cur-h">
        <div className="container">
          <h2 id="cur-h" className="h-section">
            {d.certificates.currentTitle}
          </h2>
          {current.length > 0 ? (
            <>
              <h3 className="site-title" id="zaklad-rozbioru">
                {t(entityById('cp').role, locale)}, {entityById('cp').registeredAddress.city}
                <span className="muted"> {entityById('cp').legalName}</span>
              </h3>
              <div className="cert-full">
                {current.map((c) => (
                  <div key={c.id} className="cert-full__item">
                    <CertificateLabel cert={c} locale={locale} />
                    <CertificateThumb cert={c} locale={locale} sizes="144px" />
                  </div>
                ))}
              </div>
            </>
          ) : null}
          <p className="note">{d.cert.verify}</p>

          <h3 className="site-title site-title--spaced" id="zaklad-uboju">
            {d.certificates.otherSitesTitle}
          </h3>
          <ul className="pending-list plain">
            {pending.map((id) => {
              const e = entityById(id);
              return (
                <li key={id}>
                  <p className="pending-list__site">
                    {t(e.place, locale)}
                    <span className="muted"> {e.legalName}</span>
                  </p>
                  <p>
                    {d.cert.noCurrent}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section section--paper2" id="archiwum" aria-labelledby="arch-h">
        <div className="container">
          <h2 id="arch-h" className="h-section">
            {d.certificates.archiveTitle}
          </h2>
          <CertificateArchive locale={locale} today={today} />
        </div>
      </section>
    </>
  );
}
