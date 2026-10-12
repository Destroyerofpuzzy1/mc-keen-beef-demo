# Architecture

McKeen Beef corporate website. Next.js 16 (App Router, Turbopack), React 19, TypeScript, plain CSS (CSS Modules + global tokens). No UI framework, no CSS framework.

Factual source of truth: `../research/*.md` (Phase 1) → `../source-assets/documents/page-text-archive/` → certificate PDFs. See `content-source-map.md`. Both `../research` and `../source-assets` live outside this repository and are not present next to this checkout.

---

## 1. Routing

### URL scheme

| Locale | Prefix | Example | Status |
|---|---|---|---|
| PL (source) | none | `/produkty` | canonical, indexed |
| EN | `/en` | `/en/products` | draft translation, `noindex` until approved |
| DE | `/de` | `/de/produkte` | draft translation, `noindex` until approved |

Internally every page lives under `src/app/[locale]/<polish-folder>/page.tsx`. Folder names are the **route keys** (Polish slugs). Localised slugs are mapped in `src/i18n/routes.ts`:

```
key                    pl                     en                     de
home                   /                      /en                    /de
products               /produkty              /en/products           /de/produkte
quality                /jakosc                /en/quality            /de/qualitaet
certificates           /certyfikaty           /en/certificates       /de/zertifikate
plants                 /zaklady               /en/plants             /de/standorte
about                  /o-firmie              /en/about-us           /de/ueber-uns
sales                  /sprzedaz-eksport      /en/sales-export       /de/vertrieb-export
careers                /kariera               /en/careers            /de/karriere
contact                /kontakt               /en/contact            /de/kontakt
enquiry                /zapytaj-o-oferte      /en/request-a-quote    /de/angebot-anfragen
biogas                 /biogazownia           /en/biogas-plant       /de/biogasanlage
tax                    /strategia-podatkowa   /en/tax-strategy       /de/steuerstrategie
privacy                /polityka-prywatnosci  /en/privacy-policy     /de/datenschutz
```

`src/proxy.ts` (Next 16 replacement for middleware) does, in order:
1. `/pl` or `/pl/...` → 308 to the unprefixed URL (one canonical PL URL).
2. Unprefixed path → **rewrite** to `/pl/<route-folder>`.
3. `/en/<localised-slug>` or `/de/<localised-slug>` → rewrite to `/<locale>/<route-folder>`. A request using the Polish folder under EN/DE (e.g. `/en/produkty`) → 308 to the localised slug.
4. Generates the per-request CSP nonce and security headers (section 7).

Unknown paths are rewritten to `/<locale>/unknown/<path>` and fall into `src/app/[locale]/[...rest]/page.tsx`, which calls `notFound()` → localised `not-found.tsx` with HTTP 404. Nothing redirects to the homepage.

**Why the internal `unknown` segment (UXA-01, 2026-10-11):** the rendered path must never mirror the URL one to one.
- **The router learns patterns:** Next.js 16's client router ("optimistic routing", `next/dist/client/components/segment-cache/optimistic-routes.js`) learns a route as a pattern whenever the URL maps one to one onto the rendered route, and then predicts other URLs from it without asking the server.
- **The catch-all became the pattern:** before the fix, an EN/DE 404 such as `/en/not-there` rendered `[locale]/[...rest]` from the identical path. The router therefore predicted the catch-all for every `/en/…` and `/de/…` link whose slug is not a Polish folder name (`products` → `produkty` is a proxy rewrite the client cannot see).
- **Those prefetches never settle:** the head-only prefetches of these links are not checked against the server's real tree, so they never settle and repeat. That was about 500 requests per second per tab, on the 404 page and on every later page of the session until a navigation exposed the mismatch.
- **Rewrite detection now applies:** with the extra segment, the client detects a rewrite and does not store the pattern, as it already did for PL (where the URL has no locale segment).

The segment is never visible in the browser and is not a folder under `app/[locale]`. `npm run test:notfound` guards this.

### Legacy URLs

`next.config.ts` → `redirects()` built from `src/content/legacy-redirects.ts`: every old page (`/p/o-firmie`, `/p/katalog`, `/en/p/about-us`, `/de/p/uber-uns`, the broken legacy `/en/p/kontakt` etc.), old homepage aliases (`/html/`, `/en/p`, `/de/p/index`) and **all 61 historic certificate PDF URLs** (`/html/images/certyfikaty/...pdf`) map with 308 to their new location. Old anchors (`#zaklad-uboju`) are preserved by browsers on redirect; new pages keep equivalent anchor ids where it makes sense.

---

## 2. Rendering model

- Every page is a **Server Component**. Pages are dynamically rendered because the nonce-based CSP requires a fresh nonce per request (Next.js docs: "Static vs Dynamic Rendering with CSP"). Content is static TypeScript, so render cost is low; HTML can be CDN-cached only without CSP nonces, so we accept dynamic rendering. If hosting cost matters later, switch to the documented SRI/hash approach (see `security.md`).
- Client Components are leaf islands only: mobile menu, desktop drum navigation, language switch (needs current path), contact router, directory filter, forms (enquiry dialog/form, careers form, form status), certificate viewer, home hero video, background video, scroll reveal, back-to-top tag.
- `generateStaticParams` returns the three locales so params are validated; `dynamicParams = false` on `[locale]`.

---

## 3. Directory structure

```
<repository root>
├── AGENTS.md, CLAUDE.md       AI workflow rules (CLAUDE.md imports AGENTS.md)
├── CHANGELOG_AI.md            task history
├── docs/                      this documentation (not public)
├── scripts/                   import-source-assets.mjs, import-certificate-scans.mjs,
│                              render-certificate-scans.py, build-privacy-drafts.mjs,
│                              og/cards.json (OG image spec)
├── tests/                     forms-session.test.mjs, drum-motion.test.mjs (unit),
│                              forms-api.test.mjs, navbar-browser.mjs, home-browser.mjs (local e2e)
├── public/
│   ├── photos/<category>/     WEBP photos, icons, og-default.jpg (generated by the import script)
│   ├── assets/brand|video     brand vectors, EU marks, background video (generated)
│   ├── documents/certificates|legal   certificate and tax strategy PDFs (generated)
│   ├── og/                    route-specific Open Graph images (not touched by the import script)
│   └── video/                 home hero loop (desktop, mobile) and poster (not touched by the import script)
└── src/
    ├── proxy.ts               locale rewrite + CSP nonce + headers
    ├── app/
    │   ├── [locale]/
    │   │   ├── layout.tsx     root layout (html lang, fonts, header, footer, skip link)
    │   │   ├── template.tsx   page-enter fade
    │   │   ├── page.tsx       home
    │   │   ├── produkty/ jakosc/ certyfikaty/ zaklady/ o-firmie/ sprzedaz-eksport/
    │   │   ├── kariera/ kontakt/ zapytaj-o-oferte/ biogazownia/ strategia-podatkowa/
    │   │   ├── polityka-prywatnosci/
    │   │   ├── wyslano/       form result page (no-JS fallback target)
    │   │   ├── not-found.tsx
    │   │   └── [...rest]/page.tsx   → notFound()
    │   ├── api/enquiries/route.ts   B2B offer form
    │   ├── api/careers/route.ts     job application + CV
    │   ├── global-not-found.tsx
    │   ├── sitemap.ts
    │   ├── robots.ts
    │   └── icon.svg
    ├── components/  layout/ navigation/ sections/ forms/ certificates/ products/ contacts/ ui/
    ├── content/     company, entities, plants, products, certificates, contacts, history, jobs,
    │                environment, biogas, navigation, legacy-redirects, media, privacy,
    │                privacy-drafts, generated/assets.json
    ├── i18n/        config (locales, L<T>, translation status), routes (slug map),
    │                dictionaries (pl/en/de UI strings), index (helpers)
    ├── lib/         validation/ security/ forms/ mail/ rate-limit/ files/ seo/ env.ts
    └── styles/      tokens, base, components, sections, pages, art (.css)
```

---

## 4. Component boundaries

| Layer | Responsibility | May import |
|---|---|---|
| `content/*` | Facts only. Typed data, localised strings, source references. No JSX. | `i18n/config` (types), `i18n/routes`, other `content` |
| `i18n/*` | Locale list, slug map, UI dictionary, helpers | nothing domain-specific |
| `lib/*` | Server logic (validation, forms pipeline, mail, rate limit, files, SEO builders). Server-only modules import `server-only`. | `content`, `i18n` |
| `components/ui` | Primitive presentational parts (Icon, Photo, Reveal, MobileFold, AmbientVideo, Contact, JsonLd) | nothing domain-specific |
| `components/<domain>` | Render domain data (CertificateStatus, CertificateArchive, ContactRouter, DirectoryFilter, ProductGroups…) | `content` types, `ui` |
| `components/sections` | Page sections composed from domain components | all of the above |
| `app/[locale]/*` | Page assembly, metadata, JSON-LD | everything |

Rule: **a registration number, phone or certificate value is written exactly once**, in `content/`. Footer, Plants, Contact and JSON-LD render the same objects.

---

## 5. Content / data architecture

```ts
// src/i18n/config.ts
type Locale = (typeof locales)[number]              // 'pl' | 'en' | 'de'
type L<T = string> = Record<Locale, T>              // localised value
```

Source codes from `content-source-map.md` appear in `source` fields only in `history.ts` (e.g. `source: 'PT:p_o-firmie'`); for all other content the per-page mapping in `content-source-map.md` is the reference.

Core entities (`src/content`):
- `entities.ts` — 5 legal entities: id, legal name, role, registered address, NIP/VAT, REGON, KRS, vet number, BDO, map URL, office phone/e-mail.
- `plants.ts` — production sites linking to entity ids: activity (from source), production address, which certificates exist.
- `contacts.ts` — people/departments per entity: department (L), name, phone, e-mail, `routing` tags (buy-beef, offal-uppz, sell-cattle, quality, transport, supply, jobs, accounting, data-protection).
- `certificates.ts` — one record per issued certificate: entity, standard, version, result (grade/level/score), audit type, issue date, expiry date, certification body, files per language. **Status (current/archive) is computed from `expiresOn` vs. today**, never stored.
- `products.ts` — 4 groups + UPPZ: name (L), verified statements with `source`, `pending` list of data to request from the client, routing tag.
- `history.ts` — milestones with `historical: true` flag for capacity values.
- `jobs.ts` — job postings (PL source values only; EN/DE flagged).
- `environment.ts`, `biogas.ts` — verbatim legal content for the EU project.
- `company.ts` — group-level facts (founded 2009, markets named on source, sales office).
- `navigation.ts` — main nav, footer groups.

- `media.ts` — what each picture shows (pages never use file paths); `generated/assets.json` — image sizes written by the import script.
- `privacy.ts`, `privacy-drafts.ts` — privacy policy content and the unpublished EN/DE drafts (switch `privacyTranslationApproved`, C-53).

Open (unconfirmed) data is not modelled as a type. It is tracked by id in code (`pending: C-xx` in comments and source fields) and in `client-confirmations.md`; the site shows the safest source wording or nothing, never a public "do potwierdzenia" label.

---

## 6. Localisation architecture

- UI strings: `src/i18n/dictionaries/{pl,en,de}.ts`, typed against PL (`Dictionary = typeof pl`), so a missing key is a type error.
- Content strings: `L<string>` inside content files.
- `src/i18n/config.ts`: `translationStatus = { pl: 'source', en: 'draft', de: 'draft' }`.
  - `draft` locales render a small, honest notice in the footer ("English version under review. The Polish version is authoritative.") and send `robots: noindex` + are excluded from `sitemap.xml`. hreflang alternates are emitted only for approved locales.
  - Switching a locale to `approved` (after professional review) removes the notice and enables indexing; no code change elsewhere.
- **Legal texts are never machine translated**: privacy policy, biogas EU disclosure and tax strategy render the Polish original on EN/DE with a localised explanatory sentence.
- Job advert: PL source values; EN/DE show the same Polish-source facts (pay, benefits) with translated labels and a note that recruitment is conducted in Polish (pending client confirmation).
- Number/date formatting via `Intl` per locale (`98,60 %` / `98.60%`).
- **Language switch** (`components/navigation/LanguageSwitch.tsx`, UXA-02): plain links to the same route in the other languages (`href()`), which carry the page's context. The rules live in `i18n/language-switch.ts`.
  - **Which parameters travel:** only listed, well-formed ones. Contact: `temat` (opens at `#pomoc`). Offer: `produkt`. Result page: `form`, `status`, `t`, `sig`. Anything else, and every parameter on other pages, is dropped.
  - **Anchors:** a valid anchor (element ids are the same in every language) travels too. It needs JavaScript and is re-read on hover, touch and focus.
  - **Without JavaScript:** `useSearchParams` suspends during server rendering, so the server-rendered links come from the request's query. `src/proxy.ts` always sets `x-search`, overwriting anything a client sends; the layout passes it down as the Suspense fallback. With JavaScript the live query takes over.
  - **Contact topics:** the contact router writes a chosen topic to the address with `history.replaceState` (`?temat=`), so a refresh, a shared link and the switch keep it.
  - **No open redirect:** the target path never comes from the URL.

---

## 7. Server / client boundaries

- Secrets live only in server env (`lib/env.ts`, imported with `server-only`). No secret has a `NEXT_PUBLIC_` prefix. The only public env is `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (site keys are public by design).
- Client components receive plain serialisable props (strings, ids) from server components; they never import `content/contacts` wholesale except the routing data they need.
- `lib/mail`, `lib/rate-limit`, `lib/files`, `lib/security` are server-only.

---

## 8. Forms architecture

```
<form action="/api/enquiries" method="post">   ← works without JavaScript
   │  (JS enhancement: fetch with Accept: application/json, inline errors, focus management)
   ▼
Route handler (Node runtime)
   1. method + content-type check, content-length cap
   2. same-origin check (Origin / Sec-Fetch-Site / Referer)
   3. rate limit (IP hash + route)            → lib/rate-limit (memory | Upstash REST)
   4. parse formData, honeypot + min-time check
   5. Turnstile verification if configured     → lib/security/turnstile
   6. Zod schema (normalise, trim, length caps) → lib/validation
   7. CV: size, extension, MIME, magic bytes, filename sanitising (careers only) → lib/files
   8. build plain-text + escaped HTML e-mail   → lib/mail/templates
   9. send through adapter                      → lib/mail (log | smtp | resend)
  10. respond: JSON {ok|errors} or 303 → /wyslano?form=…&status=…&t=…&sig=…
```

**Result page without JavaScript (GAP-14, UXA-02, 2026-10-11):**
- **What the redirect carries:** the 303 adds the time `t` and an HMAC `sig` over form, status and time (`lib/forms/result.ts`). The key is derived from `RATE_LIMIT_SALT` with its own purpose label, so no new secret is needed. Without a usable value (missing, empty, under 32 characters) the redirect carries neither and the page stays neutral, in every environment (SECURITY-001, [`security.md`](security.md) §2.8).
- **What the page shows:** `/wyslano` (`/en/sent`, `/de/gesendet`) states an outcome only for a valid signature at most an hour old (`isConfirmedFormResult` in `lib/forms/context.ts`):
  - success: thank-you text;
  - a confirmed failure: error text, direct contacts and the way back to the form;
  - anything else (no parameters, a typed `?status=ok`, an altered or expired result): a neutral "Brak wyniku do wyświetlenia / No result to show / Kein Ergebnis vorhanden" with the direct contacts and the same links. It never claims that a message was or was not sent.
- **Unaffected by language:** the signature does not cover the language, so the language switch can carry the parameters.
- **Early failures:** for failures before the form body is read (rate limit, unreadable body), the page language comes from the same-origin `Referer` path; otherwise Polish, as before.
- **With JavaScript** the forms show their result inline and never reach this page.

- Recipients come from env (`SALES_FORM_RECIPIENT`, `CAREERS_FORM_RECIPIENT`). In production a missing recipient or mail provider returns **503 with direct phone/e-mail alternatives**; submissions are never silently dropped. In development the `log` adapter prints a redacted summary and writes nothing to disk.
- CV files are processed in memory and attached to the e-mail; they are never written to disk or `public/`.
- Product pre-fill: `/zapytaj-o-oferte?produkt=cwierci` pre-checks the matching option (whitelisted values only).

---

## 9. Asset strategy

- `scripts/import-source-assets.mjs` copies an explicit **allow-list** from `../source-assets` into `public/photos`, `public/assets` and `public/documents`, crops images whose transparent "swoosh" curve was baked in (keeps the fully opaque top region), flattens near-opaque alpha, re-encodes video with ffmpeg if available, and writes `src/content/generated/assets.json` (dimensions for `next/image`).
- Research, raw HTML, page archives and internal notes are never copied.
- `next/image` serves AVIF/WebP at responsive widths; only the home hero poster loads eagerly with `fetchPriority="high"` (Next 16 deprecates `priority`). The header wordmark is a CSS mask of `logo.svg` (embroidery), not an image element.
- The home hero video and poster live in `public/video/` and are encoded by hand from a source outside the repository (`asset-map.md`, "Home hero video"); `/video/*` is cached for 7 days like `/assets/*`.
- Brand: `logo.svg` (wordmark) and `horns.svg` (extracted from the legacy sprite vector paths).
- Line icons are re-drawn as inline SVG components (legacy icons are embedded bitmaps).
- Certificates: original PDFs at stable, readable paths `public/documents/certificates/<site>/<file>.pdf`. On the Certyfikaty page `CertificateFiles` (with `pdf`) renders two rows per certificate, for current cards and archive rows:
  - "Podgląd": scan viewer, `data-cert-view`;
  - "Oryginał PDF": plain links, not intercepted by the viewer, working without JavaScript.

  Home and Jakość keep the single preview row. `npm run test:certs` checks every link against the file and the displayed certificate.
- **Certificate archive on phones (UXA-07):** below 40rem, CSS lays out the same archive table (`CertificateArchive`) as one entry per certificate.
  - **Entry:** year and standard; result (if any) and validity with the archive badge; then the labelled "Podgląd" and "Oryginał PDF" rows with 44 px buttons.
  - **Markup:** no second copy, so every PDF is still linked once. Explicit table roles keep the table semantics when the display changes. The field labels are visible only on phones and hidden from screen readers, which use the column headers.
  - **Link names:** archive links name the plant too, e.g. "IFS Food 2023 (Zakład uboju, Linne)", because both plants have certificates with the same title.
  - **Larger screens:** from 40rem the table is unchanged.
  - **Test:** `npm run test:archive`.

Details in `asset-map.md`.

---

## 10. Design system (summary)

- Fonts: Barlow Condensed (display, 500/600/700) + Source Sans 3 (text, 400/600/700) via `next/font/google`, self-hosted at build, `latin-ext` subset for Polish.
- Tokens in `src/styles/tokens.css`: beef red `#C2000B` (accent, CTAs only), deep maroon `#2B0000`, dark brown `#1E0C06`, warm brown `#562E08`, paper `#F5F1EA`-family off-white, charcoal text `#26211E`, steel grey for data rules.
- Square-edged layout (radius 2px max) for content: rules and tables instead of cards, tabular numerals for data. Deliberate exceptions: the crafted header and the hero CTA use soft upholstered radii (6–16 px), fabric grain and stitched seams (NAV-005); the DESIGN-001 layer (below) gives the stitched panels, certificate cards and content photos 10–14 px radii.
- Motion: CSS transitions on transform/opacity; one orchestrated moment per major page; `prefers-reduced-motion` disables movement. The interactive desktop selector has its own cancellable motion controller (below).
- **Focus ring (A11Y-001):** every link, button and field keeps the global `:focus-visible` outline from `base.css` (3 px, 2 px offset). It is never removed and never replaced by a colour change alone. Its colour is `--focus`: blue `#0a58ca` on light surfaces, light blue `--focus-on-dark` (`#9cc3ff`, 9.5–10.6:1 on maroon and dark brown) on dark ones.
  - **Dark surfaces** set `--focus` for everything inside them: `.hero`, `.chain`, `.section--dark`, `.logistics__panel`, `.origin__panel`, `.sales-card--dark`, `.site-foot`, `.mmenu__panel`. A new dark surface joins that list.
  - **Two colours where the background can be light or dark** (WCAG technique C40): a halo fills the 2 px gap. It is maroon over the hero video, and cream on the floating back-to-top tag and on the skip link, which opens over the red wordmark on tablets. The blue ring and the beef red have the same lightness (1:1), so a ring must never rely on its colour next to red.
  - **Covered rings:** a focused element that a positioned neighbour would cover is lifted with `z-index`. This applies to the header arrows (above the carriage), the language items (above the raised current one) and the contact links (above the department ear tag). A focused back-to-top tag stays shown even when its collision check would hide it.
  - **Dialogs:** `scroll-padding-block` on `.dlg` keeps room for the ring when Tab scrolls a field to the dialog's edge.
  - **Exceptions kept:**
    - the drum tabs use an inset ring (−4 px); on the current tab the carriage covers its left and right sides, while the top and bottom stay visible;
    - the certificate viewer keeps its own light 2 px ring;
    - the hero video toggle keeps its white 2 px ring, now with the maroon halo.
  - **Checks:** `npm run test:focus`.
- **Beef identity system (DESIGN-002, experimental; builds on DESIGN-001 below):** one shared visual language on every page instead of page-specific decoration. Marks come from `components/brand/BrandMarks.tsx` and are styled in `src/styles/craft.css` (sections 1–8); all marks are decorative (`aria-hidden`), the adjacent text carries the meaning. (A) **Embroidered icons** (`BrandIcon`): line drawings as CSS masks over the wordmark's red satin-thread texture, raised by a shadow: the legacy category icons (`public/photos/icons`: cow, bull, steak, liver, truck, handshake, globe) plus additions drawn in the same style (`public/craft/icons`: knife, box, cold, seal, certificate, pin, clipboard) and the bull outline. (B) **Patch** (`BrandPatch`): cream felt, red satin edge, inner running stitch, "MCKEEN-BEEF" along the top and an existing label along the bottom (the page's navigation label, or "LISKÓW · 2009" from the trust strip), a motif in the middle; each page's main mark sits in the page header's `motif` slot (`PageHeader`), large on desktop, a small patch at the top right on phones. (C) **Cuts diagram** (`CutsDiagram`): the brand beef-cuts line art sewn in red thread, on a felt plate in the Produkty header and on the ćwierci product visual. (D) **Ear-tag labels**: tan or red embossed tags with a punched hole for real labels only (eyebrows, jump links, quality systems, control areas, locations, company roles, departments, years, market columns, directory filters); every section title on a page gets a generated red ear tag with its number (CSS counter on `#main`, `content: … / ''` so assistive technology skips it; not in `.prose` legal texts) and a red running stitch under it. (E) **Stitched surfaces**: warm-white cards with a running stitch inside the edge and a slight lift (certificate labels with a red stitch, product blocks, company cards, job card, ledger, structure links, router answer, pending items, archive), dark variants with a light thread, recessed stitched insets, stitched list bullets, stitched seams on band edges and footer dividers. List bullets follow the list's meaning (UXA-19): a red running stitch by default (statements, principles, legal text) and a stitched check (`.ticks--check`) only on lists of what a plant or the company has or does; both use the light thread on dark surfaces, and no list uses a cross, which reads as "no". Links and buttons never get their stitch from `outline`, which stays their focus ring; they use a pseudo-element. Page motifs: home = group patch (bull) in the production chain plus step icons and number tags; Produkty = cuts plate; Jakość = seal; Certyfikaty = certificate; Sprzedaż i eksport = truck; Zakłady = pin; O firmie = the largest bull patch; Kariera = knife; Kontakt = handshake; Zapytaj o ofertę = steak; footer = bull patch on every page; Biogazownia, legal pages, Wysłano and 404 stay calm (no main motif).
- **Crafted layer (DESIGN-001, experimental):** `src/styles/craft.css`, imported last in `[locale]/layout.tsx` and `global-not-found.tsx`, carries the header's material into the rest of the site. The header, the hero and the trust strip are not touched. Contents: (1) a fainter version of the header's fractal-noise grain (no weave) on `body` and the paper-2 bands (`.section--paper2`, `.quality-home`, `.origin`); (2) sewn seams drawn as background layers (dashed thread plus a light fold) along the edges of those bands, at the bottom of page headers (which also cast a soft lip) and along the top of the footer; (3) the UPPZ note as a recessed panel with an inner stitch, certificate cards as sewn labels (10 px radius, dashed outline inside the frame, slight lift); (4) the embroidered brand bull (`.cattle-mark`: `cattle-outline.svg`, traced from the brand line art, as a mask over the wordmark's satin texture, a constant 2.2 px stitched line via `vector-effect: non-scaling-stroke`, raised by drop shadows; a brighter thread on dark backgrounds), decorative and `aria-hidden`, in three places only: the production-chain introduction (home), the footer brand column and the O firmie page header (desktop); (5) ear-tag-like labels (slightly arched, embossed, a punched hole) for the real step numbers of the production chain and for the "illustrative photo" note; (6) content photographs as mounted prints (10 px radius, a fine light edge, a quiet shadow; full-bleed bands stay square; certificate scans are untouched), the three chain photographs in varied proportions (the Hereford close-up leads), and a gentle grade (`.photo--natural`) on the two golden-hour pasture photographs. No new animation, script or dependency.

### Desktop drum navigation

`SiteHeader` keeps a single sticky bar: the embroidered wordmark (home link), the page selector, the language switch and the offer-modal CTA. At **76rem and above**, `components/navigation/DrumNav.tsx` shows all nine pages; the grid is `auto minmax(0, 1fr) auto`, so the selector takes all the room between the wordmark and the language/CTA group (measured: ≈ 670 px at 1216 px, ≈ 730 px at 1280 px, ≈ 780 px from 1440 px; 16/24 px from its neighbours). Desktop height is **104 px** (`--header-h: 6.5rem` in `tokens.css`), which also drives anchor, hero and sticky offsets. Below that breakpoint the header remains **76 px** and the existing `MobileMenu` with its eight-link list is unchanged (the wordmark leads home); there is no selector inside the mobile dialog.

The header (NAV-005, "Premium Crafted / Soft Tactile Comfort", `components.css`) is one warm cream upholstered surface: a few-percent fractal-noise fabric grain (inline SVG data URI) and a fine weave over a vertical light gradient, a sewn dashed seam along the lower edge, a soft lip and a cast shadow. The wordmark is embroidered into it: a satin-stitch texture (diagonal thread gradients) masked by `logo.svg`, raised by drop shadows on a wrapper (a filter on the masked element itself would be clipped by the mask), inside a dashed seam; the link carries the accessible name. The selector channel and the language track are soft recesses of the same material; the active language and the selector carriage are small raised cushions; the CTA is a soft red cushion with an arrow. No metal, screws, plates or glass. While the selector moves (`data-phase` dragging/coasting/snapping), `.site-head:has(…)` raises the registered property `--glint` (360 ms transition): a light pool over the selector and the CTA's lit edge brighten; the red stitch marks on the carriage glow. Nothing outside the selector moves.

- **Data and routes:** NAV-003 prepends `home` to the eight entries from `content/navigation.ts` in `SiteHeader` for the desktop selector only. Order: Home, Products, Quality, Certificates, Export, Plants, About, Careers, Contact. URLs use `href(locale, key)` and labels use existing `navShort`/`nav` translations. Home maps to `/`, `/en` or `/de`; the mobile list still uses the original eight `mainNav` entries. Instructions live in `d.drum` (`previous`, `next`, `hint`, `keyboard`) in all three dictionaries. `usePathname` synchronizes direct visits, language changes and Back/Forward using exact route matching, so locale roots cannot incorrectly claim subpages. A page outside the nine routes has no false `aria-current` and never redirects automatically.
- **Rendering (NAV-005, crafted):** the nine pages are real links in a stitched channel (Barlow Condensed 600, `clamp(15.5px, 10.6px + 0.4vw, 17px)`, measured to fit every locale untruncated at 1216–1920 px, quiet seams between tabs). A raised cream **carriage** travels to the chosen tab: `paint()` writes its centre and width (`--x`, `--w`, interpolated between neighbouring tabs from measured link boxes; across the Contact/Home wrap it runs back along the rail, eased so that it leaves and arrives at a normal step's pace) and a reel angle (`--turn`). Since NAV-006 the carriage moves on an arc instead of a flat slide: a frame loop writes `--lift` (0–1) and `--tilt` (−1–1); the carriage's own transform adds `perspective(420px)`, rises up to 12 px towards the viewer and 2 px up while it travels or is held, and leans up to 9° (`rotateY`) into its travel; a light spring (≈ 8 Hz, damping 0.55) carries the lean, so the detent swing rocks it back once (≈ 3.5°). It comes down into the detent over the last 44 px; its shadows grow with the lift and the edge turning away darkens slightly. At the lock it presses 0.8 px and the stitch marks close on the label (Web Animations, 170 ms). A swing past the first or last tab continues outwards instead of jumping across the seam. The carriage holds a small **reel**: nine faces on a horizontal axis (`rotateX`, 40° apart, radius 46.7 px for a 34 px face) that turns one face per page, so labels roll vertically through the carriage while it slides, and the chosen label settles between two red stitch marks. The tab under the carriage keeps its link and name but hides its text. Tab boxes are re-measured with a `ResizeObserver` (web-font arrival, viewport). Before hydration and without JavaScript the plain links work and the arrows are hidden. NAV-004 (five readable faces on a long drum) and the first NAV-005 roller were intermediate steps.
- **Motion:** `drum-motion.ts` is independent of React and the DOM. Positions are measured in detents. One `requestAnimationFrame` loop handles capped exponential momentum and the snap, whose profile NAV-006 replaced (formerly a quartic ease-out): a glide (cubic Hermite; momentum from a previous movement carries over, from rest it starts at half its mean speed) that slows near the tab, a pull into the detent over the last 0.14 detent so that it arrives with a little momentum (at 230 ms), and a damped swing of ≈ 0.05 detent (≈ 3.3 px measured) past the tab that settles before the lock. The swing is the same for any distance; very short corrections scale it down. Phase timing is unchanged: `snapping` 240 ms, `locked` 110 ms, lock at ≈ 350 ms. Only the final lock may call `router.push`; intermediate tabs never navigate. A new selection cancels the preceding loop and its scheduled navigation. Idle motion schedules no frames; continuous transforms are written to CSS variables without React updates every frame.
- **Input:** a click (or Enter) on any tab selects it: the carriage travels straight along the rail (`railPosition`; before NAV-006 the shortest arc sent tabs more than four away across the Contact/Home seam, a full-width sweep and back), locks, then navigates (the link's `onNavigate` is intercepted; modifier-clicks keep native link behaviour). Horizontal pointer drag anywhere on the rail moves the carriage one detent per tab spacing, with a 7 px intent threshold, pointer capture, velocity capping, momentum and click suppression after dragging; dragging stays within the rail (no wrap). A sideways wheel or trackpad swipe over the rail turns the selector (vertical wheel movement always scrolls the page; the former wheel-mode button was removed). The arrow buttons step with wrap-around (Contact → Home).
- **Keyboard:** roving focus: the nine links form one tab stop (the selected link has `tabindex="0"`); Left/Right move the selector and focus without navigating, Home/End travel straight to the first/last, Enter opens the focused (shown) page after the lock, Escape cancels. The arrows are separate buttons.
- **Cancellation:** new input, Escape, focus leaving the control, outside pointer/link actions, Back/Forward, window blur, page hiding, breakpoint or motion-preference changes, offer-modal opening and effect cleanup cancel queued movement/navigation. An already dispatched router request is managed by Next.js; cancellation guarantees apply to navigation still waiting for the lock.
- **Accessibility:** native navigation with real links (all nine also available to screen-reader link lists), visible focus, localised instructions (`aria-describedby`) and a polite status announcement after a choice settles. `aria-current="page"` describes the current URL, independently of a previewed position. Reduced motion disables the controller's frame loop and the carriage dynamics: the carriage jumps without travelling, turning, lifting or leaning, and there is no lock click; controls and navigation remain usable. No WebGL, animation libraries, sounds or CSP changes are needed.

### Home hero and intro

- **Hero (HERO-002/003, `app/[locale]/page.tsx`, `art.css`):** the footage fills the whole hero in natural colour, without a veil: phones 1:1 (the source's full height, so the least enlargement), tablets 4:3, desktop `clamp(38rem, 86svh − header, 52rem)`. It holds only the H1 and one CTA (the offer modal; its href is the no-JS fallback), scaled with the headline; the trust strip follows unchanged. The former hero copy opens the products and integration-chain sections. The H1 (`clamp(2.75rem, 1.5rem + 5.4vw, 7.5rem)`, 1–3 lines) starts at 37 % of the hero height: measured on all 250 frames, the sky above 35 % would give white text 1.2–1.6:1, while the band below keeps ≥ 3.2:1 against its brightest tenth and 5:1 or more against its median; a discreet text-shadow does the rest.
- **Poster and LCP:** `next/image` renders the 1920×800 poster (frame 0 of the video) eagerly with `fetchPriority="high"` and `sizes` equal to the real rendered width of the cover image (2000px / 180vw / 240vw + 4px), so it is never upscaled. The video is first shown 1px inside the poster box; otherwise browsers report the later video frame (rounded one pixel larger) as the LCP element. LCP keeps an element's size from its first paint, so 240 ms after the fade starts the video grows to the full box and no static poster edge stays around the moving picture (`test:home` checks both). The header's tiny fabric tile is an earlier, smaller LCP candidate and is superseded by the poster.
- **`components/ui/HeroVideo.tsx`:** attaches the source after hydration only (< 48rem the square crop, otherwise the original full frame), never with reduced motion, Save-Data or a 2G/3G connection. Playback starts (the `autoplay` attribute, and explicitly on `canplaythrough`, which also survives React's development double effects) only once the browser can play through, so the first frame shown is frame 0, identical to the poster: a 160 ms fade reveals it without a jump, ghosting or stalls. A refused autoplay (`navigator.getAutoplayPolicy`, or a refused `play()` after a 4 s check) shows the play button; failures keep the poster. The pause/resume button (localised `aria-label`) covers WCAG 2.2.2. No scroll coupling.
- **Intro (INTRO-001):** an inline gate script with the request nonce, first in `<body>`, sets `intro-seen` on `<html>` before the first paint unless this is the tab session's first page view and a home page (`sessionStorage` key `mb-intro`), and sets it anyway after 1.6 s. CSS in `art.css` then runs only on that first home view: the footage settles (scale 1.06 → 1), the header surface fades in and the embroidered wordmark, selector, language switch and CTA follow, then the H1 and finally the CTA (≈ 1.3 s). The existing 260 ms page-enter fade opens the sequence untouched; overriding it would restart it when the class is set. Opacity/transform only, links usable throughout, nothing waits for JavaScript or the video; without JavaScript the intro plays and ends visible, and reduced motion disables it.

### Home page flow (UX-IA-001 stage 1)

- **Order (`app/[locale]/page.tsx`):** hero → trust strip (both unchanged) → Asortyment → "Jedna grupa, cały proces" → quality and certificates → environment → sales, markets and sites → contact and cooperation. Approved by the user on 2026-10-11; the plan for the other pages needs separate approval per stage.
- **Chain (`components/sections/ProductionChain.tsx`):**
  - Steps 1, 2, 3, 5 and 7 link to where the step is described, labelled with existing names: the contact topic "Sprzedaję bydło", the plant cards on Zakłady (`entities.ts` anchors and `place`), and the freezer section `#mroznia`.
  - Packing and transport have no link: the product range above and the sales section below already lead there.
  - A ghost button leads to Zakłady.
  - **Layout (stage 1.1, `pages.css`):**
    - **Below 64rem:** a vertical timeline. A 2 px beef-red thread runs through the horn markers (one segment per step, masked by the markers' dark ground). The number tag, the embroidered icon (2.2rem, smaller than the tag) and the title form one row, with the text (max 40rem) and links indented under the tag.
    - **From 64rem:** two rows on horizontal threads. Steps 1–4 run from the animal to the product, steps 5–7 to the customer. Each step is a five-row subgrid (marker, badge, title, text, links), so within a row the titles, texts and links line up in every language. The second row's space sits on its markers' top margin, and its thread is offset by the same amount.
    - **Plants button:** placed absolutely in the free fourth cell of the second row, bottom-aligned with its links (it wraps for long labels). This depends on seven steps in four columns.
    - **Reveal:** the threads draw in with the steps' reveal and inherit its stagger; nothing animates under reduced motion.
  - **Links:** quieter than the descriptions' neighbours: a warm light tone (#e7b8b0), a fine coral underline and a coral arrow, full coral on hover.
    - They are inline-block, and the arrow has no net width, so it never wraps alone.
    - They are at least 44 px high, or about 30 px with a fine pointer from 64rem, so a two-link step does not stretch its row.
- **Environment (`.env-home`, stage 1.3, `art.css`):** between quality and sales.
  - **Content:** the texts are `environment.ts`, shared with Jakość, so they are identical on both pages. Each fact has an `id` (`waste`, `solar`, `biogas`) so the home can place it. The red eyebrow reuses Jakość's section title (`quality.envTitle`: Środowisko / Environment / Umwelt); it is the only text added.
  - **Layout:**
    - Waste and photovoltaics are ruled rows (2 px top rule, 1 px rules) with embroidered icons (`recycle`, `solar`), like the markets ledger below.
    - The biogas plant project is the one `stitched` card, marked with a small felt patch (`BrandPatch` size `sm`: no lettering, so no company or brand is named with the project; GAP-07, C-64) with the `biogas` motif. The card holds the existing link to the project page (`/biogazownia`).
    - Phones: head, rows, card, with the patch beside the card's title. Tablets (from 40rem): the rows side by side, the patch left of the card's text.
    - From 64rem: two columns (5fr / 7fr). The head and the rows sit on the left; the card on the right runs from the eyebrow to the rows' bottom line, patch on top. Its content is 1–34 px shorter than that column at 1024–1920 px, and the difference goes into its row gaps.
- **Sales, markets and sites (`.logistics`):** one section. The truck photo is full-bleed. The former "Rynki i zakłady" band (H3 heading and `MarketsLedger` with H4 titles) is part of it.
  - The band's GmbH line was removed with the user's consent on 2026-10-11 (PL "Sprzedaż: MCKEEN-BEEF SO GmbH, Oelde (Niemcy)", and EN/DE).
  - The sales company and Oelde stay in the panel text and in the ledger's Oelde row. All other texts are kept.
  - **One sewn board (stage 1.2, `art.css`):** the dark sales panel and a light card holding markets and sites are joined without a gap. Corners are square where the pieces meet and rounded outside; each piece keeps its own running stitch.
    - Inside the card, `MarketsLedger` drops its own card styling, scoped to `.logistics`. On Sprzedaż i eksport it stays a card.
    - The panel's contacts are ruled rows like the ledger rows (`--on-dark-rule`).
  - **Below 64rem:** the panel overlaps the photo by 3rem, full container width. The card is sewn on directly below, so the order is message, contacts, then markets and sites.
  - **From 64rem:**
    - The card sits on the left from the photo's lower edge, so the trailer lettering stays clear.
    - The panel on the right keeps its own height and stands on the card's bottom line (`align-self: end`). Its width is 24–30rem from 64rem and 34rem from 80rem.
    - The panel therefore rises into the photo, over the road, by as much as it is taller than the card, capped at `--board-lift-max` (10rem). Measured at 1024–1920 px: PL/EN 70–115 px, DE 116–156 px.
    - Neither piece is stretched, and both end on one line in every language.
    - This assumes the panel stays taller than the card. If added markets or sites made the ledger taller, the panel would start below the photo's edge: check the layout then.
    - Contact rows get 0.5rem padding.
- **Contact and cooperation (`.coop`):** one sewn board in the card cloth.
  - The buyer's side has the beef-red edge, the handshake icon, the router's "Kupuję wołowinę" label and hint, and the enquiry CTA (the modal with JavaScript).
  - A dashed seam (vertical from 64rem, horizontal on phones) separates it from the other audiences' topics: Sprzedaję bydło, Dostawy i zaopatrzenie, Jakość / audyt (each `/kontakt?temat=…#pomoc`) and Kariera (`/kariera`). They appear as ruled rows with embroidered icons, followed by "Wszystkie działy" (`/kontakt#dzialy`).
  - Labels and hints come from the contact router; phones and e-mail are not repeated (they are in the sales panel directly above).
- **Rhythm:** surfaces alternate light → dark (chain) → paper-2 (quality) → light (environment) → photo and paper-2 (sales) → light (contact) → dark footer. No extra colour is used: the environment's stitched card is the same cloth as the certificate labels above and the markets card below. The page ends with the contact step instead of the environment teaser.
- **Checks:** `test:home` covers the order, the chain links, the sales composition and the contact paths in PL/EN/DE.

### Back to top (UX-001)

- **Component:** `components/ui/BackToTop.tsx` plus `BackToTop.module.css`, rendered once by `[locale]/layout.tsx` as the last child of `<main>`, so every localised page has it; the accessible name is `d.a11y.toTop` (PL/EN/DE). It is a cream felt cattle ear tag (the crafted layer's grain and felt, a punched hole, a dashed running stitch inside the edge, a soft cast shadow) with an embroidered up arrow (`public/craft/icons/arrow-up.svg` masked over the red satin thread, like the `.bicon` icons). It sits fixed at the bottom right, 1rem from the edges (1.5rem from 64rem) plus `env(safe-area-inset-right/bottom)`, 54×62 px on phones and 58×68 px on desktop (enlarged on 2026-10-11 from 48×56 / 52×60 px), quieter than the red CTAs. A 1 px brown edge in the shadow keeps its silhouette readable on the cream paper; the arrow is 1.6rem (1.75rem on desktop). `z-index: 30` keeps it under the header (40), the mobile menu (60) and dialogs (top layer). Hover lifts it by 3 px (pointer devices only); focus shows the global focus ring.
- **When it shows:** hidden at the top; shown after 600 px of scroll, but only while its box (plus 6 px) covers no link, button, field, label, `summary` or form in `<main>` and no footer text, link or mark (the empty footer surface may lie under it). It hides at once when something comes under it and reappears only after its spot has stayed clear for 250 ms, so it does not blink over link-dense content. At the very end of a page, where nothing moves any more, it rises in 16 px steps (up to 128 px) to the first clear spot, so it is always reachable there. Checks run once per frame on scroll, on resize and on `ResizeObserver` changes of `<main>` and the footer; content that is not rendered (closed `<details>`) is skipped via `checkVisibility()`. While a field of a page form has focus, CSS (`:has`) hides it. State lives in attributes and the `--lift` variable; scrolling never re-renders React.
- **Activation:** smooth scroll to the top (instant under `prefers-reduced-motion`), no hash in the URL; keyboard activation moves focus to the header wordmark, so the next Tab continues from the top.
- **Without JavaScript:** a plain `#top` link (HTML scrolls to the top of the document; no element id needed). Without a collision check it is more reserved. Where scroll-driven animations and `timeline-scope` are supported, CSS reveals it between 520 and 640 px (`scroll(root)`) and hides it as soon as the footer starts to enter the viewport: the footer gets a view timeline (`--to-top-footer`) that the body shares with the tag. On pages with a form in `<main>` (Zapytaj o ofertę; Kariera, whose form is inline without JavaScript) it stays hidden. Mid-page it can still lie over a link while the page scrolls. Elsewhere it stays hidden. Hidden in print. No library, inline script or CSP change.

Verification commands and browser-runtime setup are documented in [`../README.md`](../README.md); current results are in [`STATUS.md`](STATUS.md).

## 11. SEO

`lib/seo` builds `Metadata` per page (title, description, canonical, hreflang for approved locales, Open Graph). Titles and descriptions come from the dictionaries (`<page>.title`, `<page>.description`). The description is also the Open Graph and Twitter description.

Certification claims in metadata always name the certified plant: IFS Food and BRCGS belong to the cutting plant in Lisków, never to the group (GAP-05). The share images with grades follow the same rule (`scripts/og/cards.json`).

JSON-LD: Organization (group) + Corporation entities, LocalBusiness-like `Place` per plant, BreadcrumbList on subpages, JobPosting on careers only when the job has a confirmed `datePosted` in `src/content/jobs.ts` (currently withheld, C-52). No rating/review markup.
