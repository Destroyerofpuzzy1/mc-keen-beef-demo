/**
 * Small functional line icons (contact and document actions only).
 * Decorative animal icons from the legacy sprite are deliberately not reused:
 * they were embedded bitmaps (docs/asset-map.md).
 */
const paths = {
  phone: 'M6.6 3.5h3l1.3 4.2-2 1.3a12 12 0 0 0 6.1 6.1l1.3-2 4.2 1.3v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z',
  mail: 'M3.5 6.5h17v11h-17zM3.8 6.8 12 13l8.2-6.2',
  download: 'M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19.5h14',
  pin: 'M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  external: 'M14 4.5h5.5V10M19.5 4.5 11 13M17 14v5.5H4.5V7H10',
  check: 'M5 12.5 10 17l9-10',
  doc: 'M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4M9 12h6M9 15.5h6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  chevron: 'M9 5.5 15.5 12 9 18.5',
  zoom: 'M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM15 15l5 5M10.5 8v5M8 10.5h5',
  zoomOut: 'M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM15 15l5 5M8 10.5h5',
  pause: 'M8.5 5.5v13M15.5 5.5v13',
  play: 'M7.5 5.5v13l11-6.5Z',
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** The McKeen horns mark (vector extracted from the legacy sprite). */
export function Horns({ className, title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox="768 140 70 36" fill="currentColor" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d="M799.8,149.5c-0.1-2.2-1.8-4.4-3.8-4.4c-0.1,0-3.1,0-3.1,0s-8.1,0-11.7,0c-1,0-8.7,0.5-11.6-3.9 c-0.3-0.4-0.8-0.2-0.8,0.3c0.6,4.1,2.5,8.7,8.6,8.7h16.2c0.9,0,1.7,0.8,1.8,2l1.9,18c0.3,2.8,2.2,4.9,4.6,4.9l0,0L799.8,149.5z" />
      <path d="M806.2,149.5c0.1-2.2,1.8-4.4,3.8-4.4c0.1,0,3.1,0,3.1,0s8.1,0,11.7,0c1,0,8.7,0.5,11.6-3.9 c0.3-0.4,0.8-0.2,0.8,0.3c-0.6,4.1-2.5,8.7-8.6,8.7h-16.2c-0.9,0-1.7,0.8-1.8,2l-1.9,18c-0.3,2.8-2.2,4.9-4.6,4.9l0,0L806.2,149.5 z" />
    </svg>
  );
}
