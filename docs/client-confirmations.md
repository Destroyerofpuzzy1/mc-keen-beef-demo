# Client confirmations required

Items the website deliberately does **not** resolve by guessing. Each has an id referenced in code comments (`// pending: C-xx`) and in `content-source-map.md`. Derived from `../research/07-open-questions.md` plus decisions taken during the build.

Status: **open** unless marked otherwise. Priority P1 = must be answered before public launch.

## Certification

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-01 | P1 | Does MCKEEN-BEEF SH (Linne) hold a current IFS/BRCGS certificate? Latest published IFS expired 21.09.2024. | SH shown with the neutral line "Aktualny certyfikat tego zakładu nie jest opublikowany na stronie" (no public "Do potwierdzenia" tag); all SH certificates in archive. |
| C-02 | P1 | Does MCKEEN-BEEF SH II (Wydrzyn/Wieniawa) hold any certificates? | Same neutral line. |
| C-03 | P1 | Is organic (EKO) production still certified? All EKO certificates expired (latest 21.07.2023). | EKO only in archive; no EKO mark anywhere. |
| C-04 | P2 | Official BRCGS / IFS / Global Quality logo artwork and permission to use; what the "PCA AC 169" mark on the old site refers to. | Certifications shown as text and PDFs, no marks. Gap audit 2026-10-10: on the CP 2026 certificates the "PCA … AC 169" mark is printed next to the Global Quality marks, so it is the certification body's accreditation, not a McKeen mark; permission to use logos is still open. |
| C-09 | P2 | "Certified IFS/BRC system since 2010" — older certificates available? | Claim shown attributed as company statement; archive starts 2019. |
| C-11 | P3 | Is mincing still performed at CP (in 2023 scope only)? | Not mentioned. |

## Contacts and forms

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-05 | P1 | Sales e-mails: `jay@` / `ken@` on `mckeen-beef.de` (Kontakt page) or `mckeen-beef.eu` (Katalog page)? | `.de` used (consistent with `office@mckeen-beef.de` of the same GmbH). |
| C-25 | P1 | Mailboxes for the offer form (`SALES_FORM_RECIPIENT`) and job applications (`CAREERS_FORM_RECIPIENT`); sender address (`FORM_FROM_EMAIL`) and mail provider. | Env-driven. Production without config returns 503 with phone/e-mail alternatives. |
| C-26 | P1 | Is the PL Kontakt staff list current and has every person agreed to publication of name, phone and e-mail? (Legacy EN page shows other names.) | Full PL list published as on the current site. |
| C-27 | P2 | Languages spoken by the sales team in Oelde. | Not listed; "multilingual sales team" only in DE copy as on source. |
| C-28 | P3 | Response-time commitment for enquiries. | No promise made. |
| C-29 | P2 | Should livestock farmers get a dedicated page? Which site buys which cattle? | Router option "Sprzedaję bydło" → both purchasing contacts. |
| C-30 | P3 | Is the Facebook page maintained? | Linked in footer. |

## Company facts

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-06 | P1 | Current capacities (slaughter, cutting, cold storage). | Only 2009 (100 t/day) and 2014 (700 t/week) figures, labelled "dane historyczne". |
| C-07 | P1 | Which logo is current: red "McKeen-Beef" wordmark or "MC|KEEN-BEEF" horns logo? | Wordmark used; horns symbol used as a secondary device. |
| C-08 | P2 | SH II: acquisition/opening date and activities. | Only name, addresses, registration and vet number. |
| C-10 | P2 | Where is the independent cold store (2013) located? Biogas plant and PV commissioning dates and PV size. | Not stated. |
| C-14 | P2 | "Family business" (DE source only) for all languages? | Shown on DE only. |
| C-15 | P2 | May revenue figures from the tax strategy be used elsewhere? | Not used outside the PDFs. |
| C-16 | P2 | Who should be presented as management (Kontakt vs. tax strategy signatories differ)? | Only as listed in Kontakt directory. |
| C-17 | P2 | Employee count. | Not shown. |

## Products and markets

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-12 | P1 | Cut lists, specifications, packaging units, shelf life, chilled/frozen per product, MOQ, pallet configuration. | "Listy elementów, specyfikacje i minimalne ilości przekazuje dział sprzedaży"; only certificate-scope facts shown, each with its source. |
| C-13 | P2 | Which animal by-products (UPPZ) are sold? | Contact route only. |
| C-18 | P1 | Full list of export markets and third-country approvals. | Only Polska, Japonia, kraje skandynawskie (as on source). |
| C-19 | P2 | Breeds, origin regions, traceability, welfare audits. | Only source statements ("sprawdzone hodowle", "rozległe pastwiska"). |
| C-20 | P2 | Halal / kosher. | Not mentioned. |
| C-21 | P2 | Customer references with permission. | None shown; legacy "Zaufało nam wielu" dropped. |
| C-22 | P2 | Own fleet, temperature control, delivery area; is the branded truck photo a real vehicle? | Truck image used with neutral caption; no fleet claims. |

## Recruitment

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-31 | P1 | Current openings and pay (PL page values used: 6500–7500 / 8000–9000 zł netto). | PL values shown. |
| C-32 | P2 | Recruitment languages (EN/DE/UA?). | No language claim anywhere (the EN/DE note was removed in the audit fix pass). |
| C-33 | P1 | Who receives CVs, retention period, recruitment privacy clause. | Form shows a short notice pointing to the privacy policy; full clause pending. |
| C-34 | P3 | Does praca@mckeen-beef.eu work? | Shown (legacy link was broken). |

## Legal

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-35 | P1 | Legal review of the privacy policy: add SH II, website forms, recruitment, cookies. | Legacy clauses published verbatim; a clearly marked section describes the website forms factually. |
| C-36 | done | Cookie consent. | No non-essential cookies, so no banner is needed. No consent mechanism is implemented; it must be built before any analytics (C-47, `security.md` §7). |
| C-37 | P2 | EU funding visibility rules for the biogas project (placement, duration). | Dedicated page + footer link with EU marks on the page. |
| C-38 | P1 | Original PDFs of the tax strategy 2023 and whether 2024 reports exist. | Image PDFs archived from the legacy pages. |
| C-39 | P1 | Impressum for MCKEEN-BEEF SO GmbH (German law). | Not created (needs legal input: managing directors, register court, HRB number). |

## Brand, assets, technical

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-42 | P1 | Real photography of plants, product, people, PV, biogas (see `asset-map.md`). | Best existing stock-like images + typography. |
| C-43 | P2 | Licences for legacy images and videos. | Assumed transferable; must be confirmed. Also covers the home hero video: the supplied `home_bottom.mp4` is the same footage as the legacy cattle loop (`asset-map.md`, "Home hero video"). |
| C-63 | P2 | Is a higher-resolution master of the hero footage available (for example 4K or ProRes), or new footage? | The site serves the supplied 1920×800 file unchanged; it looks soft on high-density and very large screens because the browser has to enlarge it (`asset-map.md`, "Home hero video"). |
| C-46 | P1 | Domain/DNS/hosting control; valid TLS. | Site assumes HTTPS; HSTS only in production. |
| C-47 | P2 | Analytics: GA4 or other, Search Console access. | Analytics disabled. |
| C-50 | P1 | Professional EN/DE translation and approval. | EN/DE marked draft, noindex, notice shown. |

## Audit fix pass (2026-10-06): new ids

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-40 | P1 | Is the biogas plant in Linne built and operating (commissioning date)? | Described only as a project whose installation "ma służyć" generating electricity and heat (source wording). No claim that it produces energy. All project figures unchanged. |
| C-41 | P2 | Exact scope of production records / traceability (per batch? per lot? per animal?). | Only the source statement: monitoring of every production stage and accurate documentation. "Dokumentacja każdej partii" removed. |
| C-51 | P1 | Which products and forms does SH II (Wydrzyn) supply? | Since GAP-06 (2026-10-10) nothing links SH II to a product. Quarters list only SH Linne (documented by its IFS scopes 2019–2023 and EKO 2021), and their summary names no plant. The SH II card on /zaklady has no products line. SH II itself (activity, livestock purchasing, legal data, certificate line) is unchanged. |
| C-52 | P1 | Real publication date of the vacancy (and validity). | Visible job offer unchanged. JobPosting structured data is withheld until `datePosted` is set in `src/content/jobs.ts`; the data-collection date is not used. |
| C-53 | P1 | Legal approval of the EN/DE privacy translations. | Historical EN/DE texts are prepared verbatim in `src/content/privacy-drafts.ts` (generated by `scripts/build-privacy-drafts.mjs`) but NOT published; EN/DE pages show the Polish text and stay noindex. Switch: `privacyTranslationApproved` in `src/content/privacy.ts`. The archived EN text contains truncated sentences. |
| C-54 | P1 | Controller information for MCKEEN-BEEF SH II in the privacy policy. | Missing on the legacy site as well; not written by us. |
| C-61 | P1 | Authentic product photography (quarters, packed cuts, trimmings, offal). | Ćwierci: brand beef-cuts line art instead of a photo. Elementy: raw bone-in cut (existing library image). All product photos labelled "Zdjęcie poglądowe". |
| C-62 | P1 | Delivery parameters (lead times, area, temperature control, Incoterms). | None stated. |

## Gap audit (2026-10-10): new ids

Findings and evidence: [`gap-audit-2026-10-10.md`](gap-audit-2026-10-10.md); live status: [`STATUS.md`](STATUS.md), "Gap audit tracker".

| Id | P | Question | Current site behaviour |
|---|---|---|---|
| C-64 | P2 | Which company is the beneficiary of the EU project "Budowa biogazowni rolniczej w Linne"? The disclosure does not name it. | Since GAP-07 (2026-10-10) no company is named. The project is shown by location only: the Biogazownia page (verbatim disclosure, EU marks), the Środowisko sections of Home and Jakość, and the footer link. It is no longer listed on the MCKEEN-BEEF SH card on /zaklady. Checked: the research documents, the verbatim disclosure and the EU logos name no beneficiary; the raw legacy page archive is not available here. |

### Client confirmation checklist (one pass with the client)

Nothing below is shown on the site as "Do potwierdzenia"; where a fact is open the site uses the safest source wording or says nothing.

1. Current SH / SH II certificates and certification status: C-01, C-02, C-03.
2. Current product specifications: C-12.
3. MOQ: C-12.
4. Packaging (units, vacuum/bulk per product, pallets): C-12.
5. Shelf life: C-12.
6. Delivery parameters: C-62.
7. Current export approvals: C-18.
8. Logistics / transport parameters, own fleet, temperature control: C-22.
9. Is the biogas plant operating, and which company is the project's beneficiary: C-40, C-64.
10. Exact traceability / documentation scope: C-41, C-19.
11. SH II product scope: C-51.
12. Current contacts and the `.de` / `.eu` e-mail discrepancy: C-05, C-26.
13. Current vacancy status: C-31.
14. Salary validity: C-31.
15. Real JobPosting publication date: C-52.
16. Recruitment language and process: C-32, C-33.
17. EN/DE privacy and legal approval: C-35, C-53, C-50, C-39 (GmbH Impressum).
18. SH II privacy / controller information: C-54.
19. Real facility photography (plants, lines, people): C-42.
20. Cold-store photography: C-42 (current site shows the refrigerated trailer crop, no cold store).
21. Packaging / product photography: C-61.
22. Biogas installation photography, if it exists and may be published: C-42, C-40.

Also open and not client-independent: tax strategy as accessible text (C-38: only image PDFs and a broken PDF→HTML text conversion exist; not OCR-published).
