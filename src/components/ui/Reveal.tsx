'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const SELECTOR =
  '.photo--reveal, .cblock__body, .facility .entity, .poverview__item, .timeline__item, .chain__step, .cert-label, .job, .doc, .trust__item, .ptile, .control__row';

/**
 * One-shot section reveals. Adds `js-reveal` to <html> (so content stays visible
 * without JavaScript), then marks elements `is-in` the first time they enter the
 * viewport. Elements already on screen are shown immediately. Re-scans on navigation.
 * Skipped entirely under prefers-reduced-motion.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    root.classList.add('js-reveal');
    const els = [...document.querySelectorAll<HTMLElement>(SELECTOR)].filter((el) => !el.classList.contains('is-in'));
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    for (const el of els) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add('is-in');
      else io.observe(el);
    }
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
