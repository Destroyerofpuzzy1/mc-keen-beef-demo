import type { ReactNode } from 'react';

/**
 * Re-mounted on every navigation (unlike layout), so `.page-enter` replays a short
 * opacity/translate entrance for the new page content. Pure CSS, no loader;
 * disabled under prefers-reduced-motion.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
