/**
 * EU project disclosure. VERBATIM from http://www.mckeen-beef.eu/p/biogazownia
 * (source-assets/documents/page-text-archive/p_biogazownia.txt).
 * Only change: obvious typo "Europejskiegi" → "Europejskiego" (documented in
 * docs/content-source-map.md). Do not paraphrase figures. Polish only (legal text).
 */
export const biogas = {
  programme: 'Fundusz Spójności w ramach Programu Operacyjnego Infrastruktura i Środowisko 2014-2020',
  projectTitle: 'Budowa biogazowni rolniczej w Linne',
  intro:
    'Przedmiot Umowy realizowany jest w ramach Projektu pt. „Budowa biogazowni rolniczej w Linne”. Budowa biogazowni rolniczej o mocy do 499 kW wraz z wyposażeniem technologicznym oraz infrastrukturą towarzyszącą na działkach oznaczonych numerem geodezyjnym 16/2 i 17/2 w obrębie miejscowości Linne (gmina Dobra), która będzie służyć wytwarzaniu ekologicznej energii elektrycznej oraz ciepła w układzie wysokosprawnej kogeneracji.',
  summary:
    'Przedmiotowy projekt dotyczył budowy biogazowni rolniczej o mocy 0,499 MWe wraz z infrastrukturą towarzyszącą w gmina Dobra, województwo wielkopolskie, której celem jest wytwarzanie ekologicznej energii elektrycznej oraz ciepła w układzie wysokosprawnej kogeneracji.',
  costs: [
    { label: 'Łączny koszt inwestycji (brutto)', value: '13 974 030,09 PLN' },
    { label: 'Koszty kwalifikowalne', value: '11 329 333,40 PLN' },
    { label: 'Kwota dofinansowania', value: '6 489 218,04 PLN' },
    { label: 'Udział dofinansowania', value: '57,28%' },
  ],
  costsSentence:
    'Łącznie koszt inwestycji wynosi: 13 974 030,09 PLN brutto, z czego koszty kwalifikowalne wynoszą 11 329 333,40 PLN, a kwota dofinansowania stanowi 6 489 218,04 PLN, czyli 57,28%.',
  productIndicators: [
    { label: 'Dodatkowa zdolność wytwarzania energii ze źródeł odnawialnych (CI)', value: '0,998 MWt' },
    { label: 'Liczba wybudowanych lub zmodernizowanych jednostek wytwarzania energii elektrycznej i cieplnej w ramach wysokosprawnej kogeneracji', value: '1 szt.' },
    { label: 'Liczba wybudowanych lub zmodernizowanych jednostek wytwarzania energii elektrycznej i cieplnej w ramach wysokosprawnej kogeneracji z OZE', value: '1 szt.' },
    { label: 'Dodatkowa zdolność wytwarzania energii elektrycznej i cieplnej w warunkach wysokosprawnej kogeneracji', value: '0,998 MW' },
    { label: 'w tym: dodatkowa zdolność wytwarzania energii cieplnej', value: '0,499 MW' },
    { label: 'w tym: dodatkowa zdolność wytwarzania energii elektrycznej', value: '0,499 MW' },
    { label: 'Liczba przedsiębiorstw otrzymujących wsparcie', value: '1 szt.' },
  ],
  resultIndicators: [
    { label: 'Szacowany roczny spadek emisji gazów cieplarnianych (CI34)', value: '4 752,19 ton/r' },
    { label: 'Zmniejszenie zużycia energii pierwotnej', value: '16 049,57 GJ/rok' },
  ],
  irregularities: {
    intro: 'Wszelkie nieprawidłowości oraz nadużycia finansowe należy zgłaszać:',
    formUrl:
      'https://nieprawidlowosci.mfipr.gov.pl/bazy/konsultacje-spoleczne/eaplikacja-konsultacje.nsf/document.xsp?unid=9B0502CE55377495C1257C0D0026120B&titleMenu=Dokument&uniddoc=78D0863AE117E52DC1257DF5004669FC',
    email: 'naduzycia.POIS@mfipr.gov.pl',
  },
  logos: {
    fe: { src: '/assets/brand/eu/fundusze-europejskie-is.jpg', width: 1264, height: 567, alt: 'Fundusze Europejskie, Infrastruktura i Środowisko' },
    ue: { src: '/assets/brand/eu/ue-fundusz-spojnosci.jpg', width: 1430, height: 567, alt: 'Unia Europejska, Fundusz Spójności' },
  },
};
