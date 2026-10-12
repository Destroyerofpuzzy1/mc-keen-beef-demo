# Content source map

Every fact rendered on the site comes from one of these sources. In code the codes appear only in the `source` fields of `src/content/history.ts` (e.g. `source: 'PT:p_o-firmie'`); for everything else this document is the reference. The `../research` and `../source-assets` folders are outside this repository and are not present next to this checkout.

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
| Certificates (61 files in 22 records) | `content/certificates.ts` | Home trust strip, Jakość, Certyfikaty, Zakłady, Produkty |
| History milestones | `content/history.ts` | O firmie timeline, Home (founding year) |
| Product groups | `content/products.ts` | Home, Produkty, enquiry form options |
| Job postings | `content/jobs.ts` | Kariera, careers form options, JobPosting JSON-LD |
| Environment + biogas | `content/environment.ts`, `content/biogas.ts` | Jakość (Środowisko), Home, Biogazownia |
| Company facts (founded, markets, sales office) | `content/company.ts` | Home, O firmie, Sprzedaż, SEO |

---

## Pages

### Strona główna `/`
- Hero (since 2026-10-09): headline only, PL "Polska wołowina jakościowa", EN "Quality Polish beef", DE "Polnisches Qualitätsrindfleisch" ← wording supplied by the client/user (2026-10-09), plus the offer CTA. The former hero copy (group line "Grupa MCKEEN-BEEF, Lisków, od 2009 roku", process summary, product lead; sources R01 §Company, §History) now opens the integration-chain and products sections below; the sales phone is shown in the sales band.
- Trust strip: "Działamy od 2009" ← R01 timeline; CP BRCGS AA+ valid to 27.04.2027 ← PDF:cutting-plant-cp-2026-brcgs-en; CP IFS Food v8 Higher 98,60 % valid to 12.05.2027 ← PDF:cutting-plant-cp-2026-ifs-food-en. Explicitly scoped "Zakład rozbioru, Lisków (MCKEEN-BEEF CP)". Vet numbers ← R01 entities.
- Product groups (4 + UPPZ) ← `products.ts`.
- Integration chain: skup żywca (contacts "Dyrektor skupu żywca", "Dział skupu żywca"), ubój (SH, SH II), rozbiór i pakowanie (CP), mroźnia (2012) i chłodnia składowa (2013), transport ("Dział transportu", slogan "Sprawny transport"), sprzedaż (SO GmbH Oelde) ← R01 §Identity, §History, §Contact. No operational details beyond these.
- Chain links (UX-IA-001 stage 1) use existing labels only: plant names ← `entities.ts` (`place`), "Mroźnia i chłodnia" ← `plants.coldTitle`, "Sprzedaję bydło" ← the contact router topic.
- Environment teaser ← R01 §Quality 3 + BIO. Since stage 1 it comes before the sales section.
  - Since stage 1.3 (2026-10-11) it has a red eyebrow that reuses Jakość's section title "Środowisko" (`quality.envTitle`); no new copy or claim.
  - Its texts are unchanged (`environment.ts`, shared with Jakość).
  - The project is still not attributed to a company (GAP-07, C-64), and operation is still not stated (C-40).
- Sales section (one composition since stage 1):
  - Jay McKeen / Ken McKeen phones ← PT:p_kontakt;
  - markets Japan, Scandinavia ← PT:home (Jakość block);
  - the "Rynki i zakłady" ledger (markets ← `company.ts`, sites ← `entities.ts`), formerly a section of its own.
  - Its line "Sprzedaż: MCKEEN-BEEF SO GmbH, Oelde (Niemcy)" (and EN/DE) was removed with the user's consent on 2026-10-11 as a repetition. The sales company and Oelde stay in the panel text and in the ledger row "Oelde (Niemcy) — Sprzedaż".
- Contact and cooperation (stage 1): the buyer's path and the other audiences' topics reuse the contact router's labels and hints (`contact.routes`, `contact.routeHints`, `contact.routerLead`) and "Wszystkie działy".
  - The only new UI copy is the eyebrow "Kontakt i współpraca" and the heading "Porozmawiajmy o współpracy" (approved by the user, 2026-10-11).
  - No facts and no repeated phone numbers.
- **Uncertain:** sales e-mail domain (.de shown, from Kontakt) → C-05.

### Produkty `/produkty`
- Four groups (PL names verbatim from the product image; EN/DE names from the EN/DE images) ← R01 §Products.
- Statements per group, all sourced:
  - Ćwierci wołowe: covered by SH IFS scope "beef quarters … chilled and frozen" (PDF:slaughterhouse-sh-2023-ifs-food-en, **expired 21.09.2024 → shown as "zakres certyfikacji z 2023", not as current certification**); listed on SH EKO 2021 (expired).
    - Producing plant shown: SH Linne only.
    - Nothing documents what SH II (Wydrzyn) produces, so it is not listed and the summary ("Ćwierci wołowe z uboju.") names no plant (C-51, GAP-06).
  - Elementy wołowe: CP current scope "Cutting and packaging of chilled and frozen beef in plastic packaging vacuum and bulk plastic containers and cartons" ← PDF:cp-2026; SH 2023 scope "beef elements".
  - Mięsa drobne wołowe: name only on source; produced in cutting (category definition). Packaging/forms **pending** → C-12.
  - Podroby wołowe: SH 2023 scope "beef offals – chilled and frozen"; contact "Sprzedaż podrobów i UPPZ" Monika Urbańczyk ← PT:p_kontakt.
  - UPPZ: same contact; no product list → C-13.
- **Pending:** cut lists, specs, MOQ, shelf life, pallet configuration → C-12. Rendered as a single clear note "Specyfikacje na zapytanie" + request link, not as invented data.
- "Certyfikaty" row (CP products only, current certificates only) ← `certificates.ts`: one line per certificate with its own result and validity, then the plant ("Zakład rozbioru, Lisków") (GAP-08).

### Jakość `/jakosc`
- System jakości: HACCP, GMP, GHP, IFS, BRC "od 2010 roku" ← PT:p_jakosc (Certyfikacja, Korzyści). "Since 2010" is a site claim; earliest PDF 2019 → C-09 (shown as stated by the company).
- Źródła i dobrostan: "sprawdzone hodowle", dobrostan, "rozległe pastwiska" ← PT:p_jakosc, PT:p_o-firmie.
- Kontrola: staff training, hygiene, documentation, monitoring at every stage ← PT:p_jakosc.
- Środowisko: waste reduction/segregation, PV "własna instalacja fotowoltaiczna", biogas ← PT:p_jakosc + BIO.
- Compact certificate status ← `certificates.ts`.
- Meta description, also used by Open Graph and Twitter (PL/EN/DE):
  - the group's quality system: HACCP, GMP, GHP;
  - BRCGS and IFS Food: only as certificates of the cutting plant in Lisków (GAP-05; values on `/certyfikaty`);
  - sourcing, welfare and environment as topics.

### Certyfikaty `/certyfikaty`
- All data from the 61 PDFs (see `certificates.ts`; every record lists its source file).
- Current = `expiresOn >= today`. At build date: CP BRCGS 2026, CP IFS 2026 only.
- SH, SH II: neutral line "Aktualny certyfikat tego zakładu nie jest opublikowany na stronie." (no public "do potwierdzenia" label) → C-01, C-02. EKO archive → C-03.
  - Since UXA-03 (2026-10-11) the line is followed by the link "Zapytaj dział jakości" / "Contact the quality department" / "Qualitätsabteilung kontaktieren" to the contact router's quality/audit topic (`?temat=quality#pomoc`), on Certyfikaty, on the SH and SH II cards on Zakłady, and on the cards of products made in Linne (Ćwierci, Podroby).
  - The line keeps its meaning: neither "certified" nor "not certified". No dates, numbers or status claims were added.
- Certification body Global Quality Sp. z o.o. ← text printed on the certificates.
- Verification note and links (UXA-08): verifying certificates in the official BRCGS and IFS databases needs a sign-in, and BRCGS offers a free Directory Lite account; addresses https://directory.brcgs.com/ and https://login.ifs-certification.com/?lang=en ← given by the user and checked on the official sites on 2026-10-11 (BRCGS start page asks to sign in or create a free Directory Lite account; the IFS database link leads to its sign-in page). The certificates name both databases; no Site Code or COID is shown (GAP-03 open).
- Documents: every certificate offers its scans ("Podgląd") and its original PDFs ("Oryginał PDF") in the language versions published on the legacy site (GAP-01). The SH EKO 2021 "DE" file is the Polish/English document (GAP-27, `asset-map.md`).

### Zakłady `/zaklady`
- Group structure and 5 entities ← `entities.ts` (R01 table).
- Site activities: SH Linne "zakład uboju"; SH II "zakład uboju II", production plant Wydrzyn 3; CP "zakład rozbioru i pakowania", freezer integrated with the cutting plant (2012), independent cold store (2013); GmbH sales ← R01.
- Products per company card ← `products.ts` (`sites`). SH II has no products line until the client confirms its products (C-51, GAP-06).
- The biogas project is not listed on any company card: the EU disclosure names no beneficiary (C-64, GAP-07).
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

### Wynik formularza `/wyslano`
- Success and error texts and the direct contacts as before.
- New UI copy for the result without a confirmed outcome (GAP-14, 2026-10-11; `forms.unknownTitle`, `forms.unknownText`, PL/EN/DE):
  - PL: "Brak wyniku do wyświetlenia".
  - PL: "Na tej stronie nie możemy potwierdzić, czy formularz został wysłany. Jeśli chcesz mieć pewność, skontaktuj się z nami bezpośrednio:".
- It states no fact and no response time (C-28).

### Biogazownia `/biogazownia`
- Verbatim BIO text, figures and indicators; typo "Europejskiegi" corrected to "Europejskiego" (obvious spelling error, documented) → C-37 for placement rules.
- **No beneficiary or operating company** is stated: the disclosure, the research summaries and the EU logos name none.
  - The project is presented by location only ("Biogazownia w Linne"): this page, the Środowisko sections of Home and Jakość, and the footer link.
  - Until 2026-10-10 the /zaklady card of MCKEEN-BEEF SH listed it; removed by GAP-07. Open: C-64.

### Strategia podatkowa `/strategia-podatkowa`
- Facts printed in the documents: entity, tax year 2023, date of the open letter (Warszawa, 30 grudnia 2024 r.), MF list positions 1685 (SH) and 1332 (CP), activity profile ← TAX. Revenue table not repeated on the page (it is in the PDF) → C-15.
- PDFs ← archived slides (see `asset-map.md`).

### Polityka prywatności `/polityka-prywatnosci`
- Verbatim PL RODO clauses per entity ← PT:p_rodo. Added: recruitment form and website forms processing, cookies statement reflecting the new site (no non-essential cookies). The additions are marked "do weryfikacji prawnej" in source comments → C-35.

### Translations
- EN/DE UI and page copy written fresh from the PL source (not from the broken legacy EN/DE). Status `draft` → noindex + notice until a professional translator approves (C-50). Legal pages show PL originals.
