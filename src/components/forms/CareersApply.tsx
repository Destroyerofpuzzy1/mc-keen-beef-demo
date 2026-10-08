'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ComponentProps, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { CareersForm } from './CareersForm';
import { useServerClock } from './useFormSubmit';

const noopSubscribe = () => () => {};

type FormProps = Omit<ComponentProps<typeof CareersForm>, 'startedAt'>;

/**
 * Recruitment application, separate from the sales enquiry.
 * - Server render / no JavaScript: the full CV form is shown inline (works with a plain POST).
 * - With JavaScript: the inline form becomes a "Wyślij CV" button and the form opens in a
 *   native <dialog>. Any link with `data-careers` also opens it.
 */
export function CareersApply({
  title,
  lead,
  ctaLabel,
  closeLabel,
  aside,
  startedAt,
  ...form
}: FormProps & { title: string; lead: string; ctaLabel: string; closeLabel: string; aside: ReactNode; startedAt: number }) {
  // false during SSR and hydration, true once JavaScript runs (no state set in an effect).
  const enhanced = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [openedAt, setOpenedAt] = useState(0);
  const ref = useRef<HTMLDialogElement>(null);
  const serverNow = useServerClock(startedAt);
  const openRef = useRef<() => void>(() => {});

  const open = () => {
    // Server time, not the device clock: see useServerClock.
    setOpenedAt(serverNow());
    ref.current?.showModal();
  };
  useEffect(() => {
    openRef.current = open;
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest('a[data-careers]');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      openRef.current();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return (
    <div className="apply">
      <div className="apply__intro">
        <h2 id="apply-h" className="h-section">
          {title}
        </h2>
        <p className="lead">{lead}</p>
        {enhanced ? (
          <button type="button" className="btn btn--primary btn--lg btn--arrow" onClick={open}>
            {ctaLabel}
          </button>
        ) : null}
      </div>
      {!enhanced ? <CareersForm {...form} startedAt={startedAt} /> : null}
      <aside className="aside-box">{aside}</aside>

      <dialog
        ref={ref}
        className="dlg"
        aria-labelledby="dlg-cv-title"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="dlg__panel">
          <header className="dlg__head">
            <h2 id="dlg-cv-title" className="dlg__title">
              {ctaLabel}
            </h2>
            <button type="button" className="dlg__close" onClick={() => ref.current?.close()}>
              <Icon name="close" size={22} />
              <span className="visually-hidden">{closeLabel}</span>
            </button>
          </header>
          {enhanced && openedAt ? <CareersForm key={openedAt} {...form} startedAt={openedAt} /> : null}
        </div>
      </dialog>
    </div>
  );
}
