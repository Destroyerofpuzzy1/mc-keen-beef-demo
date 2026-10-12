'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import styles from './BackToTop.module.css';

/** Scroll offset (px) after which the tag appears; above it the tag hides again. */
const SHOW_AFTER = 600;
/** The tag hides at once but reappears only after its spot has stayed clear this long (ms). */
const SETTLE_MS = 250;
/** At the end of the page the tag may rise this far (px) to clear the content below it. */
const MAX_LIFT = 128;
/** Keeps the tag this far (px) from the content it avoids. */
const PAD = 6;

/** Controls, links and whole forms in <main>, and links in the footer, are never covered. */
const INTERACTIVE = 'a[href], button, input, select, textarea, summary, label, form, [role="button"]';

type Box = { left: number; right: number; top: number; bottom: number };
const shift = (b: Box, up: number): Box => ({ ...b, top: b.top - up, bottom: b.bottom - up });

/**
 * Floating "back to top" control (UX-001), rendered once in <main> by the [locale] layout:
 * a cream cattle ear tag with an embroidered red arrow (BackToTop.module.css), fixed at the
 * bottom right.
 *
 * - Shown after SHOW_AFTER px and hidden at the top. It never covers a link, control or form
 *   of the page, nor the footer's content (its text, links and marks; the empty footer surface
 *   may lie under it). Checked on scroll, resize and content resize. It hides at once and
 *   reappears once its spot has stayed clear for SETTLE_MS. At the very end of the page, where
 *   nothing moves any more, it rises just above what is in the way (up to MAX_LIFT) instead.
 * - Activation scrolls smoothly to the top (instantly under reduced motion). From the keyboard,
 *   focus continues at the logo link in the header, so it does not stay on a hidden control.
 * - Without JavaScript it is a plain link to "#top" (the top of the document per HTML),
 *   shown by a scroll-driven animation where the browser supports it.
 * State lives in attributes and a CSS variable set here, so scrolling never re-renders React.
 */
export function BackToTop({ label }: { label: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const tag = ref.current;
    if (!tag) return;
    tag.toggleAttribute('data-enhanced', true);
    const main = tag.closest('main');
    const footer = document.querySelector('footer');

    // Closed <details> keep layout boxes in Chromium although nothing is drawn: skip what is not rendered.
    const rendered = (el: Element) => (typeof el.checkVisibility === 'function' ? el.checkVisibility() : true);

    // Line boxes of the footer's visible text, in document coordinates.
    let footerText: Box[] = [];
    const measureFooter = () => {
      footerText = [];
      if (!footer) return;
      const walker = document.createTreeWalker(footer, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const parent = node.parentElement;
        if (!node.textContent?.trim() || !parent || parent.closest('.visually-hidden') || !rendered(parent)) continue;
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          if (r.width > 1 && r.height > 1) footerText.push({ left: r.left, right: r.right, top: r.top + scrollY, bottom: r.bottom + scrollY });
        }
      }
    };

    const near = (r: Box, b: Box) => r.left < b.right + PAD && r.right > b.left - PAD && r.top < b.bottom + PAD && r.bottom > b.top - PAD;
    /** Everything the tag avoids, queried per check because page content changes between routes. */
    const targets = () => [
      ...(main ? Array.from(main.querySelectorAll(INTERACTIVE)) : []).filter((el) => !tag.contains(el)),
      ...(footer ? Array.from(footer.querySelectorAll(`${INTERACTIVE}, svg, img`)) : []),
    ];
    const blocked = (b: Box, els: Element[]) => {
      if (footerText.some((t) => near({ ...t, top: t.top - scrollY, bottom: t.bottom - scrollY }, b))) return true;
      // Line boxes, so a link wrapping over two lines does not count as one wide rectangle.
      return els.some((el) => Array.from(el.getClientRects()).some((r) => r.width > 1 && r.height > 1 && near(r, b)) && rendered(el));
    };

    let lift = 0;
    const setLift = (px: number) => {
      if (px === lift) return;
      lift = px;
      tag.style.setProperty('--lift', `${px}px`);
    };
    const atEnd = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

    /** The tag's box at its normal spot, from layout (unaffected by the show/hide transform). */
    const baseBox = (): Box => {
      const cs = getComputedStyle(tag);
      const de = document.documentElement;
      const right = de.clientWidth - parseFloat(cs.right);
      const bottom = de.clientHeight - parseFloat(cs.bottom) + lift;
      return { left: right - tag.offsetWidth, right, top: bottom - tag.offsetHeight, bottom };
    };

    /** Free position (lift in px) for the tag, or -1 when it must hide. */
    const place = () => {
      if (window.scrollY <= SHOW_AFTER) return -1;
      const base = baseBox();
      const els = targets();
      if (!blocked(base, els)) return 0;
      if (!atEnd()) return -1;
      for (let up = 16; up <= MAX_LIFT; up += 16) if (!blocked(shift(base, up), els)) return up;
      return -1;
    };

    let frame = 0;
    let timer = 0;
    const update = () => {
      frame = 0;
      const next = place();
      if (next < 0) {
        window.clearTimeout(timer);
        timer = 0;
        tag.removeAttribute('data-visible');
        return;
      }
      if (tag.hasAttribute('data-visible')) {
        setLift(next);
        return;
      }
      // Appear only once the spot stays clear, so the tag does not blink over link-dense content.
      if (timer) return;
      timer = window.setTimeout(() => {
        timer = 0;
        const settled = place();
        if (settled >= 0) setLift(settled);
        tag.toggleAttribute('data-visible', settled >= 0);
      }, SETTLE_MS);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measureFooter();
      schedule();
    };

    measureFooter();
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);
    // Content that moves without scrolling (images loading, panels opening) is checked as well.
    const observer = new ResizeObserver(remeasure);
    if (main) observer.observe(main);
    if (footer) observer.observe(footer);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    if (e.detail === 0) {
      // Keyboard or assistive technology: continue from the top of the page.
      document.querySelector<HTMLElement>('.site-head__logo')?.focus({ preventScroll: true });
    } else {
      e.currentTarget.blur();
    }
  };

  return (
    <a ref={ref} href="#top" className={styles.tag} onClick={onClick}>
      <span className={styles.arrow} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </a>
  );
}
