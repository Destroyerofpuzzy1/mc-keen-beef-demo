'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { fieldDomId } from './fields';

export type FieldErrorCode = 'required' | 'email' | 'phone' | 'tooLong' | 'products' | 'consent' | 'file';

/** Every server outcome maps to one of these; anything unknown becomes `error`. */
export type SubmitState = 'idle' | 'sending' | 'ok' | 'invalid' | 'rate' | 'unavailable' | 'error' | 'forbidden' | 'expired' | 'tooFast';
type TurnstileApi = { reset: (widget?: string | HTMLElement) => void };
/** A Turnstile token is single-use: get a fresh one before the person sends again. */
const resetChallenge = (form: HTMLFormElement) => {
  const widget = form.querySelector<HTMLElement>('.cf-turnstile');
  const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
  if (widget && api) api.reset(widget);
};
const KNOWN: ReadonlySet<string> = new Set(['ok', 'invalid', 'rate', 'unavailable', 'error', 'forbidden', 'expired', 'tooFast']);

/**
 * Progressive enhancement for the native form post: same endpoint, JSON response,
 * inline errors, focus on the first invalid field or on the status message.
 * The server remains the only trust boundary.
 *
 * - `idPrefix` scopes the field ids of this form instance (see fields.tsx).
 * - `startedAt` feeds the hidden fill-time field. After an `expired` / `tooFast` answer the
 *   server sends a fresh stamp; the entered data stays in the form for a resend.
 */
export function useFormSubmit(validate: (fd: FormData) => Record<string, FieldErrorCode>, initialStartedAt: number) {
  const idPrefix = useId();
  const [state, setState] = useState<SubmitState>('idle');
  const [errors, setErrors] = useState<Record<string, FieldErrorCode>>({});
  const [startedAt, setStartedAt] = useState(initialStartedAt);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // The fallback no-JS form posts with native validation; with JS we validate ourselves.
  useEffect(() => formRef.current?.setAttribute('novalidate', ''), []);

  const focusFirst = useCallback(
    (errs: Record<string, FieldErrorCode>) => {
      const first = Object.keys(errs)[0];
      if (!first) return;
      requestAnimationFrame(() => document.getElementById(fieldDomId(idPrefix, first))?.focus());
    },
    [idPrefix],
  );

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const fd = new FormData(form);
      const clientErrors = validate(fd);
      setErrors(clientErrors);
      if (Object.keys(clientErrors).length) {
        setState('invalid');
        focusFirst(clientErrors);
        return;
      }
      setState('sending');
      const focusStatus = () => requestAnimationFrame(() => statusRef.current?.focus());
      try {
        const res = await fetch(form.action, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        const data = (await res.json().catch(() => ({}))) as {
          outcome?: string;
          errors?: Record<string, FieldErrorCode>;
          startedAt?: number;
        };
        const serverErrors = data.errors ?? {};
        let outcome: SubmitState = data.outcome && KNOWN.has(data.outcome) ? (data.outcome as SubmitState) : 'error';
        if (outcome === 'ok' && !res.ok) outcome = 'error';
        // `invalid` without field errors (e.g. failed challenge) is not something the person can fix in a field.
        if (outcome === 'invalid' && !Object.keys(serverErrors).length) outcome = 'error';
        if (typeof data.startedAt === 'number' && Number.isFinite(data.startedAt)) setStartedAt(data.startedAt);
        setErrors(serverErrors);
        setState(outcome);
        if (outcome === 'invalid') focusFirst(serverErrors);
        else focusStatus();
        if (outcome === 'ok') form.reset();
        else resetChallenge(form);
      } catch {
        setState('error');
        resetChallenge(form);
        focusStatus();
      }
    },
    [validate, focusFirst],
  );

  return { state, errors, onSubmit, statusRef, formRef, idPrefix, startedAt };
}

/**
 * Server time for forms opened later in a dialog: the server stamp from the page render plus
 * the time elapsed on this device. Differences of the local clock cancel out, so a wrong
 * device clock cannot make a submission look expired or too fast.
 */
export function useServerClock(serverStartedAt: number) {
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);
  return useCallback(() => serverStartedAt + (mountedAt.current ? Date.now() - mountedAt.current : 0), [serverStartedAt]);
}

export const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRe = /^\+?[0-9 ()\-./]{6,25}$/;
