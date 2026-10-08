import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import type { ProductId } from '@/content/products';
import { lineArtBull, media, productMedia } from '@/content/media';

/**
 * Visual for a product group inside a sized, positioned box (tile photo area or a
 * `.photo` frame). Photos are illustrative and carry a small "Zdjęcie poglądowe" note.
 * Groups without an authentic photo (ćwierci) get the brand beef-cuts line art on paper:
 * typography and the existing graphic carry the block instead of a misleading picture.
 */
export function ProductVisual({
  id,
  locale,
  sizes,
  priority = false,
  decorative = false,
}: {
  id: ProductId;
  locale: Locale;
  sizes: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  const key = productMedia[id];
  if (!key) {
    return <span className="pplate" aria-hidden="true" style={{ '--art': `url(${lineArtBull})` } as CSSProperties} />;
  }
  const m = media[key];
  return (
    <>
      <Image
        src={m.src}
        alt={decorative ? '' : t(m.alt, locale)}
        fill
        sizes={sizes}
        priority={priority}
        quality={80}
        style={{ objectPosition: m.position ?? 'center' }}
      />
      <span className="photo-note">{getDictionary(locale).common.illustrative}</span>
    </>
  );
}
