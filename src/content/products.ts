import type { L } from '@/i18n/config';
import type { EntityId } from './entities';

/**
 * Product groups. Names are the four groups of the legacy Katalog image.
 * Statements are limited to facts from certificate scopes and contacts; each fact
 * carries its source. Specifications are pending (C-12).
 */
export type ProductId = 'cwierci' | 'elementy' | 'miesa-drobne' | 'podroby' | 'uppz';

export interface ProductFact {
  label: L;
  value: L;
  /** Short public attribution, e.g. "Zakres certyfikatu BRCGS 2026". */
  source: L;
  /**
   * Plant the evidence covers when the group lists several plants. Evidence for one plant
   * is never extended to another (SH Linne ≠ SH II Wydrzyn, C-51).
   */
  site?: EntityId;
}

export interface ProductGroup {
  id: ProductId;
  name: L;
  icon: 'quarter' | 'cut' | 'trim' | 'offal' | 'byproduct';
  summary: L;
  facts: ProductFact[];
  sites: EntityId[];
  /** Contact routing tag used for the CTA next to the group. */
  route: 'buy-beef' | 'offal-uppz';
}

const srcCp2026: L = {
  pl: 'zakres certyfikatów BRCGS i IFS 2026, zakład rozbioru',
  en: 'scope of the 2026 BRCGS and IFS certificates, cutting plant',
  de: 'Geltungsbereich der BRCGS- und IFS-Zertifikate 2026, Zerlegebetrieb',
};
const srcSh2023: L = {
  pl: 'zakres certyfikatu IFS 2023, zakład uboju w Linne (archiwum)',
  en: 'scope of the 2023 IFS certificate, Linne slaughterhouse (archive)',
  de: 'Geltungsbereich des IFS-Zertifikats 2023, Schlachtbetrieb Linne (Archiv)',
};

const chilledFrozen: L = { pl: 'chłodzone i mrożone', en: 'chilled and frozen', de: 'gekühlt und tiefgefroren' };
const formLabel: L = { pl: 'Forma', en: 'Form', de: 'Zustand' };
const packLabel: L = { pl: 'Pakowanie', en: 'Packing', de: 'Verpackung' };

export const products: ProductGroup[] = [
  {
    id: 'cwierci',
    name: { pl: 'Ćwierci wołowe', en: 'Beef quarters', de: 'Rinderviertel' },
    icon: 'quarter',
    summary: {
      pl: 'Ćwierci wołowe z uboju.',
      en: 'Beef quarters from slaughter.',
      de: 'Rinderviertel aus der Schlachtung.',
    },
    // Only SH Linne is documented (IFS scopes 2019–2023, EKO 2021). SH II (Wydrzyn) is not
    // listed and the summary names no plants until the client confirms its products (C-51, GAP-06).
    facts: [{ label: formLabel, value: chilledFrozen, source: srcSh2023, site: 'sh' }],
    sites: ['sh'],
    route: 'buy-beef',
  },
  {
    id: 'elementy',
    name: { pl: 'Elementy wołowe', en: 'Beef cuts', de: 'Rindfleischteilstücke' },
    icon: 'cut',
    summary: {
      pl: 'Elementy z rozbioru w zakładzie w Liskowie.',
      en: 'Cuts from deboning at the Lisków cutting plant.',
      de: 'Teilstücke aus der Zerlegung im Betrieb in Lisków.',
    },
    facts: [
      { label: formLabel, value: chilledFrozen, source: srcCp2026 },
      {
        label: packLabel,
        value: {
          pl: 'próżniowo oraz luzem w pojemnikach plastikowych i kartonach',
          en: 'vacuum packed, and bulk in plastic containers and cartons',
          de: 'vakuumverpackt sowie lose in Kunststoffbehältern und Kartons',
        },
        source: srcCp2026,
      },
    ],
    sites: ['cp'],
    route: 'buy-beef',
  },
  {
    id: 'miesa-drobne',
    name: { pl: 'Mięsa drobne wołowe', en: 'Beef trimmings', de: 'Rindfleisch-Abschnitte' },
    icon: 'trim',
    summary: {
      pl: 'Mięso drobne pozyskiwane przy rozbiorze wołowiny.',
      en: 'Trimmings obtained during beef cutting.',
      de: 'Abschnitte aus der Rindfleischzerlegung.',
    },
    facts: [],
    sites: ['cp'],
    route: 'buy-beef',
  },
  {
    id: 'podroby',
    name: { pl: 'Podroby wołowe', en: 'Beef offal', de: 'Rinderinnereien' },
    icon: 'offal',
    summary: {
      pl: 'Podroby z uboju. Sprzedaż prowadzi osobny dział w zakładzie uboju w Linne.',
      en: 'Offal from slaughter. Sold by a dedicated department at the Linne slaughterhouse.',
      de: 'Innereien aus der Schlachtung. Verkauf über eine eigene Abteilung im Schlachtbetrieb Linne.',
    },
    facts: [{ label: formLabel, value: chilledFrozen, source: srcSh2023 }],
    sites: ['sh'],
    route: 'offal-uppz',
  },
];

/** Animal by-products: a separate sales route, no product list on the source (C-13). */
export const uppz: ProductGroup = {
  id: 'uppz',
  name: {
    pl: 'Uboczne produkty pochodzenia zwierzęcego (UPPZ)',
    en: 'Animal by-products',
    de: 'Tierische Nebenprodukte',
  },
  icon: 'byproduct',
  summary: {
    pl: 'Sprzedaż UPPZ prowadzi ten sam dział co sprzedaż podrobów.',
    en: 'Animal by-products are sold by the same department as offal.',
    de: 'Tierische Nebenprodukte verkauft dieselbe Abteilung wie die Innereien.',
  },
  facts: [],
  sites: ['sh'],
  route: 'offal-uppz',
};

/** Values accepted by the enquiry form (whitelist). */
export const enquiryProductOptions = ['cwierci', 'elementy', 'miesa-drobne', 'podroby', 'uppz', 'inne'] as const;
export type EnquiryProductOption = (typeof enquiryProductOptions)[number];

export const enquiryProductLabel: Record<EnquiryProductOption, L> = {
  cwierci: products[0].name,
  elementy: products[1].name,
  'miesa-drobne': products[2].name,
  podroby: products[3].name,
  uppz: { pl: 'UPPZ', en: 'Animal by-products', de: 'Tierische Nebenprodukte' },
  inne: { pl: 'Inne', en: 'Other', de: 'Sonstiges' },
};
