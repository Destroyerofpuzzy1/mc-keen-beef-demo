import type { L } from '@/i18n/config';

/** Group-level facts. Sources: research/01-content-audit.md §Company, §Export. */
export const company = {
  brand: 'McKeen Beef',
  groupName: 'Grupa MCKEEN-BEEF',
  foundedYear: 2009,
  foundedPlace: 'Lisków',
  /** Only markets named on the legacy site (Home, value block "Jakość"). */
  namedMarkets: [
    { pl: 'Polska', en: 'Poland', de: 'Polen' },
    { pl: 'Japonia', en: 'Japan', de: 'Japan' },
    { pl: 'Kraje skandynawskie', en: 'Scandinavian countries', de: 'Skandinavische Länder' },
  ] satisfies L[],
  /**
   * Same three markets with a plain geographic region for the markets ledger.
   * Regions are geography only, not export volumes, routes or approvals (C-18).
   */
  marketRegions: [
    { name: { pl: 'Polska', en: 'Poland', de: 'Polen' }, region: { pl: 'Rynek krajowy', en: 'Home market', de: 'Heimatmarkt' } },
    {
      name: { pl: 'Kraje skandynawskie', en: 'Scandinavian countries', de: 'Skandinavische Länder' },
      region: { pl: 'Europa Północna', en: 'Northern Europe', de: 'Nordeuropa' },
    },
    { name: { pl: 'Japonia', en: 'Japan', de: 'Japan' }, region: { pl: 'Azja', en: 'Asia', de: 'Asien' } },
  ] satisfies { name: L; region: L }[],
  facebook: 'https://www.facebook.com/mckeenbeef/',
  /** Group functions as listed on the legacy site. */
  functions: {
    pl: 'zakład uboju, zakład rozbioru i pakowania, mroźnia oraz chłodnia; terminowe dostawy i sprzedaż prowadzą dedykowane zespoły',
    en: 'slaughterhouse, cutting and packing plant, freezer store and cold store; delivery and sales are run by dedicated teams',
    de: 'Schlachtbetrieb, Zerlege- und Verpackungsbetrieb, Tiefkühllager und Kühlhaus; Lieferung und Vertrieb übernehmen eigene Teams',
  } satisfies L,
};

/** Polish slogan of the legacy site, kept as the brand line in PL. */
export const brandLine: L = {
  pl: 'Polska wołowina jakościowa',
  en: 'Quality beef from Poland',
  de: 'Qualitätsrindfleisch aus Polen',
};
