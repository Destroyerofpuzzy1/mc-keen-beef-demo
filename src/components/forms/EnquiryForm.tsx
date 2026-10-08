'use client';

import Script from 'next/script';
import { useState, type ReactNode } from 'react';
import type { Dictionary } from '@/i18n/dictionaries/pl';
import type { Locale } from '@/i18n/config';
import { ChoiceGroup, Consent, FieldScope, fieldDomId, Honeypot, TextArea, TextField } from './fields';
import { FormStatus } from './FormStatus';
import { emailRe, phoneRe, useFormSubmit, type FieldErrorCode } from './useFormSubmit';

const TOPICS = ['products', 'sales', 'cooperation', 'other'] as const;

function validate(fd: FormData): Record<string, FieldErrorCode> {
  const e: Record<string, FieldErrorCode> = {};
  const v = (k: string) => String(fd.get(k) ?? '').trim();
  for (const k of ['person', 'company', 'email', 'country', 'topic']) if (!v(k)) e[k] = 'required';
  if (v('email') && !emailRe.test(v('email'))) e.email = 'email';
  if (v('phone') && !phoneRe.test(v('phone'))) e.phone = 'phone';
  if (v('topic') === 'products' && fd.getAll('products').length === 0) e.products = 'products';
  if (!fd.get('consent')) e.consent = 'consent';
  return e;
}

/**
 * B2B offer enquiry. Posts natively to /api/enquiries; enhanced with fetch when JS runs.
 * Product groups are shown only for the topic "Produkty" (pre-selected when the form is
 * opened from a product CTA). The server validates everything again.
 */
export function EnquiryForm({
  locale,
  messages,
  productOptions,
  preselected,
  startedAt,
  privacyHref,
  fallback,
  turnstileSiteKey,
  nonce,
  standalone = false,
}: {
  locale: Locale;
  messages: Dictionary['forms'];
  productOptions: { value: string; label: string }[];
  preselected: string[];
  startedAt: number;
  privacyHref: string;
  fallback: ReactNode;
  turnstileSiteKey?: string;
  nonce?: string;
  /** True on the dedicated form page (the modal then stays closed). */
  standalone?: boolean;
}) {
  const m = messages;
  const f = m.enquiry;
  const { state, errors, onSubmit, statusRef, formRef, idPrefix, startedAt: stamp } = useFormSubmit(validate, startedAt);
  const [topic, setTopic] = useState<string>('products');
  const topicId = fieldDomId(idPrefix, 'topic');
  const err = (k: string) => (errors[k] ? m.fieldErrors[errors[k]!] : undefined);
  const common = { requiredLabel: m.required, optionalLabel: m.optional };

  if (state === 'ok') {
    return <FormStatus state={state} messages={m} successText={m.sentEnquiry} fallback={fallback} statusRef={statusRef} />;
  }

  return (
    <FieldScope value={idPrefix}>
    <form
      ref={formRef}
      className="form"
      action="/api/enquiries"
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
      data-enquiry-page={standalone || undefined}
      aria-busy={state === 'sending'}
    >
      <FormStatus state={state} messages={m} successText={m.sentEnquiry} fallback={fallback} statusRef={statusRef} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="startedAt" value={stamp} />
      <Honeypot label={m.honeypot} />

      <div className="form__grid">
        <TextField name="person" label={f.person} required autoComplete="name" maxLength={120} error={err('person')} {...common} />
        <TextField name="company" label={f.company} required autoComplete="organization" maxLength={160} error={err('company')} {...common} />
        <TextField name="email" type="email" label={f.email} required autoComplete="email" maxLength={200} error={err('email')} {...common} />
        <TextField name="phone" type="tel" label={f.phone} autoComplete="tel" maxLength={25} error={err('phone')} {...common} />
        <TextField name="country" label={f.country} required autoComplete="country-name" maxLength={80} error={err('country')} {...common} />
        <div className={`field${errors.topic ? ' has-error' : ''}`}>
          <label className="field__label" htmlFor={topicId}>
            {f.topic} <span className="field__req" aria-hidden="true">*</span>
            <span className="visually-hidden"> ({m.required})</span>
          </label>
          <select id={topicId} name="topic" required className="field__input" value={topic} onChange={(e) => setTopic(e.target.value)}>
            {TOPICS.map((tp) => (
              <option key={tp} value={tp}>
                {f.topics[tp]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {topic === 'products' ? (
        <div className="form__group">
          <ChoiceGroup
            name="products"
            legend={f.products}
            type="checkbox"
            options={productOptions}
            defaultValue={preselected}
            required
            error={err('products')}
            {...common}
          />
          <ChoiceGroup
            name="productForm"
            legend={f.form}
            type="radio"
            options={[
              { value: 'chilled', label: f.formChilled },
              { value: 'frozen', label: f.formFrozen },
              { value: 'unknown', label: f.formUnknown },
            ]}
            error={err('productForm')}
            {...common}
          />
          <TextArea name="volume" label={f.volume} hint={f.volumeHint} rows={2} maxLength={500} error={err('volume')} {...common} />
        </div>
      ) : null}

      <TextArea name="message" label={f.message} rows={4} maxLength={3000} error={err('message')} {...common} />

      <Consent
        name="consent"
        label={m.consentPrivacy}
        error={err('consent')}
        link={
          <a href={privacyHref} target="_blank" rel="noopener">
            {m.privacyLink}
          </a>
        }
      />

      {turnstileSiteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" nonce={nonce} />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-language={locale} />
        </>
      ) : null}

      <button type="submit" className={`btn btn--primary btn--lg form__submit${state === 'sending' ? ' is-loading' : ''}`} disabled={state === 'sending'}>
        {state === 'sending' ? m.sending : m.send}
      </button>
    </form>
    </FieldScope>
  );
}
