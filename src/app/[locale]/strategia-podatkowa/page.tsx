import type { Metadata } from 'next';
import { getDictionary, resolveLocale } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { pageMetadata } from '@/lib/seo';
import { entityById } from '@/content/entities';
import { PageHeader } from '@/components/layout/PageHeader';
import { Icon } from '@/components/ui/Icon';

export async function generateMetadata({ params }: PageProps<'/[locale]/strategia-podatkowa'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'tax', { title: d.tax.title, description: d.tax.description });
}

/** Facts printed in the 2023 tax strategy documents (open letter dated 30.12.2024). */
const docs = [
  { entity: 'sh' as const, position: '1685', file: '/documents/legal/strategia-podatkowa-2023-mckeen-beef-sh.pdf' },
  { entity: 'cp' as const, position: '1332', file: '/documents/legal/strategia-podatkowa-2023-mckeen-beef-cp.pdf' },
];

export default async function TaxPage({ params }: PageProps<'/[locale]/strategia-podatkowa'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const x = d.tax;

  return (
    <>
      <PageHeader locale={locale} routeKey="tax" title={x.title} lead={x.lead}>
        {x.legalNote ? <p className="note">{x.legalNote}</p> : null}
      </PageHeader>
      <section className="section">
        <div className="container">
          <ul className="docs plain">
            {docs.map((doc) => {
              const e = entityById(doc.entity);
              return (
                <li key={doc.entity} className="doc">
                  <h2 className="doc__title">{e.legalName}</h2>
                  <dl className="legal-data">
                    <div>
                      <dt>{x.year}</dt>
                      <dd className="tnum">2023</dd>
                    </div>
                    <div>
                      <dt>{x.published}</dt>
                      <dd lang="pl">Warszawa, 30 grudnia 2024 r.</dd>
                    </div>
                    <div>
                      <dt>{x.listPosition}</dt>
                      <dd className="tnum">{doc.position}</dd>
                    </div>
                    <div>
                      <dt>{e.taxId.label}</dt>
                      <dd className="tnum">{e.taxId.value}</dd>
                    </div>
                  </dl>
                  <a className="btn btn--line" href={doc.file} type="application/pdf" hrefLang="pl">
                    <Icon name="download" size={18} />
                    {x.document} PDF (PL)
                  </a>
                  <p className="note">{x.fileNote}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
