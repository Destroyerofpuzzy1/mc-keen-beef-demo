import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { href } from '@/i18n/routes';
import { productionChain } from '@/content/plants';
import { entityById } from '@/content/entities';
import { media } from '@/content/media';
import { Horns } from '@/components/ui/Icon';
import { BrandIcon, BrandPatch } from '@/components/brand/BrandMarks';

/**
 * Home page "memorable moment": the integrated chain from livestock purchasing to
 * sales. The connecting rule draws in as the section scrolls into view (CSS
 * scroll-driven animation where supported; static otherwise and under reduced motion).
 * It is a real sequence, so steps are numbered.
 *
 * UX-IA-001 stage 1: a step links to the place where it is described, labelled with the
 * site's existing names (plant, contact topic). Packing and transport have no link: the product
 * range above and the sales section below already lead there.
 */
export function ProductionChain({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  // Farm → cutting → packed product: each photo matches a stage of the chain.
  const photos = [media.herefordBull, media.butcherCutting, media.staffBeef];
  const plant = (id: 'sh' | 'sh2' | 'cp' | 'gmbh') => {
    const e = entityById(id);
    return { href: href(locale, 'plants', e.anchor), label: t(e.place, locale) };
  };
  const stepLinks: Record<string, { href: string; label: string }[]> = {
    skup: [{ href: `${href(locale, 'contact')}?temat=sell-cattle#pomoc`, label: d.contact.routes['sell-cattle'] }],
    uboj: [plant('sh'), plant('sh2')],
    rozbior: [plant('cp')],
    chlodzenie: [{ href: href(locale, 'plants', 'mroznia'), label: d.plants.coldTitle }],
    sprzedaz: [plant('gmbh')],
  };

  return (
    <section className="chain" aria-labelledby="chain-h">
      <div className="container">
        {/* Group line and process summary moved here from the hero (HERO-002). */}
        <div className="chain__intro">
          {/* The group's embroidered patch (decorative); place and year are on the trust strip. */}
          <BrandPatch id="chain" motif="cattle" bottom="LISKÓW · 2009" className="chain__patch" />
          <p className="eyebrow-plain">{d.home.heroLabel}</p>
          <h2 id="chain-h" className="h-section">
            {d.home.chainTitle}
          </h2>
          <p className="lead">
            {d.home.heroSub} {d.home.chainLead}
          </p>
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
              <span className="chain__badge" aria-hidden="true">
                <span className="chain__num tnum">{i + 1}</span>
                <BrandIcon name={s.icon} className="chain__icon" />
              </span>
              <h3 className="chain__title">{t(s.title, locale)}</h3>
              <p className="chain__text">{t(s.text, locale)}</p>
              {stepLinks[s.id] ? (
                <ul className="chain__links plain">
                  {stepLinks[s.id]!.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="arrow-link chain__link">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="chain__more">
          <Link href={href(locale, 'plants')} className="btn btn--ghost-light btn--arrow">
            {d.plants.title}
          </Link>
        </p>
      </div>
    </section>
  );
}
