'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Item {
  href: string;
  label: string;
}

/**
 * Full-screen mobile menu. Dialog semantics, focus moves into the panel on open,
 * Escape closes, focus returns to the toggle, background scroll is locked.
 */
export function MobileMenu({
  items,
  cta,
  footer,
  labels,
}: {
  items: Item[];
  cta: Item;
  footer: ReactNode;
  labels: { open: string; close: string; nav: string };
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Close on navigation (also back/forward): adjust state during render when the path changes.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }
  // Close when the offer modal opens.
  useEffect(() => {
    const onEnquiry = () => setOpen(false);
    window.addEventListener('mb:enquiry-open', onEnquiry);
    return () => window.removeEventListener('mb:enquiry-open', onEnquiry);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('.mmenu__close')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        const first = f[0];
        const last = f[f.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <div className="mmenu">
      <button
        ref={toggleRef}
        type="button"
        className="mmenu__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Icon name={open ? 'close' : 'menu'} size={24} />
        <span className="visually-hidden">{open ? labels.close : labels.open}</span>
      </button>
      <div
        ref={panelRef}
        id={panelId}
        className="mmenu__panel"
        role="dialog"
        aria-modal="true"
        aria-label={labels.nav}
        data-open={open || undefined}
        hidden={!open}
      >
        <div className="mmenu__top">
          <button type="button" className="mmenu__close" onClick={close}>
            <Icon name="close" size={24} />
            <span className="visually-hidden">{labels.close}</span>
          </button>
        </div>
        <nav aria-label={labels.nav}>
          <ul className="mmenu__list">
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} aria-current={pathname === it.href ? 'page' : undefined} onClick={() => setOpen(false)}>
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mmenu__bottom">
          {footer}
          <Link className="btn btn--primary btn--block" href={cta.href} data-enquiry="" onClick={() => setOpen(false)}>
            {cta.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
