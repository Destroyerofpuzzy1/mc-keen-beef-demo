import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { biogas } from '@/content/biogas';
import { PageHeader } from '@/components/layout/PageHeader';

export async function generateMetadata({ params }: PageProps<'/[locale]/biogazownia'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'biogas', { title: d.biogas.title, description: d.biogas.description });
}

/** EU project disclosure. Figures and wording are verbatim (content/biogas.ts). Polish only. */
export default async function BiogasPage({ params }: PageProps<'/[locale]/biogazownia'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const b = d.biogas;

  return (
    <>
      <PageHeader locale={locale} routeKey="biogas" title={b.title}>
        {b.legalNote ? <p className="note">{b.legalNote}</p> : null}
      </PageHeader>
      <div lang="pl">
        <section className="section section--tight">
          <div className="container">
            <div className="eu-logos">
              <Image src={biogas.logos.fe.src} alt={biogas.logos.fe.alt} width={biogas.logos.fe.width} height={biogas.logos.fe.height} sizes="320px" />
              <Image src={biogas.logos.ue.src} alt={biogas.logos.ue.alt} width={biogas.logos.ue.width} height={biogas.logos.ue.height} sizes="320px" />
            </div>
            <p className="eu-programme">„{biogas.programme}”</p>
            <h2 className="h-section">{biogas.projectTitle}</h2>
            <div className="prose">
              <p>{biogas.intro}</p>
              <p>{biogas.summary}</p>
              <p>{biogas.costsSentence}</p>
            </div>
          </div>
        </section>

        <section className="section section--paper2">
          <div className="container">
            <h2 className="h-section">{b.costsTitle}</h2>
            <dl className="figures">
              {biogas.costs.map((c) => (
                <div key={c.label}>
                  <dt>{c.label}</dt>
                  <dd className="tnum">{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section">
          <div className="container layout-split">
            <div>
              <h2 className="h-section">{b.productTitle}</h2>
              <table className="data-table">
                <tbody>
                  {biogas.productIndicators.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td className="tnum nowrap">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h2 className="h-section">{b.resultTitle}</h2>
              <table className="data-table">
                <tbody>
                  {biogas.resultIndicators.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td className="tnum nowrap">{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="notice notice--plain">
                <p className="notice__title">{biogas.irregularities.intro}</p>
                <ul>
                  <li>
                    {b.irregularitiesForm}:{' '}
                    <a href={biogas.irregularities.formUrl} target="_blank" rel="noopener noreferrer">
                      nieprawidlowosci.mfipr.gov.pl<span className="visually-hidden"> ({d.a11y.external})</span>
                    </a>
                  </li>
                  <li>
                    {b.irregularitiesEmail}: <a href={`mailto:${biogas.irregularities.email}`}>{biogas.irregularities.email}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* UXA-05 stage 5: back to the group's environment section, where this project is listed.
              Navigation only, after the EU disclosure (unchanged); in the page's language. */}
          <div className="container" lang={locale}>
            <p className="link-row">
              <Link href={href(locale, 'quality', 'srodowisko')} className="arrow-link">
                {d.quality.envTitle}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
