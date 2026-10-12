'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { Icon } from '@/components/ui/Icon';
import { DrumMotion, drumIndex, wheelSteps, type DrumPhase } from './drum-motion';
import styles from './DrumNav.module.css';

type Item = { href: string; label: string };
export interface DrumLabels {
  previous: string;
  next: string;
  hint: string;
  keyboard: string;
}

/** Detent change for a pointer/wheel movement, kept on the rail: dragging never wraps around. */
function bounded(controller: DrumMotion | null, count: number, delta: number) {
  if (!controller) return 0;
  if (controller.position < 0 || controller.position > count - 1) controller.sync(drumIndex(controller.position, count));
  return Math.max(0, Math.min(count - 1, controller.position + delta)) - controller.position;
}

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/**
 * Desktop selector: all nine pages as real links on a stitched rail, and a revolver carriage
 * that rides along it. The carriage carries a small reel (a nine-face cylinder) that turns one
 * face per page as it travels, so the chosen label rolls into place under the red marks. It
 * lifts out of the channel, leans into its travel and drops back into the detent on arrival,
 * then the lock clicks. Positions are detents of the shared motion controller; only the final
 * lock navigates. Progressive enhancement: the plain links work before hydration and without
 * JavaScript.
 */
export function DrumNav({ items, label, labels }: { items: Item[]; label: string; labels: DrumLabels }) {
  const pathname = usePathname();
  const router = useRouter();
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [selected, setSelected] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const carriage = useRef<HTMLSpanElement>(null);
  const tabs = useRef<(HTMLAnchorElement | null)[]>([]);
  const motion = useRef<DrumMotion | null>(null);
  const spacing = useRef(80);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClick = useRef(false);
  const drag = useRef<{ id: number; x: number; y: number; lastX: number; time: number; speed: number; moved: boolean } | null>(null);
  const hintId = useId();
  const count = items.length;
  // Locale home paths (/en, /de) must not match every subpage by prefix.
  const currentIndex = enhanced ? items.findIndex((item) => pathname === item.href) : -1;

  function clearWheelTimer() {
    if (wheelTimer.current !== null) clearTimeout(wheelTimer.current);
    wheelTimer.current = null;
  }

  function cancelInteraction() {
    clearWheelTimer();
    drag.current = null;
    const controller = motion.current;
    if (controller) controller.sync(Math.round(controller.position));
  }

  useEffect(() => {
    const element = root.current;
    const track = rail.current;
    const cart = carriage.current;
    const links = tabs.current;
    if (!element || !track || !cart) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 76rem)');
    const centres: number[] = [];
    const widths: number[] = [];
    let paintedIndex = -1;
    let settledIndex = -1;

    const measure = () => {
      const origin = track.getBoundingClientRect().left;
      links.forEach((link, i) => {
        if (!link) return;
        const box = link.getBoundingClientRect();
        centres[i] = box.left - origin + box.width / 2;
        widths[i] = box.width;
      });
      if (centres.length > 1) spacing.current = (centres[count - 1] - centres[0]) / (count - 1);
    };
    // Between two neighbouring tabs the carriage slides and resizes. Across the Contact/Home seam
    // it runs back along the whole rail, eased so that it leaves and arrives at a normal step's pace.
    const locate = (position: number) => {
      const base = Math.floor(position);
      const from = ((base % count) + count) % count;
      const to = (from + 1) % count;
      let fraction = position - base;
      if (to === 0) {
        const k = Math.min(1, spacing.current / Math.max(1, Math.abs(centres[0] - centres[from])));
        fraction *= k + fraction * (3 - 3 * k + fraction * (2 * k - 2));
      }
      return { x: centres[from] + (centres[to] - centres[from]) * fraction, w: widths[from] + (widths[to] - widths[from]) * fraction };
    };
    let shownX = 0;
    let targetX = 0;
    const place = (position: number, phase: DrumPhase) => {
      if (centres.length < count) return;
      let { x, w } = locate(position);
      targetX = locate(controller.target).x;
      // The detent swing (or a flick) past the first or last tab continues the way the carriage
      // came instead of jumping to the far end of the seam.
      const direction = phase === 'snapping' || phase === 'locked' ? Math.sign(controller.target - controller.origin)
        : phase === 'coasting' ? Math.sign(controller.velocity) : 0;
      const beyond = (position - controller.target) * direction;
      if (beyond > 0 && beyond < 0.5) {
        const way = Math.sign(targetX - locate(controller.target - direction * 0.25).x);
        const index = drumIndex(controller.target, count);
        if ((way > 0 && index === count - 1) || (way < 0 && index === 0)) {
          x = targetX + way * beyond * spacing.current;
          w = widths[index];
        }
      }
      shownX = x;
      cart.style.setProperty('--x', `${x}px`);
      cart.style.setProperty('--w', `${w}px`);
      cart.style.setProperty('--turn', `${position * (360 / count)}deg`);
    };

    // Spatial dynamics, written to CSS variables once per frame (no React updates): the carriage
    // lifts out of the channel as it leaves and while it is held, leans into its travel, and comes
    // down into the detent over the last 44 px. A light spring (≈ 8 Hz, damping 0.55) carries the
    // lean, so the detent swing rocks the carriage back once (≈ 3.5°) before it settles.
    let phase: DrumPhase = 'idle';
    let frame = 0;
    let sampleX = Number.NaN;
    let sampleTime = 0;
    let lift = 0;
    let tilt = 0;
    let tiltSpeed = 0;
    const setDynamics = () => {
      cart.style.setProperty('--lift', lift.toFixed(3));
      cart.style.setProperty('--tilt', tilt.toFixed(3));
    };
    const dynamics = (time: number) => {
      frame = 0;
      const fresh = Number.isNaN(sampleX);
      const dt = fresh ? 16 : Math.min(48, Math.max(1, time - sampleTime));
      const speed = fresh ? 0 : (shownX - sampleX) / dt;
      sampleX = shownX;
      sampleTime = time;
      const goalLift = phase === 'dragging' || phase === 'coasting' ? 0.75 : phase === 'snapping' ? Math.min(1, Math.abs(targetX - shownX) / 44) : 0;
      const goalTilt = Math.sign(speed) * Math.min(1, (Math.abs(speed) / 1.6) ** 0.4);
      lift += (goalLift - lift) * (1 - Math.exp(-dt / (goalLift > lift ? 55 : 22)));
      for (let rest = dt; rest > 0; rest -= 4) {
        const h = Math.min(4, rest);
        tiltSpeed += (0.0049 * (goalTilt - tilt) - 0.077 * tiltSpeed) * h;
        tilt += tiltSpeed * h;
      }
      tilt = Math.max(-1, Math.min(1, tilt));
      if (phase === 'idle' && Math.abs(lift) < 0.003 && Math.abs(tilt) < 0.003 && Math.abs(tiltSpeed) < 0.0005) {
        lift = tilt = tiltSpeed = 0;
        sampleX = Number.NaN;
      } else {
        frame = requestAnimationFrame(dynamics);
      }
      setDynamics();
    };
    // The lock: the carriage seats with a short press and the stitch marks close on the label.
    const click = () => {
      if (typeof cart.animate !== 'function') return;
      const press = (distance: string, pseudoElement?: string) => cart.animate(
        [{ translate: '0 0' }, { translate: `0 ${distance}`, offset: 0.3 }, { translate: '0 0' }],
        { duration: 170, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)', pseudoElement },
      );
      press('0.8px');
      press('1.5px', '::before');
      press('-1.5px', '::after');
    };
    setDynamics();

    const controller = new DrumMotion({
      count,
      now: () => performance.now(),
      frame: (callback) => requestAnimationFrame(callback),
      cancelFrame: (id) => cancelAnimationFrame(id),
      paint(position, next) {
        const previous = phase;
        phase = next;
        place(position, next);
        if (controller.reduced) {
          cancelAnimationFrame(frame);
          frame = 0;
          lift = tilt = tiltSpeed = 0;
          setDynamics();
        } else {
          if (!frame) frame = requestAnimationFrame(dynamics);
          if (next === 'idle' && previous === 'locked') click();
        }
        element.dataset.phase = next;
        const index = drumIndex(position, count);
        if (next === 'locked' || next === 'idle') {
          // Announce settled keyboard choices, never every tab crossed during a gesture.
          if (settledIndex !== -1 && settledIndex !== index) setAnnouncement(items[index].label);
          settledIndex = index;
        }
        if (paintedIndex !== index) {
          paintedIndex = index;
          setSelected(index);
        }
      },
      onLock(index) {
        clearWheelTimer();
        // Only trusted, localised navigation hrefs reach the router.
        if (desktop.matches && document.visibilityState === 'visible' && items[index].href !== window.location.pathname) {
          router.push(items[index].href);
        }
      },
    });
    motion.current = controller;
    controller.reduced = reduced.matches;
    measure();
    const routeIndex = items.findIndex((item) => pathname === item.href);
    controller.sync(Math.max(0, routeIndex));

    // Label widths change when the web font arrives and with the viewport: re-measure, re-place.
    const resize = new ResizeObserver(() => {
      measure();
      place(controller.position, phase);
    });
    links.forEach((link) => { if (link) resize.observe(link); });

    const cancel = () => {
      clearWheelTimer();
      drag.current = null;
      controller.sync(Math.round(controller.position));
    };
    const onPreference = () => {
      controller.reduced = reduced.matches;
      cancel();
    };
    const onVisibility = () => { if (document.hidden) cancel(); };
    const onOutside = (event: globalThis.PointerEvent) => {
      if (!element.contains(event.target as Node)) cancel();
    };
    const onExternalLink = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest('a');
      if (anchor && !element.contains(anchor)) cancel();
    };
    const onWheel = (event: WheelEvent) => {
      // Only sideways gestures (trackpad swipe, tilt wheel) turn the selector; vertical wheel
      // movement always scrolls the page. Browser zoom and non-cancellable packets are ignored.
      if (!desktop.matches || event.ctrlKey || event.metaKey || !event.cancelable) return;
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || !event.deltaX) return;
      event.preventDefault();
      clearWheelTimer();
      controller.drag(bounded(controller, count, wheelSteps(event.deltaX, event.deltaMode, track.clientHeight)));
      // Trackpads already supply momentum: wait for their tail instead of adding a second one.
      wheelTimer.current = setTimeout(() => controller.release(), 160);
    };
    track.addEventListener('wheel', onWheel, { passive: false });
    reduced.addEventListener('change', onPreference);
    desktop.addEventListener('change', cancel);
    window.addEventListener('popstate', cancel);
    window.addEventListener('blur', cancel);
    window.addEventListener('mb:enquiry-open', cancel);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('pointerdown', onOutside, true);
    document.addEventListener('click', onExternalLink, true);
    return () => {
      controller.cancel();
      cancelAnimationFrame(frame);
      motion.current = null;
      clearWheelTimer();
      drag.current = null;
      resize.disconnect();
      track.removeEventListener('wheel', onWheel);
      reduced.removeEventListener('change', onPreference);
      desktop.removeEventListener('change', cancel);
      window.removeEventListener('popstate', cancel);
      window.removeEventListener('blur', cancel);
      window.removeEventListener('mb:enquiry-open', cancel);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('pointerdown', onOutside, true);
      document.removeEventListener('click', onExternalLink, true);
    };
  }, [count, items, pathname, router]);

  function select(index: number, commit = true) {
    clearWheelTimer();
    motion.current?.select(index, commit);
  }

  function step(direction: number, commit: boolean) {
    clearWheelTimer();
    motion.current?.step(direction, commit);
  }

  /** Roving focus follows the previewed tab, so Enter opens exactly what the selector shows. */
  function focusTarget() {
    const controller = motion.current;
    if (controller) tabs.current[drumIndex(controller.target, count)]?.focus({ preventScroll: true });
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelInteraction();
      return;
    }
    if (!(event.target as HTMLElement).closest('a') || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowRight' ? 1 : -1, false);
      focusTarget();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      select(event.key === 'Home' ? 0 : count - 1, false);
      focusTarget();
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !event.isPrimary || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    clearWheelTimer();
    suppressClick.current = false;
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, time: event.timeStamp, speed: 0, moved: false };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    if (!gesture.moved) {
      if (Math.abs(event.clientY - gesture.y) > Math.abs(dx) && Math.abs(event.clientY - gesture.y) > 7) {
        cancelInteraction();
        return;
      }
      if (Math.abs(dx) < 7) return;
      gesture.moved = true;
      motion.current?.cancel();
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    event.preventDefault();
    const time = event.timeStamp;
    // The carriage follows the pointer: one detent per tab spacing.
    const delta = bounded(motion.current, count, (event.clientX - gesture.lastX) / spacing.current);
    gesture.speed = gesture.speed * 0.25 + (delta / Math.max(8, time - gesture.time)) * 0.75;
    gesture.time = time;
    gesture.lastX = event.clientX;
    motion.current?.drag(delta);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    if (gesture.moved) {
      suppressClick.current = true;
      motion.current?.release(event.timeStamp - gesture.time > 80 ? 0 : gesture.speed);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <nav ref={root} className={styles.nav} aria-label={label} data-enhanced={enhanced || undefined} data-selected={selected} onKeyDown={onKey}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) cancelInteraction(); }}>
      <button type="button" className={styles.arrow} aria-label={labels.previous} onClick={() => step(-1, true)}><Icon name="chevron" size={14} /></button>
      <div ref={rail} className={styles.rail} title={enhanced ? labels.hint : undefined}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        onPointerCancel={cancelInteraction} onLostPointerCapture={() => { if (drag.current) cancelInteraction(); }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (suppressClick.current && event.detail !== 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
        }}>
        <ul className={styles.tabs}>
          {items.map((item, index) => (
            <li key={item.href}>
              <Link ref={(link) => { tabs.current[index] = link; }} href={item.href} className={styles.tab} data-front={selected === index || undefined}
                aria-current={currentIndex === index ? 'page' : undefined} aria-describedby={hintId}
                tabIndex={enhanced ? (selected === index ? 0 : -1) : undefined} draggable={false}
                onNavigate={(event) => { event.preventDefault(); select(index); }}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <span ref={carriage} className={styles.carriage} aria-hidden="true">
          <span className={styles.reel}>
            <span className={styles.rotor}>
              {items.map((item, index) => (
                <span key={item.href} className={styles.face} style={{ '--face': `${index * (-360 / count)}deg` } as CSSProperties}>{item.label}</span>
              ))}
            </span>
          </span>
        </span>
      </div>
      <button type="button" className={styles.arrow} aria-label={labels.next} onClick={() => step(1, true)}><Icon name="chevron" size={14} /></button>
      <p id={hintId} className="visually-hidden">{labels.keyboard}</p>
      <span role="status" aria-live="polite" aria-atomic="true" className="visually-hidden">{announcement}</span>
    </nav>
  );
}
