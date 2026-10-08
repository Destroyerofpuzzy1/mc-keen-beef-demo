import type { L } from '@/i18n/config';

/**
 * Environment facts. Legacy Jakość page "W trosce o środowisko" + Biogazownia page.
 * Figures are quoted from the EU project disclosure (content/biogas.ts).
 */
export const environmentFacts: { title: L; text: L }[] = [
  {
    title: { pl: 'Odpady', en: 'Waste', de: 'Abfälle' },
    text: {
      pl: 'W zakładach ograniczamy ilość odpadów i segregujemy je.',
      en: 'Our plants reduce and segregate waste.',
      de: 'In unseren Betrieben reduzieren und trennen wir Abfälle.',
    },
  },
  {
    title: { pl: 'Fotowoltaika', en: 'Photovoltaics', de: 'Photovoltaik' },
    text: {
      pl: 'Stale zwiększamy produkcję zielonej energii z własnej instalacji fotowoltaicznej.',
      en: 'We keep increasing the green energy produced by our own photovoltaic installation.',
      de: 'Wir steigern laufend die Erzeugung von Ökostrom aus unserer eigenen Photovoltaikanlage.',
    },
  },
  {
    title: { pl: 'Biogazownia w Linne', en: 'Biogas plant in Linne', de: 'Biogasanlage in Linne' },
    text: {
      // Project wording only (legacy Biogazownia page: "będzie służyć"). Operation is not confirmed (C-40).
      pl: 'Projekt budowy biogazowni rolniczej o mocy 0,499 MWe. Instalacja ma służyć wytwarzaniu energii elektrycznej i ciepła w wysokosprawnej kogeneracji. Projekt współfinansowany z Funduszu Spójności UE.',
      en: 'Project to build an agricultural biogas plant of 0.499 MWe. The installation is intended to generate electricity and heat in high-efficiency cogeneration. Co-financed by the EU Cohesion Fund.',
      de: 'Projekt zum Bau einer landwirtschaftlichen Biogasanlage mit 0,499 MWe. Die Anlage soll Strom und Wärme in hocheffizienter Kraft-Wärme-Kopplung erzeugen. Kofinanziert aus dem EU-Kohäsionsfonds.',
    },
  },
];
