import type { L } from '@/i18n/config';
import type { EntityId } from './entities';

/**
 * Open positions. Values from the legacy PL Kariera page only (EN/DE pages carried
 * outdated pay). pending: C-31 (current openings and pay), C-32 (recruitment language).
 */
export interface Job {
  id: string;
  title: L;
  entity: EntityId;
  location: L;
  description: L;
  employmentType: L;
  contract: L;
  schedule: L;
  benefits: L[];
  pay: { label: L; min: number; max: number }[];
  payUnit: L;
  /** Date the content was taken from the legacy site (internal record only, not a publication date). */
  sourceDate: string;
  /**
   * Real publication date of the vacancy, confirmed by HR (C-52). Until it is set, no
   * JobPosting structured data is emitted: datePosted is required and must not be invented.
   */
  datePosted?: string;
}

export const jobs: Job[] = [
  {
    id: 'rozbieracz-wykrawacz',
    title: { pl: 'Rozbieracz-wykrawacz', en: 'Beef deboner and trimmer', de: 'Zerleger und Ausbeiner (Rind)' },
    entity: 'cp',
    location: { pl: 'Lisków', en: 'Lisków, Poland', de: 'Lisków, Polen' },
    description: {
      pl: 'Rozbiór mięsa wołowego: trybowanie i klasowanie. Szukamy osób z doświadczeniem.',
      en: 'Beef cutting: deboning (trybowanie) and trimming/grading (klasowanie). Experience required.',
      de: 'Rindfleischzerlegung: Ausbeinen (trybowanie) und Zuschneiden/Sortieren (klasowanie). Erfahrung erforderlich.',
    },
    employmentType: { pl: 'Pełen etat', en: 'Full time', de: 'Vollzeit' },
    contract: { pl: 'Umowa o pracę', en: 'Employment contract', de: 'Arbeitsvertrag' },
    schedule: {
      pl: 'Poniedziałek–piątek, stałe godziny, jedna zmiana',
      en: 'Monday to Friday, fixed hours, single shift',
      de: 'Montag bis Freitag, feste Arbeitszeiten, eine Schicht',
    },
    benefits: [
      { pl: '2 posiłki dziennie', en: '2 meals a day', de: '2 Mahlzeiten pro Tag' },
      { pl: 'Darmowe zakwaterowanie', en: 'Free accommodation', de: 'Kostenlose Unterkunft' },
    ],
    pay: [
      { label: { pl: 'Klasowanie', en: 'Trimming / grading', de: 'Sortieren / Zuschneiden' }, min: 6500, max: 7500 },
      { label: { pl: 'Trybowanie', en: 'Deboning', de: 'Ausbeinen' }, min: 8000, max: 9000 },
    ],
    payUnit: { pl: 'zł netto miesięcznie', en: 'PLN net per month', de: 'PLN netto pro Monat' },
    sourceDate: '2026-10-05',
  },
];

export const jobPositionOptions = [...jobs.map((j) => j.id), 'inne'] as const;
