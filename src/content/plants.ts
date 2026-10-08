import type { L } from '@/i18n/config';
import type { EntityId } from './entities';

/**
 * What each company does, in the words of the legacy site, and the production
 * chain shown on the homepage. No operational details beyond the source
 * (research/01 §Production, §Logistics). pending: C-08, C-10.
 */
export interface EntityProfile {
  entity: EntityId;
  activity: L;
  details: L[];
}

export const entityProfiles: EntityProfile[] = [
  {
    entity: 'centrala',
    activity: { pl: 'Spółka centralna grupy', en: 'Group head office company', de: 'Zentrale der Gruppe' },
    details: [],
  },
  {
    entity: 'sh',
    activity: { pl: 'Ubój bydła', en: 'Cattle slaughter', de: 'Rinderschlachtung' },
    details: [
      { pl: 'Własny dział skupu żywca', en: 'Own livestock purchasing department', de: 'Eigene Viehankaufsabteilung' },
      { pl: 'Sprzedaż podrobów i UPPZ', en: 'Offal and animal by-products sales', de: 'Verkauf von Innereien und tierischen Nebenprodukten' },
      { pl: 'Biogazownia rolnicza w Linne (projekt UE)', en: 'Agricultural biogas plant in Linne (EU project)', de: 'Landwirtschaftliche Biogasanlage in Linne (EU-Projekt)' },
    ],
  },
  {
    entity: 'sh2',
    activity: { pl: 'Ubój bydła', en: 'Cattle slaughter', de: 'Rinderschlachtung' },
    details: [{ pl: 'Własny dział skupu żywca', en: 'Own livestock purchasing department', de: 'Eigene Viehankaufsabteilung' }],
  },
  {
    entity: 'cp',
    activity: { pl: 'Rozbiór i pakowanie wołowiny', en: 'Beef cutting and packing', de: 'Zerlegung und Verpackung von Rindfleisch' },
    details: [
      { pl: 'Mroźnia zintegrowana z zakładem rozbioru (od 2012)', en: 'Freezer store integrated with the cutting plant (since 2012)', de: 'In den Zerlegebetrieb integriertes Tiefkühllager (seit 2012)' },
      { pl: 'Dział transportu', en: 'Transport department', de: 'Transportabteilung' },
    ],
  },
  {
    entity: 'gmbh',
    activity: { pl: 'Sprzedaż', en: 'Sales', de: 'Vertrieb' },
    details: [],
  },
];

export interface ChainStep {
  id: string;
  title: L;
  text: L;
  entities: EntityId[];
  icon: 'cow' | 'knife' | 'box' | 'cold' | 'truck' | 'handshake' | 'bull';
}

export const productionChain: ChainStep[] = [
  {
    id: 'skup',
    icon: 'cow',
    title: { pl: 'Skup żywca', en: 'Livestock purchasing', de: 'Viehankauf' },
    text: {
      pl: 'Działy skupu żywca w zakładach uboju w Linne i Wydrzynie. Wołowina ze sprawdzonych hodowli.',
      en: 'Livestock purchasing departments at the Linne and Wydrzyn slaughterhouses. Beef from verified farms.',
      de: 'Viehankaufsabteilungen in den Schlachtbetrieben Linne und Wydrzyn. Rindfleisch aus geprüften Betrieben.',
    },
    entities: ['sh', 'sh2'],
  },
  {
    id: 'uboj',
    icon: 'bull',
    title: { pl: 'Ubój', en: 'Slaughter', de: 'Schlachtung' },
    text: {
      pl: 'Dwa zakłady uboju: Linne i Wydrzyn. Ubój przy zachowaniu dobrostanu zwierząt.',
      en: 'Two slaughterhouses: Linne and Wydrzyn. Slaughter with respect for animal welfare.',
      de: 'Zwei Schlachtbetriebe: Linne und Wydrzyn. Schlachtung unter Wahrung des Tierwohls.',
    },
    entities: ['sh', 'sh2'],
  },
  {
    id: 'rozbior',
    icon: 'knife',
    title: { pl: 'Rozbiór', en: 'Cutting', de: 'Zerlegung' },
    text: {
      pl: 'Zakład rozbioru w Liskowie. Elementy i mięsa drobne wołowe.',
      en: 'Cutting plant in Lisków. Beef cuts and trimmings.',
      de: 'Zerlegebetrieb in Lisków. Teilstücke und Abschnitte.',
    },
    entities: ['cp'],
  },
  {
    id: 'pakowanie',
    icon: 'box',
    title: { pl: 'Pakowanie', en: 'Packing', de: 'Verpackung' },
    text: {
      pl: 'Próżniowo oraz luzem w pojemnikach plastikowych i kartonach.',
      en: 'Vacuum packed, and bulk in plastic containers and cartons.',
      de: 'Vakuumverpackt sowie lose in Kunststoffbehältern und Kartons.',
    },
    entities: ['cp'],
  },
  {
    id: 'chlodzenie',
    icon: 'cold',
    title: { pl: 'Mroźnia i chłodnia', en: 'Freezing and cold storage', de: 'Tiefkühlung und Kühlhaus' },
    text: {
      pl: 'Mroźnia przy zakładzie rozbioru od 2012 roku, niezależna chłodnia składowa od 2013 roku.',
      en: 'Freezer store at the cutting plant since 2012, independent cold storage warehouse since 2013.',
      de: 'Tiefkühllager am Zerlegebetrieb seit 2012, eigenständiges Kühlhaus seit 2013.',
    },
    entities: ['cp'],
  },
  {
    id: 'transport',
    icon: 'truck',
    title: { pl: 'Transport', en: 'Transport', de: 'Transport' },
    text: {
      pl: 'Własny dział transportu odpowiada za terminowe dostawy.',
      en: 'An in-house transport department handles on-time delivery.',
      de: 'Eine eigene Transportabteilung sorgt für termingerechte Lieferungen.',
    },
    entities: ['cp'],
  },
  {
    id: 'sprzedaz',
    icon: 'handshake',
    title: { pl: 'Sprzedaż', en: 'Sales', de: 'Vertrieb' },
    text: {
      pl: 'MCKEEN-BEEF SO GmbH w Oelde (Niemcy). Odbiorcy w Polsce i za granicą.',
      en: 'MCKEEN-BEEF SO GmbH in Oelde, Germany. Customers in Poland and abroad.',
      de: 'MCKEEN-BEEF SO GmbH in Oelde. Kunden in Polen und im Ausland.',
    },
    entities: ['gmbh'],
  },
];
