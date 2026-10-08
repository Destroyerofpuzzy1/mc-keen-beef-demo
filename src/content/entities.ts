import type { L } from '@/i18n/config';

/**
 * The five companies of the group. Registration data is copied from the legacy
 * O firmie / Kontakt pages (research/01-content-audit.md §Legal entities).
 * This is the ONLY place these values are written; footer, Zakłady, Kontakt and
 * JSON-LD render from here.
 */
export type EntityId = 'centrala' | 'sh' | 'sh2' | 'cp' | 'gmbh';

export interface Address {
  street: string;
  postalCode: string;
  /** Postal town of the postal code (e.g. Dobra for Linne 47). */
  city: string;
  /** Village the plant is in when it differs from the postal town (Linne → Dobra, Wydrzyn → Wieniawa). */
  locality?: string;
  country: 'PL' | 'DE';
}

/** "miejscowość Linne, poczta Dobra": explains why the address names two places. Null if not needed. */
export function addressNote(a: Address): L | null {
  if (!a.locality || a.locality === a.city) return null;
  return {
    pl: `miejscowość ${a.locality}, poczta ${a.city}`,
    en: `village of ${a.locality}, post office ${a.city}`,
    de: `Ort ${a.locality}, Postort ${a.city}`,
  };
}

export interface Entity {
  id: EntityId;
  /** Anchor used on Kontakt and Zakłady (kept from the legacy URLs where possible). */
  anchor: string;
  role: L;
  /** Short place label for filters and compact lists. */
  place: L;
  legalName: string;
  registeredAddress: Address;
  productionAddress?: Address;
  taxId: { label: 'NIP' | 'VAT No.'; value: string };
  regon?: string;
  krs?: string;
  vetNumber?: string;
  bdo?: string;
  mapUrl: string;
  office: { phone?: string; email?: string };
  dataProtectionEmail: string;
}

/**
 * Lisków (centrala, CP): the legacy g.page share link opened a Google Search page. Google Maps
 * URLs API search for the verified address instead (no guessed coordinates or place id).
 */
const LISKOW_MAP = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('ul. Spółdzielców 13, 62-850 Lisków, Polska')}`;

export const entities: Entity[] = [
  {
    id: 'centrala',
    anchor: 'centrala',
    role: { pl: 'Centrala', en: 'Head office', de: 'Zentrale' },
    place: { pl: 'Centrala, Lisków', en: 'Head office, Lisków', de: 'Zentrale, Lisków' },
    legalName: 'MCKEEN-BEEF Sp. z o.o.',
    registeredAddress: { street: 'ul. Spółdzielców 13', postalCode: '62-850', city: 'Lisków', country: 'PL' },
    taxId: { label: 'NIP', value: 'PL 6912436032' },
    regon: '020912263',
    krs: '0000323059',
    mapUrl: LISKOW_MAP,
    office: { phone: '+48 62 76 35 555' },
    dataProtectionEmail: 'rodo@mckeen-beef.eu',
  },
  {
    id: 'sh',
    anchor: 'zaklad-uboju',
    role: { pl: 'Zakład uboju', en: 'Slaughterhouse', de: 'Schlachtbetrieb' },
    place: { pl: 'Zakład uboju, Linne', en: 'Slaughterhouse, Linne', de: 'Schlachtbetrieb, Linne' },
    legalName: 'MCKEEN-BEEF SH Sp. z o.o.',
    registeredAddress: { street: 'Linne 47', postalCode: '62-730', city: 'Dobra', locality: 'Linne', country: 'PL' },
    taxId: { label: 'NIP', value: 'PL 9680972585' },
    regon: '302170790',
    krs: '0000427658',
    vetNumber: 'PL 30270106 WE',
    bdo: '000023688',
    mapUrl: 'https://goo.gl/maps/g8xDUBLxnmfyYwju5',
    office: { phone: '+48 63 28 96 333', email: 'biuro.linne@mckeen-beef.eu' },
    dataProtectionEmail: 'rodo.sh@mckeen-beef.eu',
  },
  {
    id: 'sh2',
    anchor: 'zaklad-uboju-2',
    role: { pl: 'Zakład uboju II', en: 'Slaughterhouse II', de: 'Schlachtbetrieb II' },
    place: { pl: 'Zakład uboju II, Wydrzyn', en: 'Slaughterhouse II, Wydrzyn', de: 'Schlachtbetrieb II, Wydrzyn' },
    legalName: 'MCKEEN-BEEF SH II Sp. z o.o.',
    registeredAddress: { street: 'ul. Spółdzielców 13', postalCode: '62-850', city: 'Lisków', country: 'PL' },
    productionAddress: { street: 'Wydrzyn 3', postalCode: '26-432', city: 'Wieniawa', locality: 'Wydrzyn', country: 'PL' },
    taxId: { label: 'NIP', value: 'PL 9680997438' },
    regon: '385344770',
    krs: '0000824427',
    vetNumber: 'PL 14233802 WE',
    bdo: '000404720',
    mapUrl: 'https://goo.gl/maps/YykfykTPuSbbboNz6',
    office: { phone: '+48 48 30 61 600', email: 'biuro.sh2@mckeen-beef.eu' },
    dataProtectionEmail: 'rodo.sh2@mckeen-beef.eu',
  },
  {
    id: 'cp',
    anchor: 'zaklad-rozbioru',
    role: { pl: 'Zakład rozbioru', en: 'Cutting plant', de: 'Zerlegebetrieb' },
    place: { pl: 'Zakład rozbioru, Lisków', en: 'Cutting plant, Lisków', de: 'Zerlegebetrieb, Lisków' },
    legalName: 'MCKEEN-BEEF CP Sp. z o.o.',
    registeredAddress: { street: 'ul. Spółdzielców 13', postalCode: '62-850', city: 'Lisków', country: 'PL' },
    taxId: { label: 'NIP', value: 'PL 9680994888' },
    regon: '383196220',
    krs: '0000786603',
    vetNumber: 'PL 30074202 WE',
    bdo: '000140477',
    mapUrl: LISKOW_MAP,
    office: { phone: '+48 62 76 35 555' },
    dataProtectionEmail: 'rodo.cp@mckeen-beef.eu',
  },
  {
    id: 'gmbh',
    anchor: 'sprzedaz',
    role: { pl: 'Sprzedaż', en: 'Sales', de: 'Vertrieb' },
    place: { pl: 'Sprzedaż, Oelde (Niemcy)', en: 'Sales, Oelde (Germany)', de: 'Vertrieb, Oelde' },
    legalName: 'MCKEEN-BEEF SO GmbH',
    registeredAddress: { street: 'Ennigerloher Str. 28', postalCode: '59302', city: 'Oelde', country: 'DE' },
    taxId: { label: 'VAT No.', value: 'DE 290319849' },
    mapUrl: 'https://goo.gl/maps/5yPQCG7TYMjwTQsY7',
    // pending: C-05 — .de domain as listed on the legacy Kontakt page.
    office: { email: 'office@mckeen-beef.de' },
    dataProtectionEmail: 'rodo.gmbh@mckeen-beef.eu',
  },
];

export const entityById = (id: EntityId): Entity => {
  const e = entities.find((x) => x.id === id);
  if (!e) throw new Error(`Unknown entity ${id}`);
  return e;
};

export const countryName: Record<Address['country'], L> = {
  PL: { pl: 'Polska', en: 'Poland', de: 'Polen' },
  DE: { pl: 'Niemcy', en: 'Germany', de: 'Deutschland' },
};
