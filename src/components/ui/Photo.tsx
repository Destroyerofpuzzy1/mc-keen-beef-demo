import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import type { MediaItem } from '@/content/media';

/**
 * Framed photograph with a fixed aspect ratio (stable geometry in every language),
 * object-fit cover and an optional restrained reveal (clip + 1.03 → 1 scale,
 * CSS scroll-driven, disabled under reduced motion).
 */
export function Photo({
  item,
  locale,
  sizes,
  ratio = '4 / 3',
  className = '',
  priority = false,
  reveal = false,
  decorative = false,
  quality = 75,
}: {
  item: MediaItem;
  locale: Locale;
  sizes: string;
  ratio?: string;
  className?: string;
  priority?: boolean;
  reveal?: boolean;
  decorative?: boolean;
  quality?: 75 | 80;
}) {
  const style = { '--ratio': ratio, '--pos': item.position ?? 'center' } as CSSProperties;
  return (
    <figure className={`photo${reveal ? ' photo--reveal' : ''} ${className}`.trim()} style={style}>
      <Image
        src={item.src}
        alt={decorative ? '' : item.alt[locale]}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
      />
    </figure>
  );
}
