import type { L } from '@/i18n/config';
import type { EntityId } from './entities';

/**
 * Department contacts exactly as published on the legacy PL Kontakt page
 * (http://www.mckeen-beef.eu/p/kontakt, 2026-10-05; research/01 §Contact).
 * pending: C-26 — confirm the list is current and every person consents to publication.
 */
export type RoutingTag =
  | 'buy-beef'
  | 'offal-uppz'
  | 'sell-cattle'
  | 'quality'
  | 'transport'
  | 'supply'
  | 'jobs'
  | 'accounting'
  | 'general';

export interface Contact {
  id: string;
  entity: EntityId;
  department: L;
  name?: string;
  phone?: string;
  email?: string;
  tags: RoutingTag[];
}

const d = {
  office: { pl: 'Sekretariat / biuro', en: 'Office', de: 'Sekretariat' },
  board: { pl: 'Zarząd spółki', en: 'Management', de: 'Geschäftsleitung' },
  accounting: { pl: 'Dział księgowości', en: 'Accounting', de: 'Buchhaltung' },
  production: { pl: 'Dział produkcyjny', en: 'Production', de: 'Produktion' },
  livestockDirector: { pl: 'Dyrektor skupu żywca', en: 'Head of livestock purchasing', de: 'Leitung Viehankauf' },
  livestock: { pl: 'Dział skupu żywca', en: 'Livestock purchasing', de: 'Viehankauf' },
  quality: { pl: 'Dział kontroli jakości', en: 'Quality control', de: 'Qualitätskontrolle' },
  meatPurchasing: {
    pl: 'Dyrektor zakupu surowca mięsnego',
    en: 'Head of meat raw material purchasing',
    de: 'Leitung Einkauf Fleischrohstoffe',
  },
  nonMeat: {
    pl: 'Dział zakupów, surowiec niemięsny',
    en: 'Purchasing, non-meat materials',
    de: 'Einkauf, Nichtfleisch-Materialien',
  },
  it: { pl: 'Dział IT', en: 'IT', de: 'IT' },
  technical: { pl: 'Dział techniczny', en: 'Technical department', de: 'Technik' },
  offal: {
    pl: 'Sprzedaż podrobów i UPPZ',
    en: 'Offal and animal by-products sales',
    de: 'Verkauf Innereien und tierische Nebenprodukte',
  },
  transport: { pl: 'Dział transportu', en: 'Transport', de: 'Transport' },
  sales: { pl: 'Dział sprzedaży', en: 'Sales', de: 'Vertrieb' },
  dataProtection: {
    pl: 'Administrator danych osobowych',
    en: 'Personal data controller',
    de: 'Verantwortlicher für personenbezogene Daten',
  },
} satisfies Record<string, L>;

export const contacts: Contact[] = [
  // CENTRALA
  { id: 'c-office', entity: 'centrala', department: d.office, phone: '+48 62 76 35 555', tags: ['general'] },
  { id: 'c-board', entity: 'centrala', department: d.board, name: 'Michał Piekarski', phone: '+48 63 28 96 327', tags: [] },
  { id: 'c-acc', entity: 'centrala', department: d.accounting, name: 'Daria Bartoszczyk', phone: '+48 62 76 35 567', tags: ['accounting'] },
  { id: 'c-rodo', entity: 'centrala', department: d.dataProtection, email: 'rodo@mckeen-beef.eu', tags: [] },

  // ZAKŁAD UBOJU (SH, Linne)
  { id: 'sh-office', entity: 'sh', department: d.office, phone: '+48 63 28 96 333', email: 'biuro.linne@mckeen-beef.eu', tags: [] },
  { id: 'sh-board', entity: 'sh', department: d.board, name: 'Dorota McKeen', phone: '+48 63 28 96 350', email: 'dorota@mckeen-beef.eu', tags: [] },
  { id: 'sh-prod', entity: 'sh', department: d.production, name: 'Sławomir Kurtyka', email: 'slawomir.kurtyka@mckeen-beef.eu', tags: [] },
  { id: 'sh-livestock', entity: 'sh', department: d.livestockDirector, name: 'Renata Zduniak', phone: '+48 63 28 96 351', email: 'renata@mckeen-beef.eu', tags: ['sell-cattle'] },
  { id: 'sh-acc', entity: 'sh', department: d.accounting, name: 'Marzena Cichowicz', phone: '+48 63 28 96 365', email: 'marzena@mckeen-beef.eu', tags: ['accounting'] },
  { id: 'sh-quality', entity: 'sh', department: d.quality, name: 'Anna Brożek', phone: '+48 63 28 96 362', email: 'anna.brozek@mckeen-beef.eu', tags: ['quality'] },
  { id: 'sh-meat', entity: 'sh', department: d.meatPurchasing, name: 'Błażej Dębowy', phone: '+48 63 28 96 331', email: 'blazej.debowy@mckeen-beef.eu', tags: ['supply'] },
  { id: 'sh-nonmeat', entity: 'sh', department: d.nonMeat, name: 'Marcelina Tkaczyk', phone: '+48 63 28 96 341', email: 'marcelina.tkaczyk@mckeen-beef.eu', tags: ['supply'] },
  { id: 'sh-it', entity: 'sh', department: d.it, name: 'Bartosz Kwiatkowski', phone: '+48 63 28 96 345', email: 'bartosz.kwiatkowski@mckeen-beef.eu', tags: [] },
  { id: 'sh-tech', entity: 'sh', department: d.technical, name: 'Mariusz Janicki', phone: '+48 511 693 273', tags: [] },
  { id: 'sh-offal', entity: 'sh', department: d.offal, name: 'Monika Urbańczyk', phone: '+48 63 28 96 353', email: 'monika.urbanczyk@mckeen-beef.eu', tags: ['offal-uppz'] },
  { id: 'sh-rodo', entity: 'sh', department: d.dataProtection, email: 'rodo.sh@mckeen-beef.eu', tags: [] },

  // ZAKŁAD UBOJU II (SH II, Wydrzyn / Wieniawa)
  { id: 'sh2-office', entity: 'sh2', department: d.office, phone: '+48 48 30 61 600', email: 'biuro.sh2@mckeen-beef.eu', tags: [] },
  { id: 'sh2-livestock', entity: 'sh2', department: d.livestock, name: 'Małgorzata Będziechowska', phone: '+48 63 28 96 363', email: 'malgorzata.bedziechowska@mckeen-beef.eu', tags: ['sell-cattle'] },
  { id: 'sh2-prod', entity: 'sh2', department: d.production, name: 'Michał Piekarski', phone: '+48 48 30 61 601', email: 'michal@mckeen-beef.eu', tags: [] },
  { id: 'sh2-quality', entity: 'sh2', department: d.quality, phone: '+48 48 30 61 604', email: 'quality.sh2@mckeen-beef.eu', tags: ['quality'] },
  { id: 'sh2-it', entity: 'sh2', department: d.it, name: 'Łukasz Okruta', phone: '+48 48 30 61 603', email: 'it.sh2@mckeen-beef.eu', tags: [] },
  { id: 'sh2-acc', entity: 'sh2', department: d.accounting, name: 'Daria Bartoszczyk', phone: '+48 62 76 35 567', email: 'daria.bartoszczyk@mckeen-beef.eu', tags: ['accounting'] },
  { id: 'sh2-rodo', entity: 'sh2', department: d.dataProtection, email: 'rodo.sh2@mckeen-beef.eu', tags: [] },

  // ZAKŁAD ROZBIORU (CP, Lisków)
  { id: 'cp-office', entity: 'cp', department: d.office, phone: '+48 62 76 35 555', tags: [] },
  { id: 'cp-prod', entity: 'cp', department: d.production, name: 'Tomasz Jankowski', phone: '+48 62 76 35 509', email: 'tomasz.jankowski@mckeen-beef.eu', tags: [] },
  { id: 'cp-transport', entity: 'cp', department: d.transport, name: 'Małgorzata Kaczmarek', phone: '+48 62 76 35 519', email: 'malgorzata.kaczmarek@mckeen-beef.eu', tags: ['transport'] },
  { id: 'cp-acc', entity: 'cp', department: d.accounting, name: 'Aneta Olkowicz', phone: '+48 62 76 35 556', email: 'aneta.olkowicz@mckeen-beef.eu', tags: ['accounting'] },
  { id: 'cp-quality', entity: 'cp', department: d.quality, name: 'Eliza Fiderkiewicz', phone: '+48 62 76 35 524', email: 'quality@mckeen-beef.eu', tags: ['quality'] },
  { id: 'cp-meat', entity: 'cp', department: d.meatPurchasing, name: 'Błażej Dębowy', phone: '+48 62 76 35 531', email: 'blazej.debowy@mckeen-beef.eu', tags: [] },
  { id: 'cp-nonmeat', entity: 'cp', department: d.nonMeat, name: 'Karolina Kwaśniewska', phone: '+48 62 76 35 575', email: 'karolina.kwasniewska@mckeen-beef.eu', tags: ['supply'] },
  { id: 'cp-it', entity: 'cp', department: d.it, name: 'Marcin Kasperek', phone: '+48 62 76 35 545', email: 'it@mckeen-beef.eu', tags: [] },
  { id: 'cp-tech', entity: 'cp', department: d.technical, name: 'Marcin Świderski', phone: '+48 62 76 35 535', email: 'marcin.swiderski@mckeen-beef.eu', tags: [] },
  { id: 'cp-rodo', entity: 'cp', department: d.dataProtection, email: 'rodo.cp@mckeen-beef.eu', tags: [] },

  // DZIAŁ SPRZEDAŻY (MCKEEN-BEEF SO GmbH, Oelde) — pending: C-05 (e-mail domain)
  { id: 'g-office', entity: 'gmbh', department: d.office, email: 'office@mckeen-beef.de', tags: ['buy-beef'] },
  { id: 'g-jay', entity: 'gmbh', department: d.sales, name: 'Jay McKeen', phone: '+49 2522 832828 12', email: 'jay@mckeen-beef.de', tags: ['buy-beef'] },
  { id: 'g-ken', entity: 'gmbh', department: d.sales, name: 'Ken McKeen', phone: '+49 2522 832828 15', email: 'ken@mckeen-beef.de', tags: ['buy-beef'] },
  { id: 'g-rodo', entity: 'gmbh', department: d.dataProtection, email: 'rodo.gmbh@mckeen-beef.eu', tags: [] },
];

/** Recruitment line from the legacy Kariera page. */
export const recruitment = { phone: '+48 62 76 35 577', phoneDisplay: '62 76 35 577', email: 'praca@mckeen-beef.eu' };

/** Primary sales contacts, used in header, footer and product CTAs. */
export const salesContacts = contacts.filter((c) => c.entity === 'gmbh' && c.name);
export const primarySalesPhone = '+49 2522 832828 12';

export const contactsFor = (tag: RoutingTag) => contacts.filter((c) => c.tags.includes(tag));

/** tel: href from a display number. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;
