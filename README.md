# McKeen Beef website

Corporate website of the McKeen Beef group. Next.js 16 (App Router), React 19, TypeScript, plain CSS. Polish is the source language; English and German are draft translations (`noindex` until approved).

- Current state, known issues, next steps: [`docs/STATUS.md`](docs/STATUS.md)
- History of tasks: [`CHANGELOG_AI.md`](CHANGELOG_AI.md)
- Mandatory workflow for AI sessions: [`AGENTS.md`](AGENTS.md)

## Requirements

- Node.js 24 (last verified with v24.16.0). `npm test` imports a TypeScript module directly and relies on Node's built-in type stripping.
- npm. The lockfile is committed; install with `npm ci`.

## Setup

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Polish pages have no prefix (`/produkty`), English and German use `/en/...` and `/de/...` (slug map in `src/i18n/routes.ts`).

No environment variables are needed for local development: the form endpoints use the `log` mail adapter (prints a redacted summary, sends nothing) and the site URL falls back to `http://localhost:3000`. To configure anything, copy `.env.example` to `.env.local`; real values are never committed (`.env*` is git-ignored).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (no server needed): form honeypot / fill-time checks; the signed no-JS form result (fails closed without a usable `RATE_LIMIT_SALT`; a regression check rejects the public development salt) and the language-switch context rules; drum motion (direct rail path, detent profile with glide, pull-in, swing and settle, momentum, lock, cancellation and reduced motion) |
| `npm run test:forms` | End-to-end tests of `/api/enquiries` and `/api/careers` against a **local** server; requires `FORMS_BASE_URL` (see the header of `tests/forms-api.test.mjs`). Never point it at production: it submits test data. |
| `npm run test:certs` | Certificate documents on `/certyfikaty`, `/en/certificates`, `/de/zertifikate` against a **local** server (`http://localhost:5000` by default, `NAV_BASE_URL` overrides it; no browser needed, read-only). Checks that every current and archived certificate keeps its scan preview and links its original PDFs; that each link's language and file match the certificate shown; and that all 61 PDFs are linked once and served unchanged. Also checks (UXA-03) that every "current certificate not published" sentence on Certyfikaty, Zakłady and Produkty in PL/EN/DE is followed by the quality contact link, and that this link opens the contact router's quality topic with every plant's quality department (server HTML, so also the no-JavaScript path). Also checks (UXA-05) that Certyfikaty ends, after the archive, with the quality contact and the quality system link, without another extra quality link. And (UXA-08) that the verification note says the official databases need a sign-in, links both official addresses as marked external links, and publishes no Site Code or COID. And (UXA-05 stage 2) that "Dokumenty certyfikatów" leads to the cutting plant's section on Certyfikaty only from Elementy, Mięsa drobne and the cutting plant's card on Zakłady, and that Jakość has the quality contact in its certificates section. And (UXA-05 stage 3) that Sprzedaż i eksport offers "Produkty" as the secondary button after the enquiry, once in the page content. And (UXA-05 stage 4) that on Zakłady only the named departments link to their contact topics (livestock purchasing on SH and SH II, transport on CP) and only the sales company's card links to Sprzedaż i eksport, with no offal/UPPZ link, and that those topics open with the departments' contacts. And (UXA-05 stage 5) that Biogazownia ends, after the EU disclosure, with one link to Środowisko on Jakość, keeps both EU logos and its links, and names no company (GAP-07). |
| `npm run test:nav` | Desktop/mobile navigation checks against `http://localhost:5000` by default. Requires an existing Playwright runtime and browser; does not install dependencies. See below. |
| `npm run test:home` | Home hero, intro and page flow checks (same runtime and variables as `test:nav`): section order, chain links, sales with markets and sites, contact and cooperation paths in PL/EN/DE; hero layout in PL/EN/DE from 390 to 1920 px, poster as LCP, video source, pause/resume, reduced motion, failed or blocked video, intro once per session, no JavaScript, layout shift, moved hero copy. |
| `npm run test:totop` | Back-to-top tag checks (same runtime and variables as `test:nav`): present once with a localised name on all 13 pages in PL/EN/DE, hidden at the top and reachable at the end, appears after 600 px, smooth and reduced-motion scroll to the top, keyboard focus and Enter, phone size and safe-area insets, no overlap with page controls or footer content at 390/1024/1440 px, form focus and the open mobile menu, no JavaScript (shown after scrolling, hidden once the footer is in view and on a form page), console errors. About 2.5 minutes on a production build, longer on the dev server. |
| `npm run test:notfound` | 404 checks against a **local production build** (same runtime and variables as `test:nav`; prefetching only runs in production). Covers unknown PL/EN/DE URLs, including old-site and nested shapes: HTTP 404, the address kept, the localised page, and no identical RSC request repeated more than 3 times within 3 s. Also covers existing PL/EN/DE pages (200, no repeats), and client-side clicks from an EN/DE 404 to home and a section with the session quiet afterwards (UXA-01). About 1 minute. |
| `npm run test:lang` | Language switch and form result page (same runtime and variables as `test:nav`), PL/EN/DE, desktop and phone. A result without a valid signature is neutral, including one forged with the public development salt. The suite adapts to the server (SECURITY-001), so run it both ways: with a usable `RATE_LIMIT_SALT` a signed success or error stays the same through PL → EN → DE → PL, a refresh and without JavaScript; without one nothing is signed and both stay neutral. Nothing is re-sent. The contact topic travels with and without JavaScript and survives a refresh. Anchors and the offer product travel; plain pages, foreign parameters and unsafe values do not. The only form posts are two no-JS submissions the server stops before delivery (honeypot, expired stamp). |
| `npm run test:focus` | Keyboard focus ring (A11Y-001; same runtime and variables as `test:nav`). Real Tab presses reach sample elements on light and dark surfaces (header, hero video, production chain, sales panel, footer, back-to-top tag, the dark sales card, the dark products section, certificate links, the mobile menu, the certificate viewer) at 1440 and 390 px; the ring is measured from the rendered pixels: every side drawn and not covered, at least 3:1 against the colours next to it, and a two-colour ring where the background can be light or dark. Also Escape returns the focus to the menu toggle and the preview link. About 25 seconds. |
| `npm run test:archive` | Certificate archive (UXA-07; same runtime and variables as `test:nav`), PL/EN/DE at 320/375/390/768/1024/1440 px with every group open. On phones every certificate is one entry: year and standard, result and validity with the archive badge, then the labelled preview and original-PDF rows with buttons of at least 44 × 44 px, all in view without sideways scrolling. From 768 px the table is unchanged. Everywhere: no horizontal page scroll and no PDF linked twice. At 390 px also: the table semantics in the accessibility tree, Tab order and focus ring, and the layout without JavaScript. About 1 minute. |
| `npm run assets` | Imports approved images and documents from `../source-assets` (see below) |

For navigation checks, run `npm run dev -- --port 5000`. The browser runner uses `playwright` if already available, or the absolute module path in `PLAYWRIGHT_MODULE` (for example, the Codex bundled runtime). Set `NAV_BROWSER_CHANNEL=msedge` or `chrome` to use an installed browser; otherwise it uses Playwright's Chromium. `NAV_BASE_URL` overrides the local URL; remote hosts are rejected. Optional `NAV_SCREENSHOTS` saves review screenshots outside the source tree. The suite checks that all nine desktop tabs are visible links that fit untruncated at 1216/1280/1440/1920 px in PL/EN/DE, direct clicks on any tab (straight travel, a small detent swing, lift and lean while moving, the lock click), direct visits, locale switching, Contact/Home wrap, lock timing/cancellation, roving keyboard focus and history, drag and sideways wheel, reduced motion, the unchanged eight-link mobile menu, the offer dialog and desktop navigation without JavaScript.

## Assets

Everything the browser loads is committed under `public/` (`photos/`, `assets/`, `documents/`, `og/`, `video/`). The home hero files in `public/video/` were encoded by hand with ffmpeg from a supplied clip that is not in the repository; the exact commands are in [`docs/asset-map.md`](docs/asset-map.md), "Home hero video". The rest was produced by `scripts/import-source-assets.mjs` from a source library at `../source-assets`, which is **not part of this repository** and not present next to this checkout. Without it `npm run assets` stops with `source-assets not found`; with it, the script deletes and rewrites `public/photos`, `public/assets` and `public/documents`. `scripts/build-privacy-drafts.mjs` and `scripts/import-certificate-scans.mjs` use the same library. Details: [`docs/asset-map.md`](docs/asset-map.md).

## Environment variables

All variables are listed with comments in [`.env.example`](.env.example): public origin, form delivery (SMTP or Resend), recipients, rate limiting (Upstash), the IP-hash salt that also keys the signed form result, and optional Cloudflare Turnstile. What each one protects is described in [`docs/security.md`](docs/security.md).

## Deployment

No hosting configuration and no CI pipeline are included in this repository. Before a production deployment, work through the checklist in [`docs/security.md`](docs/security.md) §10 (HTTPS, `NEXT_PUBLIC_SITE_URL`, mail provider and recipients, Upstash for serverless or multi-instance hosting, `RATE_LIMIT_SALT`, trusted client-IP header) and the P1 items in [`docs/client-confirmations.md`](docs/client-confirmations.md). Pages are rendered dynamically because the Content Security Policy uses a per-request nonce ([`docs/architecture.md`](docs/architecture.md) §2).

## Documentation

| File | Content |
|---|---|
| [`docs/STATUS.md`](docs/STATUS.md) | Current state |
| [`CHANGELOG_AI.md`](CHANGELOG_AI.md) | Task history |
| [`docs/architecture.md`](docs/architecture.md) | Routing, rendering, structure, data model, i18n, forms, SEO |
| [`docs/security.md`](docs/security.md) | Threat model, controls, headers, CSP, deployment checklist |
| [`docs/client-confirmations.md`](docs/client-confirmations.md) | Open questions for the client |
| [`docs/content-source-map.md`](docs/content-source-map.md) | Source of every fact on the site |
| [`docs/asset-map.md`](docs/asset-map.md) | Source and use of every image and document |
| [`docs/gap-audit-2026-10-10.md`](docs/gap-audit-2026-10-10.md) | Rebuild gap audit of 2026-10-10: findings GAP-01 … GAP-27 with evidence (live status in `docs/STATUS.md`) |
