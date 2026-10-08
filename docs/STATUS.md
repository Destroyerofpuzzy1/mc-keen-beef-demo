# Build status (handoff)

**`npm run build` passes** (2026-10-05). All pages exist in PL, EN and DE. A production crawl of 103 internal URLs found no broken link. Unknown URLs return a real 404, and legacy URLs redirect with 308.

## Pages
Home, Produkty (editorial catalogue), Jakość, Certyfikaty, Zakłady, O firmie, Sprzedaż i eksport, Kariera (job card + CV form), Kontakt (topic router + filtered directory), Zapytaj o ofertę, Biogazownia, Strategia podatkowa, Polityka prywatności, form result page (`wyslano`), localised 404, global 404, `sitemap.xml`, `robots.txt`.

## Key mechanisms
- **Offer modal:** any link with `data-enquiry="<product id>"` opens `EnquiryDialog` (rendered once in the layout) with the product pre-selected. The href is the no-JS fallback to `/zapytaj-o-oferte?produkt=…`.
- **Language-stable layout:** two-tier header (utility bar scrolls away, main bar sticky) with eight equal nav columns sized for German (sales/export shown as the short label "Eksport") and a fixed-width CTA. On desktop, space is reserved for the hero title (4 lines), page titles (2 lines) and leads (3 lines). The EN/DE draft notice moved from the header to the footer.
- **Images:** one system. `scripts/import-source-assets.mjs` writes every photo to `public/photos/<category>/` with explicit, curve-free crop boxes. Sizes go to `src/content/generated/assets.json`. Pages ask `src/content/media.ts` for what a picture shows (`media.carcassInspection`), never for a file path. `src/proxy.ts` skips `/photos/` and any URL with a file extension. (Not skipping `/photos/` was the cause of the images that failed to load.)
- **Image map:** hero = herd at sunrise (1680×1015); Kontrola and quality = carcass inspection (1080×860, 5:4); certificates = 2026 scans and certificate cards (banner removed); Mroźnia i chłodnia = refrigerated trailer crop (no cold-store photo exists); logistics = truck on road; export = markets/sites ledger (no map); products = illustrative photos + brand line art for ćwierci + legacy category icons (CSS masks); origin = feeding, Hereford pasture, Hereford bull.
- **Motion:** `components/ui/Reveal.tsx` (one-shot IntersectionObserver, active only with JS, off under reduced motion). `app/[locale]/template.tsx` gives a 260 ms page-enter fade. Photos get a clip and a 1.03→1 settle; buttons get an arrow nudge; the nav has an underline.

## Waiting for
- **Photography:** all imagery comes from `../source-assets` (the only source library; `mc-beef/photos` does not exist). When the client delivers real photography: add it under `source-assets/images/<category>/`, add the files to the allow-list in `scripts/import-source-assets.mjs`, run `npm run assets`, then swap the entries in `src/content/media.ts` (`productMedia` first: ćwierci has no photo by design until an authentic one exists).
- Client confirmations: see `client-confirmations.md` (checklist at the end).
- Production configuration: see `.env.example` and `security.md` §10.

## Audit fix pass (2026-10-06, branch `feature/mckeen-audit-fixes`)
Certificate grids without 1024 px overflow; contact router opens the answer under the chosen topic on phones; per-instance form ids; recoverable `expired` / `tooFast` form outcomes instead of a silent fake success; visible status for every non-success outcome; lint clean; product imagery (no restaurant photos, ćwierci as line art); IFS/BRCGS banner removed; map replaced by a markets/sites ledger; "Eksport" in the main navigation; hamburger flush right; mobile folds for registration data, the footer group block and the directory; claims reduced to source wording (biogas project, documentation, SH II, recruitment language); JobPosting withheld without a real publication date; EN/DE privacy drafts prepared but unpublished.
