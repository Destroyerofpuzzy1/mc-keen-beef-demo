import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { productionChain } from '@/content/plants';
import { media } from '@/content/media';
import { Horns } from '@/components/ui/Icon';

/**
 * Home page "memorable moment": the integrated chain from livestock purchasing to
 * sales. The connecting rule draws in as the section scrolls into view (CSS
 * scroll-driven animation where supported; static otherwise and under reduced motion).
 * It is a real sequence, so steps are numbered.
 */
export function ProductionChain({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  // Farm → cutting → packed product: each photo matches a stage of the chain.
  const photos = [media.herefordBull, media.butcherCutting, media.staffBeef];

  return (
    <section className="chain" aria-labelledby="chain-h">
      <div className="container">
        <div className="chain__intro">
          <h2 id="chain-h" className="h-section">
            {d.home.chainTitle}
          </h2>
          <p className="lead">{d.home.chainLead}</p>
        </div>
        <div className="chain__photos">
          {photos.map((m) => (
            <figure key={m.src} className="chain__photo">
              <Image src={m.src} alt={t(m.alt, locale)} fill sizes="(min-width: 48rem) 30vw, 34vw" quality={75} style={{ objectPosition: m.position ?? 'center' }} />
            </figure>
          ))}
        </div>
        <ol className="chain__steps">
          {productionChain.map((s, i) => (
            <li key={s.id} className="chain__step" style={{ '--i': i } as CSSProperties}>
              <span className="chain__marker" aria-hidden="true">
                <Horns className="chain__horns" />
              </span>
              <span className="chain__num tnum" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="chain__title">{t(s.title, locale)}</h3>
              <p className="chain__text">{t(s.text, locale)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
