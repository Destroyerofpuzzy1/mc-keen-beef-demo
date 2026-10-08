import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { company } from '@/content/company';
import { entityById, type EntityId } from '@/content/entities';

const SITES: EntityId[] = ['centrala', 'sh', 'sh2', 'cp', 'gmbh'];

/**
 * Markets and locations as an editorial ledger (replaces the decorative Europe map, which
 * showed no readable locations and left out Japan). Two ruled columns: where the group
 * operates (verified entity places) and the markets named by the company. No routes,
 * volumes or country counts.
 */
export function MarketsLedger({ locale, headingLevel = 3 }: { locale: Locale; headingLevel?: 3 | 4 }) {
  const d = getDictionary(locale);
  const H = `h${headingLevel}` as const;
  // Town from the verified place label ("Zakład uboju, Linne"); roles grouped per town.
  const towns = new Map<string, string[]>();
  for (const id of SITES) {
    const e = entityById(id);
    const town = t(e.place, locale).split(', ').slice(1).join(', ');
    towns.set(town, [...(towns.get(town) ?? []), t(e.role, locale)]);
  }
  return (
    <div className="ledger">
      <div className="ledger__col">
        <H className="ledger__title">{d.home.marketsTitle}</H>
        <ol className="ledger__list plain">
          {company.marketRegions.map((m) => (
            <li key={m.name.pl} className="ledger__row">
              <span className="ledger__name">{t(m.name, locale)}</span>
              <span className="ledger__meta">{t(m.region, locale)}</span>
            </li>
          ))}
        </ol>
        <p className="ledger__note">{d.home.marketsNote}</p>
      </div>
      <div className="ledger__col">
        <H className="ledger__title">{d.home.sitesTitle}</H>
        <ul className="ledger__list plain">
          {[...towns].map(([town, roles]) => (
            <li key={town} className="ledger__row">
              <span className="ledger__name ledger__name--sm">{town}</span>
              <span className="ledger__meta">{roles.join(', ')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
