import Link from 'next/link';
import type { Metadata } from 'next';
import { getDictionary, resolveLocale } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { careersFallback, enquiryFormProps } from '@/components/forms/formProps';
import { isConfirmedFormResult } from '@/lib/forms/context';

export async function generateMetadata({ params }: PageProps<'/[locale]/wyslano'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'sent', { title: d.sent.title, description: d.sent.description, noindex: true });
}

/**
 * Result page for form submissions without JavaScript (303 target of the API routes).
 * It states an outcome only when the endpoint signed it (lib/forms/result.ts); a missing,
 * altered or older result is "unknown": no claim of success or failure, the direct contacts and
 * the way back to the form (GAP-14).
 */
export default async function SentPage({ params, searchParams }: PageProps<'/[locale]/wyslano'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const f = d.forms;
  const sp = await searchParams;
  const form = sp.form === 'careers' ? 'careers' : 'enquiry';
  const status = typeof sp.status === 'string' ? sp.status : '';
  const confirmed = isConfirmedFormResult({ form: sp.form, status: sp.status, t: sp.t, sig: sp.sig });
  const state: 'ok' | 'error' | 'unknown' = !confirmed ? 'unknown' : status === 'ok' ? 'ok' : 'error';
  const ok = state === 'ok';
  const back = form === 'careers' ? href(locale, 'careers', 'aplikuj') : href(locale, 'enquiry');
  const fallback = form === 'careers' ? careersFallback() : enquiryFormProps(locale).fallback;

  // Every confirmed non-success status gets a readable message; other values fall back to the generic one.
  const messages: Record<string, string> = {
    rate: f.errorRate,
    unavailable: f.errorUnavailable,
    invalid: f.errorFields,
    expired: f.errorSession,
  };
  const title = { ok: f.sentTitle, error: f.errorTitle, unknown: f.unknownTitle }[state];
  const message = ok ? (form === 'careers' ? f.sentCareers : f.sentEnquiry) : state === 'error' ? (messages[status] ?? f.errorGeneric) : f.unknownText;
  const tone = { ok: 'notice--ok', error: 'notice--error', unknown: 'notice--warn' }[state];

  return (
    <section className="section">
      <div className="container prose">
        <h1 className="page-head__title">{title}</h1>
        <div className={`notice ${tone}`} role="status">
          <p>{message}</p>
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
