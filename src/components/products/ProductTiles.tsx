import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { href } from '@/i18n/routes';
import { products } from '@/content/products';
import { icons, productIcon } from '@/content/media';
import { ProductVisual } from './ProductVisual';

/**
 * Home page product categories: four editorial tiles in an asymmetric 2×2 grid
 * (7/5 then 5/7 columns). Each tile: category visual (ProductVisual), the legacy category icon
 * (CSS mask, brand red), name and a "view" arrow. Category photos are 630–660 px
 * wide sources, so tiles use a fixed photo height and are never shown wider.
 */
export function ProductTiles({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <ul className="ptiles plain">
      {products.map((p) => {
        return (
          <li key={p.id} className="ptile">
            <Link href={`${href(locale, 'products')}#${p.id}`} className="ptile__link">
              <span className="ptile__photo">
                <ProductVisual id={p.id} locale={locale} sizes="(min-width: 64rem) 46vw, 100vw" />
              </span>
              <span className="ptile__body">
                <span className="ptile__icon" aria-hidden="true" style={{ '--icon': `url(${icons[productIcon[p.id]]})` } as CSSProperties} />
                <span className="ptile__text">
                  <span className="ptile__name">{t(p.name, locale)}</span>
                  <span className="ptile__summary">{t(p.summary, locale)}</span>
                </span>
                <span className="ptile__more arrow-link" aria-hidden="true">
                  {d.home.productsMore}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
