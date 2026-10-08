'use client';

import type { ReactNode, RefObject } from 'react';
import type { Dictionary } from '@/i18n/dictionaries/pl';
import type { SubmitState } from './useFormSubmit';

type F = Dictionary['forms'];

/**
 * Status region after submit. Focusable so screen readers announce the result.
 * Every state other than idle/sending renders a visible message; unrecoverable errors
 * also show the direct phone/e-mail fallback. Internal reasons are never exposed.
 */
export function FormStatus({
  state,
  messages,
  successText,
  fallback,
  statusRef,
}: {
  state: SubmitState;
  messages: F;
  successText: string;
  fallback: ReactNode;
  statusRef: RefObject<HTMLDivElement | null>;
}) {
  let body: ReactNode = null;
  switch (state) {
    case 'idle':
    case 'sending':
      break;
    case 'ok':
      body = (
        <div className="notice notice--ok">
          <p className="notice__title">{messages.sentTitle}</p>
          <p>{successText}</p>
        </div>
      );
      break;
    case 'invalid':
      body = (
        <div className="notice notice--error">
          <p className="notice__title">{messages.errorFields}</p>
        </div>
      );
      break;
    case 'expired':
    case 'tooFast':
      body = (
        <div className="notice notice--warn">
          <p className="notice__title">{messages.retryTitle}</p>
          <p>{state === 'expired' ? messages.errorExpired : messages.errorTooFast}</p>
        </div>
      );
      break;
    case 'rate':
      body = (
        <div className="notice notice--error">
          <p className="notice__title">{messages.errorTitle}</p>
          <p>{messages.errorRate}</p>
          {fallback}
        </div>
      );
      break;
    default:
      // unavailable, forbidden, error and anything unexpected
      body = (
        <div className="notice notice--error">
          <p className="notice__title">{messages.errorTitle}</p>
          <p>{state === 'unavailable' ? messages.errorUnavailable : messages.errorGeneric}</p>
          {fallback}
        </div>
      );
  }
  return (
    <div ref={statusRef} tabIndex={-1} className="form-status" role="status" aria-live="polite">
      {body}
    </div>
  );
}
