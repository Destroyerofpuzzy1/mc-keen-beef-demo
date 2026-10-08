# Asset map

**Source library:** `D:\Projekty\dla-klientow\mc-beef\source-assets` (relative to the site: `../source-assets`). This is the only source. There is no `mc-beef/photos` directory; older notes that mention it are obsolete.

**Import:** `npm run assets` → `scripts/import-source-assets.mjs` (explicit allow-list; nothing else is published). The script cleans and rewrites only its own output folders.

**App public assets (what the browser loads):**

| Folder | Content |
|---|---|
| `site/public/photos/<category>/` | Photographs as WEBP (`hero`, `cattle`, `quality`, `production`, `logistics`, `company`, `products`, `certificates`), category icons `icons/*.png`, OG images |
| `site/public/assets/` | Brand vectors (`brand/logo.svg`, `brand/horns.svg`, `brand/beef-cuts-line-art.svg`, `brand/beef-cuts-bull.svg`, `brand/eu/*`) and `video/cattle-grazing.mp4` |
| `site/public/documents/` | Certificate PDFs `certificates/<site>/*.pdf` and tax strategy PDFs `legal/*.pdf` |

Intrinsic image sizes go to `src/content/generated/assets.json`; pages ask `src/content/media.ts` for what a picture shows (`media.carcassInspection`), never for a path.

Chain: `source-assets` → `scripts/import-source-assets.mjs` → `public/photos|assets|documents` → `assets.json` → `media.ts` → components.

---

## Images in use (after the audit fix pass, 2026-10-06)

| Public path | Source (`source-assets/…`) | Used for |
|---|---|---|
| `/photos/hero/cattle-herd-sunrise.webp` | `images/hero/cattle-herd-golden-sunrise-hero.webp` (crop 1680×1015) | Home hero, default OG |
| `/photos/cattle/hand-feeding.webp`, `hereford-pasture.webp`, `hereford-bull.webp`, `misty-riverside.webp`, `grazing-poster.webp` | `images/hero/*`, `images/cattle/*` | Origin / welfare bands, Zakłady SH II band, Kontakt band (hidden on phones), video poster |
| `/photos/quality/carcass-inspection.webp` | `images/hero/carcass-inspection-clipboard-hero.webp` (crop 1080×860) | Home quality, Jakość control, Zakłady SH, UPPZ |
| `/photos/production/butcher-cutting.webp` | `images/production/butcher-cutting-beef-mesh-glove.webp` | Kariera, production chain, Zakłady CP |
| `/photos/logistics/truck-highway.webp`, `truck-trailer.webp` | `images/logistics/mckeen-beef-branded-truck-highway.webp` | Logistics band, Sprzedaż i eksport, Zakłady GmbH; trailer crop for the cold chain block |
| `/photos/company/staff-beef.webp` | `images/company/staff-presenting-beef-branded-uniform.webp` | Zakłady centrala |
| `/photos/products/raw-tbone-paper.webp` | `images/products/raw-t-bone-steak-butcher-paper-cutout.webp` (595 px, alpha kept) | Elementy wołowe, labelled "Zdjęcie poglądowe" |
| `/photos/products/miesa-drobne.webp`, `podroby.webp` | crops of `images/products/product-groups-panel-pl.webp` (660 px) | Mięsa drobne, Podroby, labelled "Zdjęcie poglądowe" |
| `/assets/brand/beef-cuts-bull.svg` | bull half of `brand/beef-cuts-bull-and-cow-line-art.svg` (viewBox crop) | Ćwierci wołowe: no authentic quarter photo exists, so the group uses this brand line art instead of a photo |
| `/photos/certificates/<pdf name>.webp` (61) | `images/certificates/<pdf name>-preview.webp` (1240 px), or for the 18 older certificates with only 600 px previews `images/certificates-rendered/<pdf name>.png` (150 dpi render of the original PDF, `scripts/render-certificate-scans.py`) | On-site certificate viewer and Certyfikaty thumbnails (`scripts/import-certificate-scans.mjs`, manifest `certificateScans` keyed by PDF path) |
| `/og/*.jpg` | composed from the images above + logo | Route-specific Open Graph images (see below) |

### Imported but no longer referenced (audit P1-02, P2-04, P2-05)

| Public path | Why it is not used |
|---|---|
| `/photos/products/cwierci.webp` | Tied, seasoned roast: reads as a restaurant dish, not an industrial beef quarter |
| `/photos/products/elementy.webp` | Sliced prepared steak: restaurant association |
| `/photos/quality/ifs-brcgs-banner.webp` | Dated meat/flare banner with floating marks, weaker than the real certificate documents |
| `/photos/company/europe-map.webp` | Decorative sepia map without readable locations and without Japan; replaced by the markets/sites ledger (`MarketsLedger`) |

They remain in the import list for the record and can be dropped from `IMAGES` once the client confirms.

### Open Graph images

`/og/{home,products,quality,careers}-{pl,en,de}.jpg` (1200×630, outside `public/photos` so `npm run assets` does not delete them; spec in `scripts/og/cards.json`, rendered in a browser on the dev server with the site fonts), composed from existing assets with the real page name in the site typography; every other route uses `/photos/og-default.jpg`. Mapping lives in `src/lib/seo/index.ts` (`ogImageFor`).

Line icons (cow, knife, truck, snowflake/cold, box, handshake, liver, steak, bull) are **redrawn as inline SVG** in `src/components/ui/Icon.tsx`: the legacy sprite icons are embedded bitmaps and cannot be recoloured or scaled cleanly.

## Certificate PDFs

Visitors no longer open PDFs: PL / EN / DE controls and the scan thumbnails open the authentic scan in `CertificateViewer` (native dialog, loaded on demand). The PDFs below stay published as archive files and for the legacy 308 redirects.

All 61 originals are published (archive must stay complete). Mapping: `source-assets/pdfs/certificates/<site>/<file>.pdf` → `/documents/certificates/<site>/<file>.pdf`.
Previews (WEBP scans) are **not** published by default; the certificate UI uses typographic data. The 2026 CP previews are imported for the certificate detail page thumbnails only:

| Record (content/certificates.ts) | PL | EN | DE |
|---|---|---|---|
| CP BRCGS 2026 | `cutting-plant-cp/cutting-plant-cp-2026-brcgs-pl.pdf` | `…-en.pdf` | `…-de.pdf` |
| CP IFS 2026 | `cutting-plant-cp/cutting-plant-cp-2026-ifs-food-pl.pdf` | `…-en.pdf` | `…-de.pdf` |
| CP BRCGS / IFS 2019–2025 | `cutting-plant-cp/cutting-plant-cp-<year>-<std>-<lang>.pdf` | ✓ | ✓ |
| CP EKO 2021, 2022 | `cutting-plant-cp/cutting-plant-cp-<year>-ekogwarancja-pl.pdf` | – | – |
| SH IFS 2019, 2022, 2023 | `slaughterhouse-sh/slaughterhouse-sh-<year>-ifs-food-<lang>.pdf` | ✓ | ✓ |
| SH EKO 2021 | `slaughterhouse-sh/slaughterhouse-sh-2021-ekogwarancja-{pl,de}.pdf` | – | DE |

Legacy URLs (`/html/images/certyfikaty/{SH|CP}/<year>/<original>.pdf`) redirect 308 to these paths (generated from `content/certificates.ts`, which stores the original filename of every file).

## Tax strategy documents

The legacy site only published HTML conversions of two 20-slide documents (no PDF on the server). The extracted text is mangled by that conversion, so it is not re-typeset. Instead each slide was captured from the live page at 2× resolution and assembled, unchanged, into:

| Public path | Source |
|---|---|
| `/documents/legal/strategia-podatkowa-2023-mckeen-beef-sh.pdf` | http://www.mckeen-beef.eu/p/strategia_podatkowa_2023_sh (20 slides) |
| `/documents/legal/strategia-podatkowa-2023-mckeen-beef-cp.pdf` | http://www.mckeen-beef.eu/p/strategia_podatkowa_2023_cp (20 slides) |

These are image PDFs (≈5.4 MB, not text-searchable). They are a faithful archive copy until the client supplies the original PDFs (`client-confirmations.md`). The `/strategia-podatkowa` page presents the key published facts as text for accessibility.

## Rejected assets (not imported)

| Asset | Reason |
|---|---|
| `hero/business-handshake-horns-overlay-hero.webp` | Office handshake cliché, logo baked in, wrong for production recruiting |
| `hero/holstein-cows-green-pasture-hero.webp` | Dairy breed for a beef business |
| `hero/cattle-hillside-pasture-sunset-hero.webp` | Generic landscape, cattle barely visible |
| `other/rodo-gdpr-smartphone-keyboard-*.webp` | Stock with baked text; legal pages need no image |
| `other/seedling-hands-recycling-environment.webp` | Green-washing cliché; environment section uses data instead |
| `other/office-desk-tablet-charts.webp`, `other/tablet-tech-icons-video-poster.webp`, `video/tablet-tech-icons-stock-loop.mp4` | Unrelated tech stock |
| `products/grilled-bone-in-chop-dark-slate.webp` | Likely pork/veal chop, cooked consumer styling |
| `products/grilled-steak-sliced-peppercorns-cutout.webp` | Cooked steakhouse imagery for a B2B raw beef supplier |
| `products/product-groups-panel-{pl,en,de}.webp` | Legacy flat graphic with baked text; replaced by HTML product groups (kept only as reference in source-assets) |
| `quality/ifs-brcgs-logos-beef-banner.webp` | Certification logos baked into a photo (imported once, now unused) |
| `quality/carcass-inspection-clipboard-cutout.webp` | Duplicate of the carcass hero scene |
| `cattle/cattle-herd-golden-sunrise-wide.webp` | Same scene as the hero; one use is enough |
| `cattle/cattle-silhouettes-sunrise-mist.webp` | Heavy orange grade, little information |
| `cattle/*-small*.webp` (492 px) | Too small for any meaningful use |
| `company/europe-map-sepia-locations.webp` | Imported once, now unused (see above); locations are presented as structured data |
| `brand/certification-marks/*.png` | 220 px greyscale; GQ/PCA/EKO marks unclear or expired. Certification is shown as typography + PDFs until the client supplies official artwork with permission |
| `brand/favicon.ico` | Replaced by horns SVG icon |
| `images/certificates/*-preview.webp` (except 2026 CP) | Not needed on the public site |
| `documents/page-text-archive/`, `documents/page-html-archive/` | Internal research material |

## Images that should be replaced by real photography (priority order)

1. Cutting plant Lisków: deboning line, packing (vacuum, cartons), cold store.
2. Slaughterhouse Linne and Wydrzyn/Wieniawa: exterior, lairage, hygiene areas.
3. Packed product per group (quarters on hooks, vacuum cuts, trimmings in containers, offal).
4. People: quality team, sales team (Oelde), production staff (with consent).
5. Fleet / loading dock (confirm whether the truck livery image is real).
6. Biogas plant in Linne and photovoltaic installation.

Until then the layout relies on typography, data tables and the few stronger existing images.
