import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { careersFallback, enquiryFormProps } from '@/components/forms/formProps';

export async function generateMetadata({ params }: PageProps<'/[locale]/wyslano'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'sent', { title: d.sent.title, description: d.sent.description, noindex: true });
}

/** Result page for form submissions without JavaScript (303 target of the API routes). */
export default async function SentPage({ params, searchParams }: PageProps<'/[locale]/wyslano'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const f = d.forms;
  const sp = await searchParams;
  const form = sp.form === 'careers' ? 'careers' : 'enquiry';
  const status = typeof sp.status === 'string' ? sp.status : 'error';
  const ok = status === 'ok';
  const back = form === 'careers' ? href(locale, 'careers', 'aplikuj') : href(locale, 'enquiry');
  const fallback = form === 'careers' ? careersFallback() : enquiryFormProps(locale).fallback;

  // Every non-success status gets a readable message; unknown values fall back to the generic one.
  const messages: Record<string, string> = {
    rate: f.errorRate,
    unavailable: f.errorUnavailable,
    invalid: f.errorFields,
    expired: f.errorSession,
  };
  const message = messages[status] ?? f.errorGeneric;

  return (
    <section className="section">
      <div className="container prose">
        <h1 className="page-head__title">{ok ? f.sentTitle : f.errorTitle}</h1>
        <div className={`notice ${ok ? 'notice--ok' : 'notice--error'}`} role="status">
          <p>{ok ? (form === 'careers' ? f.sentCareers : f.sentEnquiry) : message}</p>
          {!ok ? fallback : null}
        </div>
        <p className="link-row">
          {!ok ? (
            <Link href={back} className="btn btn--line">
              {form === 'careers' ? d.careers.applyTitle : d.enquiry.title}
            </Link>
          ) : null}
          <Link href={href(locale, 'home')} className="link-strong">
            {f.backHome}
          </Link>
        </p>
      </div>
    </section>
  );
}
