import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { pageMetadata } from '@/lib/seo';
import { formContext } from '@/lib/forms/context';
import { salesContacts } from '@/content/contacts';
import { entityById } from '@/content/entities';
import { enquiryProductOptions } from '@/content/products';
import { PageHeader } from '@/components/layout/PageHeader';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { enquiryFormProps } from '@/components/forms/formProps';
import { MailLink, PhoneLink } from '@/components/ui/Contact';

export async function generateMetadata({ params }: PageProps<'/[locale]/zapytaj-o-oferte'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'enquiry', { title: d.enquiry.title, description: d.enquiry.description });
}

export default async function EnquiryPage({ params, searchParams }: PageProps<'/[locale]/zapytaj-o-oferte'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const sp = await searchParams;
  const raw = typeof sp.produkt === 'string' ? sp.produkt : '';
  // Whitelisted pre-selection only.
  const preselected = (enquiryProductOptions as readonly string[]).includes(raw) ? [raw] : [];
  const ctx = await formContext();
  const gmbh = entityById('gmbh');

  return (
    <>
      <PageHeader locale={locale} routeKey="enquiry" title={d.enquiry.title} lead={d.enquiry.lead} />
      <section className="section">
        <div className="container layout-aside">
          <EnquiryForm
            {...enquiryFormProps(locale)}
            preselected={preselected}
            startedAt={ctx.startedAt}
            nonce={ctx.nonce}
            turnstileSiteKey={ctx.turnstileSiteKey}
            standalone
          />
          <aside className="aside-box sales-card">
            <h2 className="aside-box__title">{d.enquiry.asideTitle}</h2>
            <p className="muted">{d.enquiry.asideText}</p>
            <ul className="plain stack-s">
              {salesContacts.map((c) => (
                <li key={c.id}>
                  <p className="person__name">{c.name}</p>
                  <PhoneLink phone={c.phone!} />
                  <MailLink email={c.email!} />
                </li>
              ))}
              <li>
                <MailLink email={gmbh.office.email!} />
              </li>
            </ul>
            <p className="note">{t(gmbh.place, locale)}</p>
          </aside>
        </div>
      </section>
    </>
  );
}
