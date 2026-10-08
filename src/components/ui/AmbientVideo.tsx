'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Muted decorative loop. The <video> source is attached only on wide screens,
 * without reduced-motion and without data-saver, and only plays while visible.
 * Otherwise the poster image stays. Never carries essential content.
 */
export function AmbientVideo({ src, poster, label, width, height }: { src: string; poster: string; label: string; width: number; height: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 64rem)');
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const update = () => setEnabled(!reduce.matches && wide.matches && !saveData);
    update();
    reduce.addEventListener('change', update);
    wide.addEventListener('change', update);
    return () => {
      reduce.removeEventListener('change', update);
      wide.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v || !enabled) {
      v?.pause();
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [enabled]);

  return (
    <video
      ref={ref}
      className="ambient-video"
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      width={width}
      height={height}
      aria-label={label}
      src={enabled ? src : undefined}
    />
  );
}
