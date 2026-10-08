'use client';

import Script from 'next/script';
import type { ReactNode } from 'react';
import type { Dictionary } from '@/i18n/dictionaries/pl';
import type { Locale } from '@/i18n/config';
import { Consent, FieldScope, fieldDomId, Honeypot, TextArea, TextField } from './fields';
import { FormStatus } from './FormStatus';
import { emailRe, phoneRe, useFormSubmit, type FieldErrorCode } from './useFormSubmit';

const MAX = 5 * 1024 * 1024;
const EXT = ['pdf', 'doc', 'docx'];

function validate(fd: FormData): Record<string, FieldErrorCode> {
  const e: Record<string, FieldErrorCode> = {};
  const v = (k: string) => String(fd.get(k) ?? '').trim();
  if (!v('name')) e.name = 'required';
  if (!v('phone')) e.phone = 'required';
  else if (!phoneRe.test(v('phone'))) e.phone = 'phone';
  if (v('email') && !emailRe.test(v('email'))) e.email = 'email';
  if (!v('position')) e.position = 'required';
  const file = fd.get('cv');
  if (file instanceof File && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (file.size > MAX || !EXT.includes(ext)) e.cv = 'file';
  }
  if (!fd.get('consent')) e.consent = 'consent';
  return e;
}

/** Job application. Posts natively to /api/careers; CV is optional. */
export function CareersForm({
  locale,
  messages,
  positions,
  startedAt,
  privacyHref,
  fallback,
  turnstileSiteKey,
  nonce,
}: {
  locale: Locale;
  messages: Dictionary['forms'];
  positions: { value: string; label: string }[];
  startedAt: number;
  privacyHref: string;
  fallback: ReactNode;
  turnstileSiteKey?: string;
  nonce?: string;
}) {
  const m = messages;
  const f = m.careers;
  const { state, errors, onSubmit, statusRef, formRef, idPrefix, startedAt: stamp } = useFormSubmit(validate, startedAt);
  const positionId = fieldDomId(idPrefix, 'position');
  const cvId = fieldDomId(idPrefix, 'cv');
  const err = (k: string) => (errors[k] ? m.fieldErrors[errors[k]!] : undefined);
  const common = { requiredLabel: m.required, optionalLabel: m.optional };

  return (
    <FieldScope value={idPrefix}>
    <form ref={formRef} className="form" action="/api/careers" method="post" encType="multipart/form-data" onSubmit={onSubmit}>
      <FormStatus state={state} messages={m} successText={m.sentCareers} fallback={fallback} statusRef={statusRef} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="startedAt" value={stamp} />
      <Honeypot label={m.honeypot} />

      <div className="form__grid">
        <TextField name="name" label={f.name} required autoComplete="name" maxLength={120} error={err('name')} {...common} />
        <TextField name="phone" type="tel" label={f.phone} required autoComplete="tel" maxLength={25} error={err('phone')} {...common} />
        <TextField name="email" type="email" label={f.email} autoComplete="email" maxLength={200} error={err('email')} {...common} />
        <div className={`field${errors.position ? ' has-error' : ''}`}>
          <label className="field__label" htmlFor={positionId}>
            {f.position} <span className="field__req" aria-hidden="true">*</span>
            <span className="visually-hidden"> ({m.required})</span>
          </label>
          <select
            id={positionId}
            name="position"
            required
            className="field__input"
            defaultValue={positions[0]?.value}
            aria-invalid={errors.position ? true : undefined}
          >
            {positions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <TextArea name="message" label={f.message} rows={4} maxLength={2000} error={err('message')} {...common} />

      <div className={`field${errors.cv ? ' has-error' : ''}`}>
        <label className="field__label" htmlFor={cvId}>
          {f.cv} <span className="field__req">({m.optional})</span>
        </label>
        <input
          id={cvId}
          type="file"
          name="cv"
          className="field__file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          aria-describedby={`${cvId}-hint${errors.cv ? ` ${cvId}-err` : ''}`}
          aria-invalid={errors.cv ? true : undefined}
        />
        <p className="field__hint" id={`${cvId}-hint`}>
          {f.cvHint}
        </p>
        {errors.cv ? (
          <p className="field__error" id={`${cvId}-err`}>
            {m.fieldErrors.file}
          </p>
        ) : null}
      </div>

      <p className="form__note">{f.privacyNote}</p>
      <Consent
        name="consent"
        label={m.consentCareers}
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

      <button type="submit" className="btn btn--primary btn--lg" disabled={state === 'sending'} aria-busy={state === 'sending'}>
        {state === 'sending' ? m.sending : m.apply}
      </button>
    </form>
    </FieldScope>
  );
}
