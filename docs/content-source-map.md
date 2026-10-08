# Content source map

Every fact rendered on the site comes from one of these sources. Codes are used in `src/content/*.ts` comments (`// src: R01-company`).

| Code | Source |
|---|---|
| R01 | `../research/01-content-audit.md` (Phase 1, verified against live site 2026-10-05) |
| PT:<file> | `../source-assets/documents/page-text-archive/<file>.txt` (verbatim page text) |
| PDF:<file> | certificate PDF in `../source-assets/pdfs/certificates/` (data read from the document) |
| TAX:<sh/cp> | tax strategy 2023 (archived slides / text) |
| BIO | `PT:p_biogazownia` (EU project disclosure, verbatim) |

Shared data objects (written once, rendered in several places):

| Object | File | Rendered in |
|---|---|---|
| 5 legal entities with NIP/REGON/KRS/vet/BDO, addresses, map links, office phones | `content/entities.ts` | Footer, Zakłady, Kontakt directory, Organization JSON-LD, Polityka prywatności (administrators) |
| 3 production sites | `content/plants.ts` | Home chain, Zakłady, Certyfikaty grouping, Products ("producing site") |
| Contacts (40+ people/departments) with routing tags | `content/contacts.ts` | Kontakt router + directory, Products (sales/UPPZ), Sprzedaż, Kariera |
| Certificates (61 files in 25 records) | `content/certificates.ts` | Home trust strip, Jakość, Certyfikaty, Zakłady |
| History milestones | `content/history.ts` | O firmie timeline, Home (founding year) |
| Product groups | `content/products.ts` | Home, Produkty, enquiry form options |
| Job postings | `content/jobs.ts` | Kariera, careers form options, JobPosting JSON-LD |
| Environment + biogas | `content/environment.ts`, `content/biogas.ts` | Jakość (Środowisko), Home, Biogazownia |
| Company facts (founded, markets, sales office) | `content/company.ts` | Home, O firmie, Sprzedaż, SEO |

---

## Pages

### Strona główna `/`
- Hero: business definition (slaughter, cutting, packing, freezing/cold storage, sales; Lisków; since 2009) ← R01 §Company, §History.
- Trust strip: "Działamy od 2009" ← R01 timeline; CP BRCGS AA+ valid to 27.04.2027 ← PDF:cutting-plant-cp-2026-brcgs-en; CP IFS Food v8 Higher 98,60 % valid to 12.05.2027 ← PDF:cutting-plant-cp-2026-ifs-food-en. Explicitly scoped "Zakład rozbioru, Lisków (MCKEEN-BEEF CP)". Vet numbers ← R01 entities.
- Product groups (4 + UPPZ) ← `products.ts`.
- Integration chain: skup żywca (contacts "Dyrektor skupu żywca", "Dział skupu żywca"), ubój (SH, SH II), rozbiór i pakowanie (CP), mroźnia (2012) i chłodnia składowa (2013), transport ("Dział transportu", slogan "Sprawny transport"), sprzedaż (SO GmbH Oelde) ← R01 §Identity, §History, §Contact. No operational details beyond these.
- Sales band: Jay McKeen / Ken McKeen phones ← PT:p_kontakt; markets Japan, Scandinavia ← PT:home (Jakość block).
- Environment teaser ← R01 §Quality 3 + BIO.
- **Uncertain:** sales e-mail domain (.de shown, from Kontakt) → C-05.

### Produkty `/produkty`
- Four groups (PL names verbatim from the product image; EN/DE names from the EN/DE images) ← R01 §Products.
- Statements per group, all sourced:
  - Ćwierci wołowe: covered by SH IFS scope "beef quarters … chilled and frozen" (PDF:slaughterhouse-sh-2023-ifs-food-en, **expired 21.09.2024 → shown as "zakres certyfikacji z 2023", not as current certification**); listed on SH EKO 2021 (expired).
  - Elementy wołowe: CP current scope "Cutting and packaging of chilled and frozen beef in plastic packaging vacuum and bulk plastic containers and cartons" ← PDF:cp-2026; SH 2023 scope "beef elements".
  - Mięsa drobne wołowe: name only on source; produced in cutting (category definition). Packaging/forms **pending** → C-12.
  - Podroby wołowe: SH 2023 scope "beef offals – chilled and frozen"; contact "Sprzedaż podrobów i UPPZ" Monika Urbańczyk ← PT:p_kontakt.
  - UPPZ: same contact; no product list → C-13.
- **Pending:** cut lists, specs, MOQ, shelf life, pallet configuration → C-12. Rendered as a single clear note "Specyfikacje na zapytanie" + request link, not as invented data.

### Jakość `/jakosc`
- System jakości: HACCP, GMP, GHP, IFS, BRC "od 2010 roku" ← PT:p_jakosc (Certyfikacja, Korzyści). "Since 2010" is a site claim; earliest PDF 2019 → C-09 (shown as stated by the company).
- Źródła i dobrostan: "sprawdzone hodowle", dobrostan, "rozległe pastwiska" ← PT:p_jakosc, PT:p_o-firmie.
- Kontrola: staff training, hygiene, documentation, monitoring at every stage ← PT:p_jakosc.
- Środowisko: waste reduction/segregation, PV "własna instalacja fotowoltaiczna", biogas ← PT:p_jakosc + BIO.
- Compact certificate status ← `certificates.ts`.

### Certyfikaty `/certyfikaty`
- All data from the 61 PDFs (see `certificates.ts`; every record lists its source file).
- Current = `expiresOn >= today`. At build date: CP BRCGS 2026, CP IFS 2026 only.
- SH, SH II: "Brak aktualnego certyfikatu opublikowanego na stronie. Status do potwierdzenia." → C-01, C-02. EKO archive → C-03.
- Certification body Global Quality Sp. z o.o.; verification hints (BRCGS Directory, IFS database) ← text printed on the certificates.

### Zakłady `/zaklady`
- Group structure and 5 entities ← `entities.ts` (R01 table).
- Site activities: SH Linne "zakład uboju"; SH II "zakład uboju II", production plant Wydrzyn 3; CP "zakład rozbioru i pakowania", freezer integrated with the cutting plant (2012), independent cold store (2013); GmbH sales ← R01.
- **Uncertain:** cold store location, SH II activity and start date → C-08, C-10.

### O firmie `/o-firmie`
- About text (pastures, welfare, staff, technology) ← PT:p_o-firmie (rewritten for clarity, no new claims).
- Timeline 2009, 2010 (IFS/BRC system), 2012, 2012–2015, 2013, 2014, 2019 (CP active ← TAX:cp), SH active since 2012 (← TAX:sh) ← R01 timeline. Capacities flagged "dane historyczne".
- Family business statement ← PT:de_p_uber-uns (DE only on source) → C-14 before using in PL/EN; rendered in the DE locale only until confirmed.
- Customer-first statement (one instance) ← PT:p_o-firmie.

### Sprzedaż i eksport `/sprzedaz-eksport`
- Sales company MCKEEN-BEEF SO GmbH, Oelde ← entities; multilingual team ← PT:de_p_uber-uns ("mehrsprachig aufgestelltes Vertriebsteam mit Sitz in Deutschland … nationale als auch internationale Märkte") — languages not listed → C-27.
- Markets: Polska, Japonia, kraje skandynawskie ← PT:home. Nothing else.
- Logistics: truck image, transport department contact, chilled and frozen products, freezer/cold store ← R01. Fleet details → C-22.

### Kariera `/kariera`
- Job "Rozbieracz-wykrawacz", MCKEEN-BEEF CP, Lisków, pełen etat, umowa o pracę, pon–pt, stałe godziny, jedna zmiana, 2 posiłki dziennie, darmowe zakwaterowanie, klasowanie 6500–7500 zł netto/mies., trybowanie 8000–9000 zł netto/mies., tel. 62 76 35 577, praca@mckeen-beef.eu ← PT:p_kariera (PL page values only). EN/DE old salaries ignored → C-31.

### Kontakt `/kontakt`
- Router options → routing tags in `contacts.ts`. Mapping:
  - Kupuję wołowinę → Dział sprzedaży (Jay McKeen, Ken McKeen, office@mckeen-beef.de)
  - Podroby / UPPZ → Monika Urbańczyk (SH)
  - Sprzedaję bydło → Renata Zduniak (Dyrektor skupu żywca, SH Linne), Małgorzata Będziechowska (Dział skupu żywca, SH II)
  - Jakość / audyt → Anna Brożek (SH), quality.sh2@ (SH II), Eliza Fiderkiewicz (CP)
  - Transport → Małgorzata Kaczmarek (CP)
  - Dostawy i zaopatrzenie → Błażej Dębowy (surowiec mięsny), Marcelina Tkaczyk (SH) / Karolina Kwaśniewska (CP) (surowiec niemięsny)
  - Praca → 62 76 35 577, praca@mckeen-beef.eu
  - Księgowość → Daria Bartoszczyk (Centrala, SH II), Marzena Cichowicz (SH), Aneta Olkowicz (CP)
  - Inne → Sekretariat Centrali +48 62 76 35 555
- Directory = full PT:p_kontakt list. Staff consent → C-26.
- General contact form: replaced by the offer form (B2B) and careers form; other topics go to the router. Rationale: the legacy general form had an unknown recipient (C-25).

### Zapytaj o ofertę `/zapytaj-o-oferte`
- Form options from `products.ts`. Recipient env var (C-25). Sales contacts beside the form.

### Biogazownia `/biogazownia`
- Verbatim BIO text, figures and indicators; typo "Europejskiegi" corrected to "Europejskiego" (obvious spelling error, documented) → C-37 for placement rules.

### Strategia podatkowa `/strategia-podatkowa`
- Facts printed in the documents: entity, tax year 2023, date of the open letter (Warszawa, 30 grudnia 2024 r.), MF list positions 1685 (SH) and 1332 (CP), activity profile ← TAX. Revenue table not repeated on the page (it is in the PDF) → C-15.
- PDFs ← archived slides (see `asset-map.md`).

### Polityka prywatności `/polityka-prywatnosci`
- Verbatim PL RODO clauses per entity ← PT:p_rodo. Added: recruitment form and website forms processing, cookies statement reflecting the new site (no non-essential cookies). The additions are marked "do weryfikacji prawnej" in source comments → C-35.

### Translations
- EN/DE UI and page copy written fresh from the PL source (not from the broken legacy EN/DE). Status `draft` → noindex + notice until a professional translator approves (C-50). Legal pages show PL originals.
