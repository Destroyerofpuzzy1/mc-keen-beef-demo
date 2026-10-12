import type { CSSProperties } from 'react';
import { icons } from '@/content/media';

/**
 * Beef identity marks (DESIGN-002), styled in src/styles/craft.css. All of them are embroidery:
 * a line drawing used as a CSS mask over the wordmark's red satin-thread texture, raised by a
 * shadow. Decorative only (aria-hidden); the text next to them carries the meaning.
 *
 * Icons: the legacy category line icons (public/photos/icons, from the old site) plus additions
 * drawn in the same style (public/craft/icons) and the brand bull's outline.
 */
export const brandIcons = {
  cow: icons.cow,
  bull: icons.bull,
  steak: icons.steak,
  liver: icons.liver,
  truck: icons.truck,
  handshake: icons.handshake,
  globe: icons.globe,
  knife: '/craft/icons/knife.svg',
  box: '/craft/icons/box.svg',
  cold: '/craft/icons/cold.svg',
  seal: '/craft/icons/seal.svg',
  certificate: '/craft/icons/certificate.svg',
  pin: '/craft/icons/pin.svg',
  clipboard: '/craft/icons/clipboard.svg',
  recycle: '/craft/icons/recycle.svg',
  solar: '/craft/icons/solar.svg',
  biogas: '/craft/icons/biogas.svg',
  cattle: '/craft/cattle-outline.svg',
} as const;

export type BrandIconName = keyof typeof brandIcons;

/** One embroidered icon; size through the --bicon custom property. */
export function BrandIcon({ name, className = '' }: { name: BrandIconName; className?: string }) {
  return <span className={`bicon bicon--${name} ${className}`.trim()} aria-hidden="true" style={{ '--icon': `url(${brandIcons[name]})` } as CSSProperties} />;
}

/**
 * Round embroidered patch: cream felt, a red satin (merrowed) edge, an inner running stitch,
 * "MCKEEN-BEEF" along the top and a short existing label along the bottom, a motif in the middle.
 * `id` keeps the SVG text paths unique on a page.
 */
export function BrandPatch({
  id,
  motif = 'cattle',
  bottom,
  size = 'md',
  className = '',
}: {
  id: string;
  motif?: BrandIconName;
  bottom?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const top = `patch-top-${id}`;
  const low = `patch-bottom-${id}`;
  return (
    <span className={`patch patch--${size} ${className}`.trim()} aria-hidden="true">
      {size !== 'sm' ? (
        <svg className="patch__ring" viewBox="0 0 200 200" focusable="false">
          <path id={top} d="M30 100A70 70 0 0 1 170 100" />
          <path id={low} d="M20 100A80 80 0 0 0 180 100" />
          <text>
            <textPath href={`#${top}`} startOffset="50%">
              MCKEEN-BEEF
            </textPath>
          </text>
          {bottom ? (
            <text>
              <textPath href={`#${low}`} startOffset="50%">
                {bottom}
              </textPath>
            </text>
          ) : null}
          <circle cx="17" cy="100" r="2.6" />
          <circle cx="183" cy="100" r="2.6" />
        </svg>
      ) : null}
      <BrandIcon name={motif} className="patch__motif" />
    </span>
  );
}

/** The brand beef-cuts line art (bull with its cut lines) sewn in red thread. */
export function CutsDiagram({ plate = false, className = '' }: { plate?: boolean; className?: string }) {
  return (
    <span className={`cuts${plate ? ' cuts--plate' : ''} ${className}`.trim()} aria-hidden="true">
      <span className="cuts__art" />
    </span>
  );
}
