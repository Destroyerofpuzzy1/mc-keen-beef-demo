'use client';

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { EnquiryForm } from './EnquiryForm';
import { useServerClock } from './useFormSubmit';

type FormProps = Omit<ComponentProps<typeof EnquiryForm>, 'preselected' | 'startedAt'>;

/**
 * Offer request in a modal. Any link with `data-enquiry="<product id>"` (or an empty
 * value for a general enquiry) opens it with that product pre-selected. The link's href
 * points to the full form page, so everything works without JavaScript and with
 * modifier-clicks (new tab). Native <dialog>: focus trap, Escape and inert background.
 */
export function EnquiryDialog({
  title,
  closeLabel,
  aside,
  serverStartedAt,
  ...form
}: FormProps & { title: string; closeLabel: string; aside: ReactNode; serverStartedAt: number }) {
  const ref = useRef<HTMLDialogElement>(null);
  const serverNow = useServerClock(serverStartedAt);
  const serverNowRef = useRef(serverNow);
  useEffect(() => {
    serverNowRef.current = serverNow;
  }, [serverNow]);
  const [product, setProduct] = useState<string | null>(null);
  const [openedAt, setOpenedAt] = useState(0);
  const allowed = new Set(form.productOptions.map((o) => o.value));

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[data-enquiry]');
      if (!a) return;
      // On the full form page the inline form is already there: let the link scroll to it.
      if (document.querySelector('form[data-enquiry-page]')) return;
      e.preventDefault();
      e.stopPropagation(); // keep next/link from navigating
      const p = a.dataset.enquiry ?? '';
      setProduct(allowed.has(p) ? p : '');
      setOpenedAt(serverNowRef.current());
      window.dispatchEvent(new Event('mb:enquiry-open'));
      ref.current?.showModal();
    };
    // Capture phase: runs before next/link's own click handler.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dialog
      ref={ref}
      className="dlg"
      aria-labelledby="dlg-title"
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="dlg__panel">
        <header className="dlg__head">
          <h2 id="dlg-title" className="dlg__title">
            {title}
          </h2>
          <button type="button" className="dlg__close" onClick={() => ref.current?.close()}>
            <Icon name="close" size={22} />
            <span className="visually-hidden">{closeLabel}</span>
          </button>
        </header>
        <div className="dlg__grid">
          <div>
            {product !== null ? (
              <EnquiryForm key={`${product}-${openedAt}`} {...form} preselected={product ? [product] : []} startedAt={openedAt} />
            ) : null}
          </div>
          <aside className="dlg__aside">{aside}</aside>
        </div>
      </div>
    </dialog>
  );
}
