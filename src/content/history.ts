import type { L } from '@/i18n/config';

/**
 * Milestones from the legacy O firmie page (PL/EN/DE) and the 2023 tax strategy
 * documents. Capacity values are historical and must be labelled as such
 * (pending: C-06 for current capacity).
 */
export interface Milestone {
  year: string;
  title: L;
  text: L;
  /** Historical figure shown as data, always with the "historical" label. */
  figure?: { value: string; unit: L };
  source: string;
}

export const history: Milestone[] = [
  {
    year: '2009',
    title: { pl: 'Start w Liskowie', en: 'Start in Lisków', de: 'Start in Lisków' },
    text: {
      pl: 'MCKEEN-BEEF Sp. z o.o. rozpoczyna działalność w Liskowie koło Kalisza. Na początku tylko rozbiór i pakowanie wołowiny.',
      en: 'MCKEEN-BEEF Sp. z o.o. starts operating in Lisków near Kalisz. Initially cutting and packing of beef only.',
      de: 'MCKEEN-BEEF Sp. z o.o. nimmt in Lisków bei Kalisz den Betrieb auf. Zu Beginn ausschließlich Zerlegung und Verpackung von Viertelware.',
    },
    figure: { value: '100 t', unit: { pl: 'wołowiny dziennie, potencjał rozbioru', en: 'of beef per day, cutting capacity', de: 'Rindfleisch pro Tag, Zerlegekapazität' } },
    source: 'PT:p_o-firmie, PT:de_p_uber-uns',
  },
  {
    year: '2010',
    title: { pl: 'Certyfikowany system jakości', en: 'Certified quality system', de: 'Zertifiziertes Qualitätssystem' },
    text: {
      pl: 'Od 2010 roku firma korzysta z certyfikowanego systemu zarządzania jakością zgodnego z IFS i BRC.',
      en: 'Since 2010 the company has operated a certified quality management system in line with IFS and BRC.',
      de: 'Seit 2010 arbeitet das Unternehmen mit einem nach IFS und BRC zertifizierten Qualitätsmanagementsystem.',
    },
    source: 'PT:p_jakosc (pending: C-09)',
  },
  {
    year: '2012',
    title: { pl: 'Mroźnia', en: 'Freezer store', de: 'Tiefkühllager' },
    text: {
      pl: 'Inwestycja w mroźnię zintegrowaną z zakładem rozbioru.',
      en: 'Investment in a freezer store integrated with the cutting plant.',
      de: 'Investition in ein an den Zerlegebetrieb angeschlossenes Tiefkühllager.',
    },
    source: 'PT:p_o-firmie',
  },
  {
    year: '2012–2015',
    title: { pl: 'Rozbudowa zakładu rozbioru', en: 'Cutting plant expansion', de: 'Ausbau des Zerlegebetriebs' },
    text: {
      pl: 'Seria inwestycji w zakładzie rozbioru i pakowania w Liskowie: rozbudowa i modernizacja, nowe kierunki zbytu.',
      en: 'A series of investments in the Lisków cutting and packing plant: extension and modernisation, opening new sales directions.',
      de: 'Investitionen in den Zerlege- und Verpackungsbetrieb in Lisków: Ausbau und Modernisierung, neue Absatzwege.',
    },
    source: 'PT:p_o-firmie',
  },
  {
    year: '2013',
    title: { pl: 'Własny ubój', en: 'Own slaughter', de: 'Eigene Schlachtung' },
    text: {
      pl: 'Zakup ubojni w sąsiedniej gminie. Inwestycja w nowoczesną, wysokowydajną linię ubojową i park maszynowy. W tym samym roku niezależna chłodnia składowa.',
      en: 'Purchase of a slaughterhouse in the neighbouring commune and investment in a modern, high-capacity slaughter line and machinery. In the same year, an independent cold storage warehouse.',
      de: 'Erwerb eines Schlachtbetriebs in der Nachbargemeinde, neue hocheffiziente Schlachtlinie und Modernisierung des Maschinenparks. Im selben Jahr ein eigenständiges Kühlhaus.',
    },
    source: 'PT:p_o-firmie, PT:de_p_uber-uns',
  },
  {
    year: '2014',
    title: { pl: 'Skala rozbioru', en: 'Cutting at scale', de: 'Zerlegung im großen Maßstab' },
    text: {
      pl: 'Zakład rozbioru osiąga możliwość rozbioru 700 ton wołowiny tygodniowo.',
      en: 'The cutting plant reaches a capacity of 700 tonnes of beef per week.',
      de: 'Der Zerlegebetrieb erreicht eine Kapazität von 700 Tonnen Rindfleisch pro Woche.',
    },
    figure: { value: '700 t', unit: { pl: 'wołowiny tygodniowo, potencjał rozbioru', en: 'of beef per week, cutting capacity', de: 'Rindfleisch pro Woche, Zerlegekapazität' } },
    source: 'PT:p_o-firmie',
  },
  {
    year: '2019',
    title: { pl: 'MCKEEN-BEEF CP', en: 'MCKEEN-BEEF CP', de: 'MCKEEN-BEEF CP' },
    text: {
      pl: 'Zakład rozbioru działa jako spółka MCKEEN-BEEF CP Sp. z o.o.',
      en: 'The cutting plant operates as MCKEEN-BEEF CP Sp. z o.o.',
      de: 'Der Zerlegebetrieb wird als MCKEEN-BEEF CP Sp. z o.o. geführt.',
    },
    source: 'TAX:cp ("prowadzi działalność od 2019 roku")',
  },
];
