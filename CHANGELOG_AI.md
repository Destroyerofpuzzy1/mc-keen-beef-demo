# AI work log

History of tasks done in this repository, newest first. The current state is in [`docs/STATUS.md`](docs/STATUS.md); the mandatory workflow is in [`AGENTS.md`](AGENTS.md).

Rules:

- One entry per finished task, added at the top, in the same change as the work itself.
- Record what actually happened. A test counts as passed only if it was run in that session; otherwise write "not run" and why.
- Anything that cannot be verified is labelled "reconstructed, unverified".

Template:

```
## YYYY-MM-DD: <short title>
- Task (as requested by the user):
- Goal:
- Branch / commit:
- Done:
- Files changed:
- Tests and results:
- Security notes:
- Open issues / next steps:
```

---

## 2026-10-12: Commit and push of the completed work

- **Task (as requested by the user):** commit and push the finished, tested changes of the project. Steps and limits:
  - check Git first;
  - work only on `codex/3d-drum-navbar`: no reset, stash, force push or automatic merge;
  - include every approved, finished UX, IA, GAP, security, design and accessibility change, not only A11Y-001;
  - keep the docs current;
  - commit no temporary files, test screenshots, scratch files, secrets, `.env`, local logs or unrelated files, and stop and ask about anything unclear;
  - reuse the reports and confirm the code did not change since the last passing tests;
  - run the final checks and a security review;
  - do not skip hooks;
  - push only the feature branch: no merge into `main`, no deployment, no Vercel or DNS change;
  - report, then stop.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin` before the commit; the branch did not exist on `origin` yet. One commit on top of `b2fdc66` (the commit that contains this entry; its hash is in `git log`), pushed with `git push -u origin codex/3d-drum-navbar`.
- **Done:**
  - **Scope review:** 96 files, 55 tracked changes (including the removed `src/components/navigation/NavLinks.tsx`) and 41 new. Each is tied to a documented task in this log or in `docs/asset-map.md` (the hero videos, the craft icons). No unclear or unrelated change was found. No build output, logs, screenshots or scratch files are included; the scratch work stayed outside the repository. Ignored and not committed: `.next`, `node_modules`, `next-env.d.ts`, `tsconfig.tsbuildinfo`; no `.env` file exists in the checkout.
  - **Security review:**
    - no private or cloud keys, tokens, passwords, credential URLs, long hex strings or local paths in the committed text;
    - `.env.example` has placeholders only (its diff is a comment);
    - the one fixed secret is the unit-test fixture in `tests/form-result.test.mjs`, used nowhere else;
    - `package.json` adds test scripts only, with no dependency change; `package-lock.json` is unchanged.
  - **Quality:** after the final A11Y-001 build and browser suites only documentation changed. Lint, TypeScript, unit tests and build were re-run.
  - **Docs:** `docs/STATUS.md` now says the work is committed and pushed (not merged, not deployed), with a "Pre-commit review" verification row.
- **Files changed:** `docs/STATUS.md`, this log (plus the commit of all earlier work).
- **Tests and results:**
  - Re-run before the commit: `npm run lint` passed, `npx tsc --noEmit` passed, `npm test` 26/26, `npm run build` passed (47/47 pages), `git diff --check` clean.
  - On that fresh build (temporary local server, stopped afterwards): `test:certs` 28/28, `test:focus` 9/9, `test:notfound` 4/4.
  - From A11Y-001 on the same code (local production build): `test:nav` 16/16, `test:home` 7/7, `test:totop` 8/8, `test:lang` 6/6, `test:archive` 5/5.
  - Not re-run: `test:forms` (needs the local mail setup; the form code is unchanged since it passed after SECURITY-001).
- **Security notes:** see the security review above; no CSP, header, environment or deployment change in this step.
- **Open issues / next steps:** a pull request into `main` only on the user's request; no merge or deployment yet. Known issues and open items stay as listed in `docs/STATUS.md`.

## 2026-10-12: A11Y-001 — Focus ring visible on every surface

- **Task (as requested by the user):** the user approved UXA-19 as done (markers unchanged) and asked for A11Y-001.
  - Goal: fix the keyboard focus indicator, especially on dark surfaces (earlier audit: blue ring 2.94–2.96:1 on maroon), for WCAG 2.2 AA, without a redesign and keeping Premium Crafted Ranch.
  - Diagnosis first: every focus style (desktop and mobile navigation, main CTAs, the dark process section, the sales card, Sprzedaż i eksport, the footer, certificate and PDF links, forms and dialogs, back to top). Tell non-text contrast apart from focus visibility; measure the real indicator, not the declared colour; do not assume one global colour fixes every background.
  - Fix: the smallest effective change, e.g. a dark-surface variant or a two-colour ring. Visible, not clipped by overflow, not under the sticky header, not looking like a pressed button, no layout shift, keyboard only, normal look of buttons and links unchanged, outline never removed, never a text colour change alone.
  - Verification: local production build, PL/EN/DE at 390, 768 and 1440 px, long German labels; measured contrast on light and dark backgrounds; real Tab and Shift+Tab in the header, links, CTAs, forms, the certificate archive, the footer and back to top; open dialogs and reduced motion; before/after screenshots; lint, TypeScript, tests, build, `git diff --check`; a small regression test if reliable.
  - Limits: no change to content, data, UXA-05 links, UXA-19 markers, forms and their logic, photos, videos, certificates, the normal CTA look or the section layout; no large CSS refactor. Docs: STATUS, CHANGELOG, design system. Done only after measuring in the browser. No commit, push, merge or deployment; report, then stop.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Diagnosis (local production build, Edge):**
  - **Focus styles:**
    - global `:focus-visible` outline 3 px `--focus` `#0a58ca`, offset 2 px (`base.css`);
    - drum tabs inset (−4 px);
    - certificate viewer 2 px cream;
    - hero video toggle 2 px white;
    - form fields add a blue border.
  - **Tab walk:** real Tab presses through all 14 routes × PL/EN/DE × 390/768/1440 px (126 pages, 5,738 stops). The ring was measured from the pixels of a screenshot at every stop, per side: ring colour, the pixel outside it, the gap inside it.
  - **Before, 2,712 stops (47 %) passed. Cause:** `#0a58ca` has a lightness close to the site's dark cloth. Measured:
    - 2.94–2.96:1 on the footer (every page), the production chain, the sales panel, the dark cards and section;
    - 1.9–3.0:1 in the mobile menu;
    - 1.0–1.7:1 over the hero video (a mid-tone picture: neither a dark nor a light ring alone can be safe there);
    - 2.5–2.9:1 on the back-to-top tag over the footer.
  - **Also found:**
    - the carriage covered one side of the header arrow's ring;
    - the raised current-language pill and the Kontakt department tags covered part of a ring;
    - on EN/DE Jakość at 390 px the back-to-top tag hid itself while focused (its collision check), so the focus sat on an invisible control and was then lost (WCAG 2.4.7, already there before);
    - rings were cut at the edge of the scrolling dialogs;
    - the skip link opens over the red wordmark at 768 px, and the blue ring and the beef red have the same lightness (1:1).
  - Nothing was covered by the sticky header, clipped by an overflow ancestor or missing `:focus-visible`.
- **Done (CSS only):**
  - `tokens.css`: `--focus-on-dark: #9cc3ff` (9.5–10.6:1 on maroon and dark brown, 10.6:1 against maroon).
  - `base.css`:
    - `--focus` set to it on `.hero`, `.chain`, `.section--dark`, `.logistics__panel`, `.origin__panel`, `.sales-card--dark`, `.site-foot` and `.mmenu__panel`;
    - `.hero :focus-visible` gets a 2 px maroon halo in the gap (a two-colour indicator, WCAG technique C40);
    - `.skip-link:focus-visible` gets a cream halo.
  - `BackToTop.module.css`: a focused tag stays shown (opacity, visibility, transform) and gets a cream halo; its cast shadow stays.
  - `DrumNav.module.css`: `.arrow:focus-visible { z-index: 3 }`.
  - `components.css`:
    - `.clink:focus-visible` and `.lang__item:focus-visible` paint above their neighbour;
    - `.dlg { scroll-padding-block: var(--s-3) }`.
  - Unchanged: the light-surface ring, the normal look of every button and link, layout, content.
- **Verification (final build):**
  - **Same walk:** 5,680 stops (99 %) pass. One colour: 3:1 against both neighbours. Two colours: 3:1 between ring and halo, and one of them 3:1 against the background.
    - Dark surfaces 10.2–10.6:1 (median 10.5).
    - Light surfaces unchanged (median 5.5:1).
    - Hero ring and halo 10.6:1 apart; the stronger colour ≥ 3.6:1 against the video, also while it plays.
    - Back-to-top tag and skip link ≥ 4.1:1.
    - Left over (58): the current drum tab (42; its left and right sides lie under the carriage by design, top and bottom visible); the Produkty jump tags (15; the sample falls beside their rounded end, the ring is complete in the screenshot); one Zakłady product link touching the tan "Produkte:" label on one side.
  - **Shift+Tab** (968 stops) and **normal motion** (388 stops; the video toggle passes) give the same result.
  - **Dialogs** (menu, enquiry, certificate viewer, careers): focus stays inside and Escape returns it to the trigger with a ring. The menu went from 15 of 17 stops failing to 0. One case stays: a field already partly visible in the enquiry dialog on phones is not scrolled by Chrome (Known issues 12).
  - **Layout:** 962 stops compared focused and blurred; only the skip link (by design) and the focused tag (positioned) change, and nothing else moves.
  - **Screenshots:** before/after close-ups reviewed at 1440, 768 and 390 px, including German labels.
- **Files changed:** `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/components.css`, `src/components/navigation/DrumNav.module.css`, `src/components/ui/BackToTop.module.css`, `tests/focus-ring-browser.mjs` (new), `package.json` (`test:focus`), `README.md`, `docs/architecture.md` (design system: focus ring rule), `docs/STATUS.md`, this log.
- **Tests and results:**
  - lint, TypeScript and build: passed. `npm test` 26/26.
  - Local production build: `test:certs` 28/28, `test:focus` 9/9 (new), `test:nav` 16/16, `test:home` 7/7, `test:totop` 8/8, `test:lang` 6/6, `test:archive` 5/5.
  - `test:focus` failed on the build before the fix (2.94:1). On the final build it caught each of five injected faults (old ring on dark surfaces, no hero halo, no tag halo, no arrow `z-index`, old ring in the menu).
  - `git diff --check` clean.
  - Not run: Firefox, Safari, Windows high contrast and real screen readers.
- **Security notes:** none; no script, header or CSP change (inline styles were only injected by the local test tools).
- **Open issues / next steps:** Known issues 12 (current drum tab under the carriage, partly visible dialog field on phones, ring next to red). Approved UXA-05 P3 items stay open on the user's go-ahead.

## 2026-10-12: UXA-19 — List markers that match their meaning

- **Task (as requested by the user):** the user closed UXA-05 in the P2 scope (no further links under UXA-05) and asked to fix UXA-19, keeping the Premium Crafted Ranch / embroidery identity, with understandability first.
  - Find every use of `.ticks li::before` and classify each list as positive, neutral or negative. No blind change of the global style; semantic variants, smallest change.
  - Markers: a subtle embroidered check for positive lists, a simple stitch, dot or dash for neutral ones, a negative sign only for a real limitation. Minimal, existing palette, in the style of the embroidered icons, never louder than the text, readable on light and dark.
  - A list whose meaning cannot be established goes to the user instead of a guess. No change to texts, company data, navigation, CTAs, certificates, forms, photos, videos or other design; no large CSS refactor.
  - Before/after screenshots (Zakłady SH, SH II, CP; Sprzedaż i eksport logistics; Jakość; privacy policy) in PL/EN/DE at 1440 and 390 px. Checks: meaning, text layout, column width, contrast, screen readers, overflow, unchanged content. Lint, TypeScript, tests, build, `git diff --check`; Done only after the browser check; report, then stop.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Classification (every `.ticks` list in the code; none is negative, so no cross remains):**
  - **positive, a plant's or the company's own capabilities → stitched check:**
    - Zakłady details: SH (own livestock purchasing department; offal and animal by-products sales), SH II (own livestock purchasing department), CP (freezer store integrated with the cutting plant since 2012; transport department);
    - Sprzedaż i eksport logistics (chilled and frozen products; freezer store and independent cold store; own transport department);
  - **neutral → running stitch:**
    - Jakość "Źródła i dobrostan": three statements of principle, where a check would read as a confirmed audit result;
    - privacy policy "Formularze i cookies": a legal description that contains negations ("nie zapisuje", "nie używa").
- **Done:**
  - `craft.css`: the cross-stitch "X" is replaced by a red running stitch (two short stitches, like the stitch under section titles) as the default. `.ticks--check` draws a stitched check from two borders of a rotated box. Both have light-thread variants for dark surfaces. Colours as before (#b3000c; #ff5a52 on dark).
  - `ticks--check` is set on the Zakłady details list and the Sprzedaż i eksport logistics list. Jakość and the privacy policy keep their markup and get the neutral stitch.
  - No text, link or other style changed.
- **Verification (local production build, Edge):**
  - **Screenshots:** before/after for PL at 1440 px and PL/EN/DE at 390 px, taken from the old and the new build. EN/DE at 1440 px "before" was reconstructed by injecting the old rule into the new build; the same method gave byte-identical images for all six PL 1440 targets.
  - **Layout:** the list items (15 per language and width) keep their text, position and size in all 24 variants (4 pages × PL/EN/DE × 1440/390 px). No horizontal overflow.
  - **Markers:** inside the item's left padding, at least 4 px from the text, so columns do not change. The stitch sits on the centre of the first line, the check 2.2 px above it.
  - **Contrast** of the marker colour against the rendered background: check ≥ 6.14:1, stitch ≥ 5.58:1 (privacy page). The dark check variant (no page uses it yet; tested by adding the class in the DOM): 6.20:1.
  - **Screen readers:** the markers are empty pseudo-elements. ARIA snapshots of every list hold only the item texts and links, with matching item counts.
  - **Content:** headings and links of all 42 pages match the earlier snapshot; the only differences are the three Biogazownia links of UXA-05 stage 5, which was taken after it. The PL section texts of 9 pages are identical.
- **Files changed:** `src/styles/craft.css`, `src/app/[locale]/zaklady/page.tsx`, `src/app/[locale]/sprzedaz-eksport/page.tsx`, `docs/architecture.md` (identity system: the list-marker rule), `docs/STATUS.md`, this log.
- **Tests and results:** `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 26/26; `npm run build` passed; `npm run test:certs` 28/28 on the local production build; `git diff --check` clean. No new automated test: the change is visual (CSS and two class names).
- **Security notes:** none (no script, header or CSP change).
- **Open issues / next steps:** the approved UXA-05 P3 items (O firmie → Produkty, Kariera → plant location, Certyfikaty → plant data) stay open, each only on the user's go-ahead.

## 2026-10-12: UXA-05 final navigation review (read-only)

- **Task (as requested by the user):** the user approved stage 5 and, before the next task, asked for a short final review of all UXA-05 changes. Audit only, with no code, content, asset or configuration change.
  - **Scope:** the nine transitions of stages 1–5, together with UXA-03, UXA-07 and UXA-08.
  - **Questions:** context, repeated CTAs, label clarity, real targets, anchors under the sticky header, Kontakt topic parameters across languages, loops, the number of red links, mobile readability, PL/EN/DE consistency.
  - **Scenarios:** buyer, farmer, auditor, foreign buyer and biogas reader, as real browser interactions.
  - **Report:** which paths work, repetitions, links needing change, which approved P3 items are still justified, whether UXA-05 can close in the P2 scope. Say so plainly if nothing significant is found.
  - **Finish:** no commit, push, merge or deployment; then stop. UXA-19 is the next, separate task.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit. The build matched the sources (stage 5 state).
- **Done (local production server, Edge, 1440 and 390 px):**
  - **Re-run:** `test:certs` 28/28 (every UXA-05 stage, UXA-03, UXA-08, the 61 PDFs), `test:archive` 5/5 (UXA-07), `test:lang` 6/6 (the contact topic travels through PL/EN/DE, with and without JavaScript, and survives a refresh).
  - **Five scenarios by real clicks, all passed at both widths:**
    - buyer: home → Produkty → Elementy "Dokumenty certyfikatów" → the cutting plant's heading on Certyfikaty, 16 px under the header → a PDF served as `application/pdf` → "Zapytaj dział jakości" → quality topic in view;
    - farmer: Zakłady → SH "Sprzedaję bydło" → topic with Renata Zduniak and Małgorzata Będziechowska → the EN language link keeps the topic;
    - auditor: Jakość → "Wszystkie certyfikaty i archiwum" → the preview viewer opens and closes; Jakość "Zapytaj dział jakości" → quality topic;
    - foreign buyer: /en/sales-export "Products" → /en/products → "Request a quote: Beef cuts" → enquiry with the product ticked (closed, not sent);
    - biogas reader: Biogazownia "Środowisko" → Jakość section under the header.
  - **Link metrics on phones:**
    - no page links to itself; no target under 44 px; nothing off-screen; no overflow;
    - red arrow links: Zakłady 7 (5 cards, at most 2 per card), Produkty 4 (one per card), Certyfikaty 4, Jakość 1, Biogazownia 1;
    - no runtime errors, no POST.
- **Findings:**
  - No significant problem, and no link needs a change.
  - **Repeated targets, all intended and separated:**
    - Certyfikaty has "Zapytaj dział jakości" three times: two plant-level (UXA-03) and one page-level after the archive.
    - Produkty and Zakłady repeat a target once per card.
    - Zakłady links Sprzedaż i eksport from the SO GmbH card and from the earlier "Mroźnia i chłodnia" button, in two different contexts.
  - **Reciprocal pairs** (Certyfikaty ↔ Jakość, Jakość ↔ Biogazownia) give a way back but are not traps; every page has other exits.
  - **Red density:** the red cross-stitch list markers (UXA-19) add red next to the new red links on the Zakłady cards. UXA-19 is the place to address it.
  - **Known issue:** the focus ring of the dark-card button on Sprzedaż i eksport has the A11Y-001 contrast issue (Known issues 12), not specific to UXA-05.
- **Approved P3 items, still justified but optional:**
  - O firmie → Produkty (buyers reading about the company);
  - Certyfikaty → plant data (auditors need registration and veterinary numbers);
  - Kariera → plant location: the job's workplace address matches the cutting plant's address on Zakłady, so the link would mainly add the map. Lowest value.
- **Recommendation:** close UXA-05 in the P2 scope; the user decides.
- **Files changed:** `docs/STATUS.md` (verification row, UXA-05 tracker and "In progress", next steps), this log. No code, content, asset or configuration change.
- **Tests and results:** see above. Lint, TypeScript and build were not re-run: no code changed (last passed in stage 5 the same day).
- **Security notes:** none.
- **Open issues / next steps:** UXA-19 (red "X" list markers) as the next separate task, on the user's go-ahead.

## 2026-10-12: UXA-05 stage 5 — Biogazownia → Środowisko (and backlog entry UXA-19)

- **Task (as requested by the user):** the user approved stage 4 and asked for stage 5 only, without returning to stages 1–4. From the biogas project page, a logical way back to the "Środowisko" section of Jakość, so the page is no dead end.
  - **Check first:** the page in PL/EN/DE, the anchor on Jakość, and whether the breadcrumbs already provide the way.
  - **The link:** one small contextual link after the project content, with the existing label "Środowisko" / "Environment" / "Umwelt" and the usual link style. No card, panel or section.
  - **Keep:** every project fact, technical figures, power and costs, the funding information, the EU logos and mandatory markings, the documentation and links, and the location and reporting data. No company attribution (GAP-07 resolved, C-64 open); no new environmental or energy claims.
  - **Tests:** PL/EN/DE at 390 and 1440 px: click, placement under the sticky header, direct entry, reload, keyboard and focus, overflow, no loss of project information, EU markings unchanged. Before/after screenshots; tests, lint, TypeScript, build, `git diff --check`.
  - **Backlog:** record, as a separate UX proposal, the red "X" icons next to positive facts about the plants. Do not fix it now.
  - **Finish:** docs. No commit, push, merge or deployment; stop.
- **Goal:** a reader of the EU project page can return to the group's wider environmental information.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Checked:**
  - **The page:** Biogazownia is a `lang="pl"` disclosure block (EU logos, programme, project, costs, product and result indicators, irregularities notice with the portal and e-mail). Its breadcrumb is "Strona główna › Biogazownia…" only, so no way back to Jakość existed.
  - **The anchor:** Jakość has `section#srodowisko`, titled by `quality.envTitle`.
- **Done:**
  - **`app/[locale]/biogazownia/page.tsx`:** after the indicators grid, in the same last section, `<div class="container" lang={locale}>` with a `.link-row` and one arrow link to `href(locale, 'quality', 'srodowisko')`.
  - **Label:** `d.quality.envTitle` ("Środowisko" / "Environment" / "Umwelt"). The `lang` of the page language because the surrounding disclosure is Polish.
  - No new text or style; the EU content is unchanged.
- **Tests (extended):** `tests/certificates-contact.test.mjs`, one new test per locale:
  - exactly one link to Jakość `#srodowisko` with the section title, after the irregularities notice, with the page's `lang`;
  - `id="srodowisko"` on Jakość;
  - both EU logos, and the irregularities portal and e-mail links still present;
  - no "MCKEEN-BEEF" in the page content (GAP-07).
- **Files changed:** `src/app/[locale]/biogazownia/page.tsx`, `tests/certificates-contact.test.mjs`, `README.md` (`test:certs`), `docs/STATUS.md` (including the new tracker row UXA-19), this log.
- **Tests and results (2026-10-12, Node v24.16.0, local production build, bundled Playwright + Edge):**
  - `npm run lint`, `npx tsc --noEmit` and `npm run build` passed; `npm test` 26/26.
  - **`test:certs` 28/28:** 3 new tests; all earlier tests and all 61 PDFs pass.
  - **Browser checks, PL/EN/DE at 390 and 1440 px:**
    - no sideways scroll; the link is visible, 44 px high and in the page language;
    - Tab goes from the irregularities e-mail to the link, with a focus ring;
    - a click, a direct entry of `/jakosc#srodowisko` (EN/DE equivalents) and a reload put the section right under the sticky header (heading at 164 / 232 px, header ends at 76 / 104 px);
    - no runtime errors.
  - **Content kept (texts captured before and after, all three languages):**
    - the EU block's text is identical apart from the trailing link (the programme name "… Infrastruktura i Środowisko" unchanged);
    - the EU logos (src and alt) are identical and no link was removed;
    - the whole page text is identical apart from the link.
  - **Screenshots:** before/after of the page end (1440 px PL; 390 px PL, and DE after) given to the user.
  - **Not run:** the other browser suites; only this page changed.
- **Backlog (recorded, not fixed): UXA-19 · P2.** The `.ticks` list markers are red cross-stitch "X" shapes (`craft.css`, `.ticks li::before`) next to positive facts:
  - the Zakłady card activities, e.g. "Własny dział skupu żywca", "Dział transportu";
  - the Sprzedaż i eksport logistics list;
  - the lists on Jakość and in the privacy policy.

  An "X" commonly reads as "no / not available". The proposal is a neutral or affirmative stitched marker in the same thread style, decided with the DESIGN-001/002 identity (STATUS UX audit tracker).
- **Security notes:** none.
- **Open issues / next steps:**
  - all 8 approved UXA-05 P2 transitions are in place;
  - approved P3 items still open (O firmie → Produkty, Kariera → plant location, Certyfikaty → plant data) and UXA-19, each only on the user's go-ahead.

## 2026-10-12: UXA-05 stage 4 — Zakłady: departments and the sales company linked

- **Task (as requested by the user):** the user approved stage 3 and asked for stage 4 only, on Zakłady.
  - **Livestock purchasing:** next to "Własny dział skupu żywca" (on the plants that really have it), a transition to the router topic "Sprzedaję bydło". Do not change the activity or assign a person without data; let the visitor find the department.
  - **Transport:** "Dział transportu" leads to the "Transport" topic, if the router's contacts really match that department. If they do not, report it and do not guess; no new contact data.
  - **Sales company:** the MCKEEN-BEEF SO GmbH card gets a natural transition to "Sprzedaż i eksport", if the card has none. No duplicates; company data, address, registration numbers and contacts unchanged.
  - **UX:** next to the related information, clear target, existing PL/EN/DE labels, desktop and phone, keyboard, the existing parameters and anchors, context kept on language switch. Existing link components; no sections, ornaments, icons or cards; not every line a link.
  - **Keep:** all content, GAP-06, GAP-07, UXA-03 and the stage 2 documents link; UXA-04 (offal and UPPZ) untouched.
  - **Tests:** the 12 listed checks; before/after screenshots; the existing regression test extended; lint, TypeScript, tests, build, `git diff --check`.
  - **Finish:** docs. Done only after a real browser check. No commit, push, merge or deployment; stop before stage 5.
- **Goal:** a visitor reading about a plant reaches the right department from there instead of starting the search again.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Data checked (`plants.ts`, `contacts.ts`):**
  - **Livestock purchasing:** "Własny dział skupu żywca" is in the profiles of SH and SH II only. The router's `sell-cattle` topic holds exactly Renata Zduniak (SH, head of livestock purchasing) and Małgorzata Będziechowska (SH II, livestock purchasing).
  - **Transport:** "Dział transportu" is in the CP profile only. The `transport` topic holds exactly Małgorzata Kaczmarek (CP, transport department), the same person Sprzedaż i eksport names under logistics.
  - **Result:** no mismatch, so nothing to report.
  - **SO GmbH:** the card had no link to Sprzedaż i eksport. The page's only one is the button in the separate "Mroźnia i chłodnia" section.
- **Done:**
  - **`content/plants.ts`:**
    - `EntityProfile.details` items are now `{ text, topic? }`: `topic: 'sell-cattle'` on the SH and SH II livestock purchasing line, `topic: 'transport'` on the CP transport line;
    - no topic on "Sprzedaż podrobów i UPPZ" (comment: UXA-04, C-25);
    - optional `page` (`'sales'` for SO GmbH);
    - every text unchanged.
  - **`app/[locale]/zaklady/page.tsx`:**
    - a detail with a topic gets a line break and an arrow link to `${contact}?temat=<topic>#pomoc`, labelled `contact.routes[topic]` ("Sprzedaję bydło" / "I want to sell cattle" / "Ich möchte Rinder verkaufen"; "Transport"), inside the same list item;
    - a profile with a `page` gets an arrow link labelled `nav[page]` ("Sprzedaż i eksport") in a `facility__meta` row under the activity;
    - the same text-then-link pattern as UXA-03.
- **Tests (extended):** `tests/certificates-contact.test.mjs`, one new test per locale:
  - link counts per card: SH 1 and SH II 1 livestock purchasing; CP 1 transport; SO GmbH 1 sales page; Centrala none;
  - the topic links sit in the list item that names the department and carry the router's label;
  - no `temat=offal-uppz` on Zakłady;
  - `?temat=sell-cattle` opens only that topic, with Linne, Wydrzyn and both phones; `?temat=transport` opens with +48 62 76 35 519.
- **Files changed:** `src/content/plants.ts`, `src/app/[locale]/zaklady/page.tsx`, `tests/certificates-contact.test.mjs`, `README.md` (`test:certs`), `docs/STATUS.md`, this log.
- **Tests and results (2026-10-12, Node v24.16.0, local production build, bundled Playwright + Edge):**
  - `npm run lint`, `npx tsc --noEmit` and `npm run build` passed; `npm test` 26/26.
  - **`test:certs` 25/25:** 3 new tests, plus all earlier UXA-05 stage, UXA-03 and UXA-08 tests, and all 61 PDFs.
  - **Browser checks, PL/EN/DE at 390 and 1440 px:**
    - no sideways scroll; the 4 links visible and 44 px high, and Tab reaches them with a focus ring;
    - SH II "Sprzedaję bydło" and CP "Transport" open Kontakt with that topic expanded and the router in view; SO GmbH opens Sprzedaż i eksport;
    - a direct entry and a reload of the topic URL keep the topic;
    - the language links carry `?temat=sell-cattle`, and the next language opens with the topic expanded (PL→EN, EN→DE, DE→PL);
    - no runtime errors.
  - **Content kept:**
    - link inventory of all 42 pages: since stage 3 only these 4 links per locale; against the UXA-05 analysis nothing removed;
    - with the 5 links of stages 2 and 4 taken out in the browser, the 3 Zakłady sections are identical to the analysis capture.
  - **Screenshots:** before/after of the SH, CP and SO GmbH cards (390 px PL; after also DE) and after at 1440 px given to the user.
  - **Not run:** `test:archive`, `test:nav`, `test:home`, `test:totop`, `test:lang`, `test:notfound`. Only Zakłady cards changed. The language-switch behaviour for `?temat=` was checked in the browser above.
- **Security notes:** none.
- **Open issues / next steps:** stage 5 (Biogazownia) only after the user's go-ahead. Approved P3 items still open: O firmie → Produkty, Kariera → plant location, Certyfikaty → plant data.

## 2026-10-12: UXA-05 stage 3 — Sprzedaż i eksport → Produkty

- **Task (as requested by the user):** the user approved stage 2 and asked for stage 3 only. Products, plants, quality and certificates are not to be touched again.
  - **Goal:** a buyer on Sprzedaż i eksport moves on naturally: Sprzedaż i eksport → Produkty → Zapytaj o ofertę.
  - **Change:** check the page in PL/EN/DE, find the "Zapytaj o ofertę" button and its context, and add a small, logically placed link to Produkty with existing labels and components. The enquiry stays the main CTA; Produkty is secondary. No duplicate where an equally easy way exists; clear where it leads.
  - **Keep:** sales data, markets, plants list, logistics, phones and e-mails, photos, forms, export texts and other pages. No unconfirmed product, export, market or scale claims. No cards or "Co dalej" sections.
  - **Tests:** PL/EN/DE at 390/1440 px; the transition, the enquiry, focus order and visibility, no overflow, no duplicate CTAs, all content kept; before/after; project tests, lint, TypeScript, build, `git diff --check`.
  - **Finish:** docs. No commit, push, merge or deployment; stop before stage 4.
- **Goal:** the sales page leads to the assortment without competing with the enquiry.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Before:**
  - The page (markets with ledger, logistics with the transport contact, MCKEEN-BEEF SO GmbH with the sales team card) had no link to the products in its content.
  - The only CTA is the full-width "Zapytaj o ofertę" (`btn--primary btn--block`, opens the enquiry dialog) at the end of the sales card on the dark section.
- **Done:**
  - **`app/[locale]/sprzedaz-eksport/page.tsx`:** below that CTA, a `.link-row` with "Produkty". It uses `nav.products`, the label the home page also uses for its link to Produkty, and leads to `/produkty` (EN `/en/products`, DE `/de/produkte`).
  - **Style:** `btn btn--ghost-light btn--arrow`, the existing outlined button for dark surfaces that the home sales panel uses for its page link. Auto width (114 px against the CTA's 294/515 px), 44 px high.
  - **Hierarchy:** the enquiry stays the filled primary button; Produkty is the secondary step.
  - No new text, label or CSS.
- **Tests (extended):** `tests/certificates-contact.test.mjs` (now also the UXA-05 transitions; run by `test:certs`), one new test per locale:
  - in the sales section: the enquiry (primary) first, then the products link (ghost button, label as in the menu);
  - exactly one products link in `<main>`;
  - Produkty links to the enquiry with `?produkt=`.
- **Files changed:** `src/app/[locale]/sprzedaz-eksport/page.tsx`, `tests/certificates-contact.test.mjs`, `README.md` (`test:certs`), `docs/STATUS.md`, this log.
- **Tests and results (2026-10-12, Node v24.16.0, local production build, bundled Playwright + Edge):**
  - `npm run lint`, `npx tsc --noEmit` and `npm run build` passed; `npm test` 26/26.
  - **`test:certs` 22/22:** 3 new tests; the stages 1–2, UXA-03 and UXA-08 tests and all 61 PDFs pass.
  - **Browser checks, PL/EN/DE at 390 and 1440 px:**
    - no sideways scroll; Produkty below the CTA, narrower, both 44 px;
    - Tab goes last sales e-mail → CTA → Produkty, with a focus ring;
    - the CTA opens the enquiry dialog, and Escape closes it;
    - Produkty → products page → "Zapytaj o ofertę: Elementy wołowe" opens the enquiry with "elementy" ticked;
    - no POST request and no runtime errors.
  - **Content kept:**
    - the link inventory of all 42 pages changed only by this link per locale since stage 2, and has no removal against the UXA-05 analysis;
    - the page's section texts are identical apart from the new link.
  - **Screenshots:** before/after of the sales section (1440 px PL; 390 px PL, and DE after) given to the user.
  - **Not run:** `test:archive`, `test:nav`, `test:home`, `test:totop`, `test:lang`, `test:notfound`. One link on one page; no shared component or style changed.
- **Security notes:** none.
- **Open issues / next steps:**
  - the focus ring on the dark card has the known contrast issue of all dark surfaces (A11Y-001, STATUS Known issues 12); unchanged, the new button behaves like the existing CTA;
  - stage 4 (Zakłady departments as links) only after the user's go-ahead.

## 2026-10-11: UXA-05 stage 2 — Produkty, Zakłady, Jakość: certificate documents and the quality contact

- **Task (as requested by the user):** the user approved stage 1 and UXA-08 (GAP-03 stays open) and asked for stage 2 only.
  - **Produkty:** on Elementy and Mięsa drobne (cutting plant, Lisków), a small "Dokumenty certyfikatów" link next to the certificate information. It leads to the cutting plant's section on Certyfikaty, using a real anchor; check the ids first, and propose the smallest safe solution if none fits. Not on other products; Ćwierci and Podroby keep UXA-03.
  - **Zakłady:** the same label and pattern on the cutting plant's card where BRCGS and IFS are named. Certificates are not duplicated. No link for SH or SH II without published documents; the UXA-03 contacts stay.
  - **Jakość:** "Zapytaj dział jakości" in the certificates section, to the existing router's "Jakość / audyt" topic. No new form, no assigned person, no duplicate link.
  - **Design and content:** existing components and styles; noticeable, right at the information, clear target, comfortable target, desktop and phone. No large blocks, no new cards, no asset or branding change. No content removed; GAP-06 and GAP-07 unchanged.
  - **Tests:** the ten listed checks in PL/EN/DE at 1440 and 390 px; project tests, extending the existing regression test; lint, TypeScript, build, `git diff --check`.
  - **Finish:** docs. Done only after checking every transition in a browser. No commit, push, merge or deployment; screenshots and a short report; stop before stage 3.
- **Goal:** from the products and the plant card, the cutting plant's certificate documents are one click away. From the quality page, so is its quality department.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Anchors checked:**
  - On Certyfikaty, the cutting plant's heading in "Aktualny status" has `id="zaklad-rozbioru"`, which is that plant's anchor in `entities.ts`. Its certificates, previews and PDFs follow it, so no new anchor was needed.
  - `id="zaklad-uboju"` heads "Pozostałe zakłady" (no documents) and is not used.
- **Done:**
  - **`components/certificates/CertificateDocumentsLink.tsx` (new):** an arrow link to `${certificates}#${entity.anchor}` with the label `cert.documentsLink` and a visually hidden ": plant" in its name. It is used only where a plant's published current certificates are listed.
  - **`components/products/ProductGroups.tsx`:** in the certificate row of products whose plant has published current certificates (Elementy, Mięsa drobne), between the certificates and the plant line, mirroring the UXA-03 row of Linne products.
  - **`app/[locale]/zaklady/page.tsx`:** in the cutting plant's "Certyfikaty:" line, after the certificates, `<br />` and the link, the same pattern as `noCurrent` + `QualityContactLink` on SH and SH II.
  - **`app/[locale]/jakosc/page.tsx`:** after the note "Wyniki dotyczą wyłącznie zakładu…", a `.link-row` with `QualityContactLink`. Jakość had no quality link before.
  - **Dictionaries:** `cert.documentsLink`, "Dokumenty certyfikatów" / "Certificate documents" / "Zertifikatsdokumente". The EN/DE translations are drafts (C-50).
  - **`QualityContactLink`:** comment only.
- **Tests (extended):** `tests/certificates-contact.test.mjs` gets one new test per locale:
  - `#zaklad-rozbioru` on Certyfikaty is the cutting plant;
  - exactly one documents link on Elementy and on Mięsa drobne, none on Ćwierci or Podroby, two on Produkty in total;
  - one on the cutting plant's card, one on Zakłady in total;
  - Jakość has the quality contact once, in `#certyfikaty`.
- **Files changed:** `src/components/certificates/CertificateDocumentsLink.tsx` (new), `src/components/certificates/QualityContactLink.tsx`, `src/components/products/ProductGroups.tsx`, `src/app/[locale]/zaklady/page.tsx`, `src/app/[locale]/jakosc/page.tsx`, `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts`, `tests/certificates-contact.test.mjs`, `README.md` (`test:certs`), `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, local production build, bundled Playwright + Edge):**
  - `npm run lint`, `npx tsc --noEmit` and `npm run build` passed; `npm test` 26/26.
  - **`test:certs` 19/19:** 3 new tests, plus UXA-03, UXA-05 stage 1, UXA-08, and all 61 PDFs linked once with the right language and document (GAP-01).
  - **`test:archive` 5/5:** UXA-07 unchanged.
  - **Browser checks, PL/EN/DE at 390 and 1440 px:**
    - no sideways scroll on Produkty, Zakłady, Jakość and Certyfikaty;
    - each new link is visible and 44 px high, and Tab reaches it with a focus ring;
    - a click from Elementy, a click from the cutting plant's card, a direct visit to `/certyfikaty#zaklad-rozbioru` and a reload all land on the cutting plant's heading, 16 px below the sticky header (92 px on phones, 120 px on desktop);
    - Jakość → Kontakt with "Jakość / audyt" expanded and the router in view; no runtime errors.
  - **Content preserved:**
    - headings and links of all 42 pages compared with the UXA-05 analysis inventory: only the new links from stage 1, UXA-08 and stage 2 were added, and nothing was removed or changed;
    - section texts are identical apart from the new link labels, including the hidden ": Zakład rozbioru, Lisków" of the documents link.
  - **Screenshots:** before/after of the three places (390 px PL; after also DE, and 1440 px) given to the user.
  - **Not run:** `test:nav`, `test:home`, `test:totop`, `test:lang`, `test:notfound`. Only these links were added on three pages; no shared style, header, footer or home page changed.
- **Security notes:** none.
- **Open issues / next steps:** stage 3 (Sprzedaż i eksport → Produkty; O firmie → Produkty) only after the user's go-ahead.

## 2026-10-11: UXA-08 — Verification note and official certification-database links

- **Task (as requested by the user):** the user approved UXA-05 stage 1 and, before stage 2, asked for one correction on Certyfikaty.
  - **Wording (PL/EN/DE):** verifying certificates in the official BRCGS and IFS databases needs an account or a sign-in; BRCGS offers a free Directory Lite account.
  - **Links:** https://directory.brcgs.com/ and https://login.ifs-certification.com/?lang=en, readable, keyboard-accessible and clearly marked as external services.
  - **Keep:** the certificate data, archive, previews, PDFs and the new quality transitions.
  - **No claims:** never suggest that a McKeen Beef certificate was independently verified in a database. Publish no identifiers until their meaning and assignment are verified; GAP-03 stays open.
  - **Tracker:** mark UXA-08 Done only in the scope of the information and the official links.
  - **Finish:** tests and docs. No commit, push, merge or deployment; stop before stage 2.
- **Goal:** the note tells visitors what verification really requires and takes them to the official databases, without implying a result.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Done:**
  - **Dictionaries (`pl.ts`, `en.ts`, `de.ts`):**
    - `cert.verify` is now "Weryfikacja certyfikatów w oficjalnych bazach BRCGS i IFS wymaga zalogowania na konto. BRCGS oferuje bezpłatne konto Directory Lite." (EN/DE equivalents, translation drafts under C-50).
    - New `cert.verifyBrcgs` "BRCGS Directory (directory.brcgs.com)" and `cert.verifyIfs` "Baza IFS (login.ifs-certification.com)" (EN "IFS Database …", DE "IFS-Datenbank …").
  - **`content/certificates.ts`:** `verificationDatabases` holds the two addresses with their source and the check date.
  - **`app/[locale]/certyfikaty/page.tsx`:** the note became a small block. The sentence, then a list of two `clink` links: external-link icon, the domain in the visible label, a visually hidden "(otwiera się w nowej karcie)", `target="_blank"`, `rel="noopener noreferrer"`. This is the site's existing pattern for external links, as on the map links.
  - **`styles/components.css`:** `.cert-verify` (no gap under the sentence) and `.cert-verify__links` (a wrapping row, ink text, 600 weight).
  - **Not published:** no Site Code or COID. Nothing on the page says that a record of these plants was checked.
- **Files changed:** `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts`, `src/content/certificates.ts`, `src/app/[locale]/certyfikaty/page.tsx`, `src/styles/components.css`, `tests/certificates-contact.test.mjs`, `README.md` (`test:certs`), `docs/content-source-map.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, local production build, bundled Playwright + Edge):**
  - `npm run lint`, `npx tsc --noEmit` and `npm run build` passed; `npm test` 26/26.
  - **`test:certs` 16/16, 3 new (PL/EN/DE):**
    - the note's sentence;
    - both addresses in order, `target="_blank"`, `rel` with `noopener` and `noreferrer`;
    - the domain in the visible label; "(opens in a new tab)" for screen readers;
    - neither 1906989 nor 26277 on the page.
    - The UXA-05 stage 1 test, UXA-03 and all 61 PDFs pass unchanged.
  - **`test:archive` 5/5:** the UXA-07 mobile archive is unchanged.
  - **Browser checks, PL/EN/DE at 390 and 1440 px:**
    - no sideways scroll; both links visible and 44 px high (one line on desktop, stacked on phones);
    - Tab reaches them in order with a focus ring;
    - Enter opens each official address in a new tab (PL, 1440 px); the stage 1 transitions still work; no runtime errors.
  - **Screenshots:** before/after given to the user. The old build no longer existed, so the "before" images show the old one-sentence note restored in its place in the browser, and are labelled as reconstructed.
  - **Not run:** the other browser suites; only this note on Certyfikaty changed.
- **Security notes:** external links open with `noopener noreferrer`. Nothing is loaded from those sites by the page, so the CSP is unaffected.
- **Open issues / next steps:**
  - GAP-03 stays open: the identifiers wait for confirmation of meaning, assignment and record availability;
  - the IFS address carries `?lang=en` in every language, as given; a PL/DE variant was not checked;
  - UXA-05 stage 2 only after the user's go-ahead.

## 2026-10-11: UXA-05 stage 1 — Certyfikaty: next steps after the archive

- **Task (as requested by the user):** the user approved the direction of the UXA-05 plan and asked for stage 1 only.
  - **Decisions to record as Approved/Deferred** (not Done before implementation):
    - **Approved:** all 8 P2 proposals; external certification-database links only to verified official addresses, never suggesting an unconfirmed certificate status.
    - **Approved P3:** O firmie → Produkty; Zakłady → transport contact and Sprzedaż i eksport; Kariera → the plant's location, if confirmed; Certyfikaty → the plant's data.
    - **Deferred:** UXA-14; extra Kontakt router transitions; offal and UPPZ (UXA-04, client).
  - **Stage 1 scope:** on Certyfikaty, check the current links, the page end and the BRCGS Directory / IFS mentions. Add light, contextual transitions to the quality department and the quality system page: no large CTA block, no duplicate of an adjacent "Zapytaj dział jakości".
  - **External databases:** verify the official addresses, purpose and availability first, and never assume a public database shows a company's current certificate. If linking needs confirmation or could mislead, report it and leave that part unchanged.
  - **Keep:** every certificate, PDF, preview, plant datum, date, result, status and the archive; UXA-07 untouched; other pages unchanged.
  - **Tests:** PL/EN/DE on desktop and phone, `test:certs`, `test:archive`, lint, TypeScript, build, `git diff --check`.
  - **Finish:** docs. No commit, push, merge or deployment; stop before stage 2.
- **Goal:** an auditor or buyer who has looked through the certificates finds the quality department and the description of the quality system without the main menu.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Before:**
  - Certyfikaty ended after the archive with only "Powrót na górę".
  - "Zapytaj dział jakości" appeared only for the two plants without a published certificate, inside "Pozostałe zakłady".
  - The verification note named both databases as plain text (`cert.verify`, used only on Certyfikaty).
- **External databases (checked online, 2026-10-11):**
  - **BRCGS:** brcdirectory.com redirects (302) to directory.brcgs.com. Its start page reads: "Sign in to your existing account or select 'Create an account' to create a free Directory Lite account."
  - **IFS:** the IFS page on its database links to login.ifs-certification.com, a sign-in page with registration. No public search was found.
  - **Decision:** a visitor without an account cannot check a certificate as the note suggests. So no database link was added and the note is unchanged (STATUS Known issues 17; UXA-08 Deferred). Whether the cutting plant is listed was not checked, because that needs an account; nothing was entered on either site.
- **Done:**
  - **`src/app/[locale]/certyfikaty/page.tsx`:** after the archive, one existing `.link-row` (the light row of arrow links used on the home page) with `QualityContactLink` ("Zapytaj dział jakości", `/kontakt?temat=quality#pomoc`) and "System jakości" (`d.quality.systemTitle`, the heading of the target section, to `/jakosc#system-jakosci`).
    - No new text, label or CSS.
    - The plant-level quality links stay as they are; the archive section separates them from the new row.
  - **`src/components/certificates/QualityContactLink.tsx`:** comment only (also used at the page end).
  - **`tests/certificates-contact.test.mjs`:** new test per locale. After the archive come exactly the two links in this order with the right targets and labels; the page has no other extra quality link (plants without a published certificate + 1); `id="system-jakosci"` exists on Jakość.
- **Files changed:** `src/app/[locale]/certyfikaty/page.tsx`, `src/components/certificates/QualityContactLink.tsx`, `tests/certificates-contact.test.mjs`, `README.md` (`test:certs`), `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, local production build, bundled Playwright + Edge):**
  - `npm run lint`, `npx tsc --noEmit` and `npm run build` passed; `npm test` 26/26.
  - `test:certs` 13/13: 3 new, plus UXA-03 and all 61 PDFs, linked once with the right language and document.
  - `test:archive` 5/5: the UXA-07 mobile archive is unchanged.
  - **Browser checks, PL/EN/DE at 390 and 1440 px:**
    - no sideways scroll; both links visible and at least 44 px high;
    - Tab from the last archive group reaches them in order, with a focus ring and not covered;
    - the quality link opens Kontakt with "Jakość / audyt" expanded and the router in view;
    - the system link opens Jakość at "System jakości", below the sticky header;
    - no runtime errors.
  - **Screenshots:** before/after of the page end (1440 px PL, 390 px PL/DE) given to the user.
  - **Not run:** `test:nav`, `test:home`, `test:totop`, `test:lang`, `test:notfound`. Only one link row on Certyfikaty changed; no shared style, component behaviour or other page was touched.
- **Security notes:** none.
- **Open issues / next steps:**
  - the verification note's wording and any database links (STATUS Known issues 17), the user's decision;
  - stage 2 (certificate documents on Produkty and Zakłady, quality contact on Jakość) only after the user's go-ahead.

## 2026-10-11: UXA-05 — Analysis and plan for contextual transitions (no code)

- **Task (as requested by the user):** UXA-05, after approving UXA-07 as done. Improve contextual navigation and remove dead ends, so that on any subpage a visitor knows where they are, finds related topics and the right department, and never has to return to the home page.
  - **Analysis first, without implementation:** for every subpage in PL/EN/DE its purpose, audience, what visitors look for, their follow-up questions, where they should go next, existing links and CTAs, and real dead ends. Use UX-IA-002; do not repeat it.
  - **No accidental CTAs:** no identical "Co dalej" block. Only links that follow from the context, never to information the target does not contain; nothing extra on legal pages.
  - **Keep the content:** no content removed or shortened; nothing moved without a reason. No asset changes, no large new sections; existing components; no duplicate links where a convenient path exists.
  - **Plan:** a table per subpage (current path, problem, proposed transition, exact place, target, reason, priority); real problems separated from optional improvements; an order of small stages.
  - **Rules:** no code change; no commit, push, merge or deployment; then stop and wait for approval.
- **Goal:** every transition between subpages makes sense to the visitor; no dead ends, no information chaos.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Done (read-only, local production build of the UXA-07 state, Edge):**
  - **Inventory** of headings, links and CTAs in `<main>` of all 42 pages (14 routes × PL/EN/DE): identical per route in the three languages.
  - **Footer:** 22 links (all sections, sales contacts, legal pages, biogas project).
  - **Kontakt router:** the links inside each of the 9 topics (opened by click; nothing submitted).
  - **Targets checked:** section texts, anchors and contact topics, so every proposed target exists and holds what the link promises.
  - **Plan** published in Polish as a private page: https://claude.ai/artifact/Vbvpn8GjCo2PRi6vjS4rxk.
- **Findings:**
  - **No page is cut off:** menu, footer and breadcrumbs work everywhere, so a block repeating them would add nothing. What is missing are next steps at decision points.
  - **8 real problems (P2) on 6 pages:**
    - Jakość: no route to the quality department;
    - Certyfikaty: verification databases as plain text (UXA-08), no next step after the archive;
    - Produkty and Zakłady: the cutting plant's certificates named without the documents;
    - Zakłady: "Własny dział skupu żywca" without contact (UXA-13);
    - Sprzedaż i eksport: no route to the assortment;
    - Biogazownia: dead end.
  - **10 optional improvements (P3):** O firmie (Produkty and the offer; UXA-14 tax strategy link), Zakłady (transport, SO GmbH), Certyfikaty (plant data), Sprzedaż i eksport (cold store), Kontakt topics, Kariera (workplace), Biogazownia breadcrumb parent.
  - **4 points wait for UXA-04:** the offal and UPPZ route (C-25).
  - **6 pages unchanged:** home, Zapytaj o ofertę, Strategia podatkowa, Polityka prywatności, Wysłano, 404.
  - **Rejected, with reasons:** a common "Co dalej" block, timeline links, links inside the enquiry form, ledger and directory links, and next steps on the result page.
- **Proposed stages:**
  1. Certyfikaty: verification links and a closing line;
  2. certificate documents on Produkty and Zakłady, plus the quality contact on Jakość;
  3. Sprzedaż i eksport → Produkty (optionally O firmie and UXA-14);
  4. Zakłady departments as links (UXA-13);
  5. Biogazownia back link to Środowisko;
  6. optional P3;
  7. after UXA-04.

  Each stage ends with a test, documentation, a report and a stop. Three new labels would be needed (PL/EN/DE drafts listed in the plan).
- **Files changed:** `docs/STATUS.md` (verification, "In progress", UX audit tracker, next steps), this log. No code, content or asset change.
- **Tests and results:** none run; no code changed. The inventory scripts ran against a temporary local server on port 5055, which was stopped afterwards.
- **Security notes:** none.
- **Open issues / next steps:** the user's decision on the plan; then stage 1 only after approval.

## 2026-10-11: UXA-07 — Certificate archive on phones

- **Task (as requested by the user):** fix UXA-07 (P2). On phones the archive table on Certyfikaty is too wide, so the preview and original-PDF buttons can be off-screen.
  - **Desktop:** keep the existing table and its functions.
  - **Phones:** ordered rows or compact cards. Each shows the year, plant or company, standard, result (if any), validity, archive status, language versions, preview and original PDF. Document buttons visible without sideways scrolling, without huge cards.
  - **Design:** the current Premium Crafted Ranch system; no new decorations, patches or icons.
  - **Keep:** every current and archived certificate, PDF, WEBP preview, PL/EN/DE version, plant assignment, status, date and the data structure. No certification changes, no new documents; GAP-01 and UXA-03 unchanged.
  - **No duplicates:** not a table plus cards with duplicated PDF links in the DOM. If a full conversion needed a large refactor, present a simpler variant first.
  - **Accessibility:** keyboard, visible focus, link labels, preview versus PDF, screen readers, contrast, touch, long PL/EN/DE labels.
  - **Verification:** the state and screenshots before; after at 320/375/390/768/1024/1440 px in PL/EN/DE (10 points); lint, TypeScript, tests, production build, `git diff --check`; a regression test for the mobile archive.
  - **Finish:** documentation; Done only after checking the real view in a browser. No commit, push, merge or deployment. Before/after screenshots and a report, then stop.
- **Goal:** a buyer or auditor finds a certificate on a phone and opens its original PDF without looking for a hidden table column.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Before (measured, local production build):**
  - At 320–390 px all 110 archive links (55 previews, 55 PDFs) lay outside the visible part of the table's scroll area: the table needs 443–460 px, the area is 240–310 px wide. The "Pliki" header was cut to "Pli"; only the row icons were in view.
  - At 320 px the page itself scrolled sideways by 14 px (PL) and 7 px (DE): the visually hidden file labels (`position: absolute`) escaped the scroll area.
  - The "Wygasł" badge text had a contrast of 3.90:1 (below 4.5:1).
  - Documents of different plants had equal link names (e.g. "IFS Food 2023" exists for Lisków and Linne).
  - From 600 px the table fits.
- **Approach:** CSS on the existing table, not a second markup. No PDF link is duplicated, and `test:certs` still counts each PDF once. No refactor was needed, so no separate variant was proposed.
- **Done:**
  - **`components.css`, below 40rem:** each archive row becomes a flex entry, scoped to `.archive` (Biogazownia also uses `.data-table`).
    - Line 1: year (17 px, bold) and standard. Then result (if any) and validity with the badge, each with a small label.
    - Then the existing `.cert-docs` grid with visible "Podgląd"/"Oryginał PDF" labels and 44 px buttons, which can wrap if ever needed.
    - The header row is visually hidden but kept for screen readers. An empty "–" result (EKO) is hidden the same way, so columns keep their headers.
    - Removed: the old phone rule that hid the file labels and caused the 320 px overflow.
  - **`craft.css`:** the archive card's side padding is 16 px on phones (was 24), so the label and three buttons fit on one line at 320 px.
  - **`CertificateArchive.tsx`:**
    - explicit table roles (`table`, `rowgroup`, `row`, `columnheader`, `rowheader`, `cell`), so the semantics survive the display change;
    - field labels with `aria-hidden`, visible only on phones; `archive__none` on an empty result;
    - the plant passed to `CertificateFiles`.
  - **`CertificateStatus.tsx`:** an optional `context` adds the plant to every link name, e.g. "IFS Food 2023 (Zakład uboju, Linne), Oryginał PDF PL (wersja polska)". Only the archive uses it; the current cards are unchanged.
  - **`tokens.css`:** `--archive` changed from #7a6f66 to #625850 (badge contrast 5.52:1). The token is used only by that badge.
  - **Plant per entry:** each group of entries sits under its heading ("Zakład rozbioru, Lisków", "MCKEEN-BEEF CP Sp. z o.o.", count). It is not repeated in each of the 20 entries, to keep them compact; for screen readers it is in every link name.
  - **Tests:**
    - `tests/certificates-archive-browser.mjs` (`npm run test:archive`) is new;
    - `tests/certificates-pdf.test.mjs` now reads rows whose elements have attributes (the roles); its checks are unchanged.
- **Files changed:** `src/components/certificates/CertificateArchive.tsx`, `src/components/certificates/CertificateStatus.tsx`, `src/styles/components.css`, `src/styles/craft.css`, `src/styles/tokens.css`, `tests/certificates-archive-browser.mjs` (new), `tests/certificates-pdf.test.mjs`, `package.json` (`test:archive`), `README.md`, `docs/architecture.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, local production build, bundled Playwright + Edge):**
  - `npm run lint`, `npx tsc --noEmit` and `npm run build` passed; `npm test` 26/26.
  - **`test:archive` 5/5 (new):**
    - phones and larger screens in PL/EN/DE;
    - table semantics in the accessibility tree;
    - Tab order through all 88 buttons of the first group, in view, uncovered, with a focus ring;
    - no JavaScript; no runtime errors.
    - **Fault injection:** with the phone layout disabled it fails ("archive area scrolls sideways (538 > 256)"). The CSS was restored from a backup (identical) and rebuilt.
  - `test:certs` 10/10: the UXA-03 contact links, and all 61 PDFs linked once with the right language and document.
  - `test:totop` 8/8 (its overlap check scrolls Certyfikaty).
  - **Measurements after**, PL/EN/DE at 320/375/390/768/1024/1440 px, every group open:
    - no page overflow, no hidden link;
    - 44 px buttons on phones (40 px in the table from 40rem, as before);
    - both labels in all 20 entries, 55 unique archive PDFs, no runtime errors.
    - **Archive height** at 390 px with every group open: PL 2428 → 3958, EN 2512 → 3958, DE 2428 → 4058 px. Entries are 172–212 px; the groups are folded by default.
  - **Pixel comparisons:**
    - the table at 768/1024/1440 px differs only in the badge column (darker text);
    - the current certificates (PL/EN/DE) and the Biogazownia tables are identical at 390 and 1440 px, except one DE 390 px scan thumbnail that was still loading in the before shot.
  - **Screenshots:** before/after reviewed; comparisons for 390 px PL, 320 px DE and 1440 px PL given to the user.
  - **Not run:**
    - `test:nav`, `test:home`: the header and home page are unchanged, and the CSS is scoped to the archive;
    - `test:lang`, `test:notfound`, `test:forms`: unrelated.
- **Security notes:** none; no data, link target or form changed.
- **Open issues / next steps:**
  - On phones an open group's table area keeps `tabIndex=0` (a region for keyboard scrolling of the wide table). It no longer scrolls there, so it is one extra Tab stop per open group. Harmless; left unchanged.
  - The archive is longer on phones, the price of visible 44 px buttons; the groups stay folded by default.
  - Next: the user picks the next UX audit fix (STATUS Next steps 2).

## 2026-10-11: SECURITY-001 — Form result signature fails closed

- **Task (as requested by the user):** before UXA-07, fix the fail-open found in the UXA-03 review.
  - **Behaviour:** keep HMAC signing with a valid `RATE_LIMIT_SALT`. A missing, empty or invalid secret signs nothing and accepts no signature; an unverifiable result leads to the neutral page. Fail closed outside production too.
  - **Limits:** no exception with technical data; never reveal the secret (logs, errors, browser code, documentation). Endpoints, form format, validation, honeypot and rate limiting unchanged; no new libraries.
  - **Report only:** other uses of the same fallback. Explain the honeypot's fake success without removing it.
  - **Tests:** missing salt, empty secret, valid test secret, signed success and error, forged signature, changed status, expired signature, PL/EN/DE switch, refresh, no-JS form. A regression test that fails if the public fallback signs results again; no regression of UXA-02/GAP-14. Only isolated local tests, no real submissions or e-mails.
  - **Docs:** `security.md` (incl. a pre-production check of `RATE_LIMIT_SALT` in Vercel), `STATUS.md`, this log. No commit, push, merge or deployment; report in Polish and stop.
- **Goal:** a "sent" or "failed" result page can only come from this server. A misconfiguration makes it neutral, never forgeable.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Cause:** GAP-14 (UXA-02) keyed the result signature from `env.rateLimit.salt`. When `RATE_LIMIT_SALT` is missing, in any environment, that value falls back to a development salt written in `lib/env.ts`. Anyone reading the public source could therefore sign `status=ok`.
- **Done:**
  - `lib/env.ts`: new `env.forms.resultSecret`, which is `RATE_LIMIT_SALT` as configured, with no fallback. The production `config.invalid` warning now also says that results are not signed when the variable is missing, and warns when it is shorter than 32 characters. It names the variable only.
  - `lib/forms/result.ts`: `MIN_SECRET_LENGTH = 32` and `isUsableResultSecret()`. Without a usable secret `signFormResult()` returns `null` and `verifyFormResult()` returns `false`, in every environment; nothing throws.
  - `lib/forms/pipeline.ts` (`respond()`): adds `t` and `sig` only when signing succeeded. Otherwise the 303 carries `form` and `status` only: same endpoint, same format.
  - `lib/forms/context.ts` (`isConfirmedFormResult()`): verifies with `env.forms.resultSecret`.
  - **Unchanged:** the result page, endpoints, form fields, validation, honeypot, fill-time check, rate limit and Turnstile. The JavaScript (JSON) path never used the signature.
- **Without a usable secret:** messages are still delivered. A no-JS sender lands on the neutral "Brak wyniku do wyświetlenia" page with the direct contacts instead of a confirmation.
- **Other use of the same fallback (reported, not changed):** `clientKey()` hashes the client IP for the rate limit with `env.rateLimit.salt`. Without the variable, whoever can read the rate-limit keys (memory, or Redis for the window) could recover IPv4 addresses by trying them all. The keys are not logged and limiting works; low impact. STATUS Known issues 16.
- **Honeypot (assessed, not changed):** the fake success is deliberate ("bots get a fake success so they learn nothing", `pipeline.ts`), and with a usable secret it is signed like any result. Low risk:
  - anyone can obtain a genuine "sent" page for a request that delivered nothing and share it for an hour (generic text only);
  - autofill that fills the hidden field would show a real person "sent".
  - Not signing it would let bots detect the trap. Details: `security.md` §2.8.
- **Files changed:** `src/lib/env.ts`, `src/lib/forms/result.ts`, `src/lib/forms/pipeline.ts`, `src/lib/forms/context.ts`, `tests/form-result.test.mjs`, `tests/language-browser.mjs`, `.env.example` (comment), `README.md`, `docs/security.md`, `docs/architecture.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, local production build, bundled Playwright + Edge):**
  - `npm run lint`, `npx tsc --noEmit` and `npm run build` passed; `npm test` 26/26 (2 new).
  - **Regression test** (`tests/form-result.test.mjs`):
    - reads the fallback from `lib/env.ts`, then asserts that it is not a usable secret, signs nothing, and that a result forged with it is rejected;
    - asserts that `resultSecret` has no fallback and that `pipeline.ts` and `context.ts` key results with it.
    - **Fault injection:** keying results with `env.rateLimit.salt` again, or giving `resultSecret` the fallback, each made it fail; the files were restored.
  - **Unit:** undefined, `null`, empty, blank, short, 31-character and padded 31-character values sign and confirm nothing; 32 characters are usable.
  - **Server in three configurations** (scratch probe, printing outcomes only):
    - **No `RATE_LIMIT_SALT`, and a 15-character value:** results forged with the public salt, an empty key or a random signature are neutral in PL/EN/DE. The honeypot no-JS 303 is unsigned and its page neutral. The log names only the variable.
    - **A random 64-character test secret** (never printed, deleted afterwards): signed success and error are shown in PL/EN/DE. An error signature with the status changed to ok, and a success signed 3601 s earlier, are neutral; forged ones too.
  - `test:lang` 6/6 both ways: PL → EN → DE → PL, refresh and no-JS. It was adapted to detect the server's mode; in both modes a result forged with the public salt is neutral.
  - **Normal sending:** delivery went to a local SMTP sink on 127.0.0.1 (TLS with a one-day self-signed certificate, content discarded). Nothing left the machine.
    - With the secret: three complete no-JS enquiries (PL/EN/DE) got a 303 to a signed success and the thank-you page.
    - Without the variable: the same enquiries were delivered and ended, unsigned, on the neutral page.
    - `test:forms` 12/12 three times: dead SMTP (`FORMS_EXPECT=fail`), then delivery to the sink with and without the secret (7 messages per run).
  - **No leak:** the secret is in neither the server log nor the result pages' HTML or their 8 scripts.
  - `test:notfound` 4/4, `test:certs` 10/10.
  - **Not run:** `test:nav`, `test:home`, `test:totop`. The change is server-side form signing only and touches no page, style or client component.
- **Security notes:** the secret is read only in the server-only env module and is never logged; no document contains a value. Before production, check `RATE_LIMIT_SALT` in Vercel (`security.md` §10).
- **Open issues / next steps:**
  - set and check `RATE_LIMIT_SALT` in Vercel before launch;
  - Known issues 16 (the rate-limit IP hash fallback) waits for the user's decision;
  - next task: UXA-07, as the user announced.

## 2026-10-11: UXA-03 — Quality contact where a plant's certificate is not published

- **Task (as requested by the user):** fix UXA-03 (P1). Where the site says a plant's current certificate is not published, give a clear next step: a link to the existing quality/audit path of the contact router.
  - **Scope:** find every occurrence (Certyfikaty, Zakłady, related product cards, PL/EN/DE).
  - **Labels:** suggested "Zapytaj dział jakości" / "Contact the quality department" / "Qualitätsabteilung kontaktieren".
  - **Plant context:** keep it only if the router can select the plant safely; otherwise no automatic routing to a person, and the visitor chooses.
  - **Meaning:** "not published" means neither certified nor not certified. No new certificates, dates, numbers, status claims or plant data; current and archived documents and GAP-01/05/06/07/08 untouched; no page redesign.
  - **Tests:** PL/EN/DE, language switch, refresh, no-JS, 390/1440 px, keyboard and focus, PDF preview and download; a small regression test; lint, TypeScript, tests, build, `git diff --check`.
  - **Also:** a read-only review of the new form result signature. Can a missing or misconfigured `RATE_LIMIT_SALT` allow a fake success? If so, report it as blocking and propose the smallest fix without changing the form system, never revealing the secret.
  - No commit, push, merge or deployment; report in Polish and stop.
- **Goal:** a buyer or auditor never ends a certificate search on a sentence without a next step.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Occurrences found:**
  - the sentence `cert.noCurrent` appears on Certyfikaty ("Pozostałe zakłady": SH Linne, SH II Wydrzyn) and on the SH and SH II cards on Zakłady;
  - product cards had no certificate row for products made in Linne (Ćwierci, Podroby), so they gave no certificate information at all (UXA-17).
- **Plant context:** the router has no per-plant selection. Its quality/audit topic lists the quality department of every plant by plant name (Linne, Wydrzyn, Lisków), so the link opens that topic and the visitor chooses. No new routing was built.
- **Done:**
  - `components/certificates/QualityContactLink.tsx`: an `arrow-link` to `/<contact>?temat=quality#pomoc` with the new PL/EN/DE label `cert.askQuality`.
  - **Certyfikaty:** the link on its own line after the sentence.
  - **Zakłady:** the link after the sentence in the card's certificate line.
  - **Produkty:** the certificate row also appears for a product's plants without a published current certificate (`sitesWithoutCurrentCertificate`, the same list as on Certyfikaty). It shows the same sentence, the link and the plant name, in the layout of the existing certificate rows.
  - Wording and meaning unchanged; no CSS change.
- **New test:** `tests/certificates-contact.test.mjs` (in `npm run test:certs`). It works on the server-rendered HTML, so it also covers the no-JavaScript path. In PL/EN/DE it checks:
  - every sentence on the three pages (2 per page) is followed by the link with the right label;
  - the link's target opens the quality topic with the three plants and their phone numbers.
- **Files changed:** `src/components/certificates/QualityContactLink.tsx` (new), `src/app/[locale]/certyfikaty/page.tsx`, `src/app/[locale]/zaklady/page.tsx`, `src/components/products/ProductGroups.tsx`, `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts`, `tests/certificates-contact.test.mjs` (new), `package.json` (`test:certs`), `README.md`, `docs/content-source-map.md`, `docs/security.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge, local production build):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 24/24; `npm run build` passed.
  - `test:certs` 10/10 (4 PDF + 6 new), `test:lang` 6/6, `test:notfound` 4/4, `test:home` 7/7, `test:nav` 16/16, `test:totop` 8/8.
  - **Browser checks** (PL/EN/DE, 1440 and 390 px):
    - 2 links per page; a click and keyboard Enter (visible focus ring) open the contact page at the router with "Jakość / audyt" open and three plants listed;
    - a refresh and the language links keep the topic;
    - the certificate viewer and the PDFs still work; no runtime errors.
  - **Readability:** a first version put the link inline on product cards, which stretched the line spacing. It now sits on its own line everywhere.
  - `git diff --check` clean.
- **Security review of the form result signature (read-only, nothing changed):**
  - **Finding:** without `RATE_LIMIT_SALT`, `lib/env.ts` uses a development salt that is in the public source. A result signed with it was accepted on a local production server: `/en/sent?form=enquiry&status=ok&t=…&sig=…` showed "Thank you. Your message has been sent." The mechanism **fails open** when the salt is missing. Reported as blocking for launch unless the salt is set (STATUS Known issues 16).
  - **Smallest fix proposed for approval:** a key helper returning no key in production when `RATE_LIMIT_SALT` is unset. `respond()` then adds no signature and `isConfirmedFormResult()` returns false, so the page always shows the neutral state.
  - **The rest looks sound:** constant-time comparison, purpose label, one hour validity, the secret never logged (only its name in the existing warning).
  - **Residual, low:** a genuine signed fake success can be obtained by filling the honeypot and shared for an hour. Not changed.
- **Security notes:** the new links are internal (fixed path from `href()`), with no user input.
- **Open issues / next steps:**
  - The user's decision on the fail-closed fix.
  - The next UX fix (UXA-04 needs the client's answer on the offal/UPPZ mailbox).

## 2026-10-11: UXA-02 + GAP-14 — Language switch context and form result page

- **Task (as requested by the user):** fix UXA-02 (the language switch loses URL parameters and the user's context) and GAP-14 (the result page without the right parameters may show a misleading error). This is functionality, not looks.
  - **Switch:** keep relevant supported parameters, the contact topic and valid anchors; carry nothing unrelated; no open redirect or unsafe URL handling; navbar unchanged.
  - **Result pages** (`/wyslano`, `/en/sent`, `/de/gesendet`):
    - a confirmed success is consistent across languages;
    - a failed send is distinguished from a missing result;
    - without parameters, a neutral message that never suggests the message was not sent;
    - no success claimed solely from an untrusted URL parameter without assessing the mechanism. If reliable confirmation needed bigger architecture, propose it first;
    - alternative contacts and the way back kept.
  - **Forms:** server validation, anti-spam, endpoints, messages, data protection and the no-JS path untouched otherwise; no real submissions to company mailboxes.
  - **Tests:** PL → EN → DE → PL on the result page; success, error and unknown; no parameters; the contact topic; anchors; plain pages; direct URLs; refresh; no-JS; no accidental resubmission. Desktop and phone, PL/EN/DE. Lint, TypeScript, project tests, build, `git diff --check`; STATUS, this log and the docs.
  - No commit, push, merge or deployment; report in Polish and stop.
- **Goal:** a foreign customer always gets clear, correct and consistent information, whatever the language.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Findings before the change:**
  - **The switch:** `LanguageSwitch` built links from the path only (`href(locale, routeKey)`), so every query and anchor was dropped.
  - **The contact topic:** it lived only in the router's state (the URL changed only for deep links).
  - **Where "success" came from:**
    - with JavaScript, the forms show the server's JSON outcome inline and never reach the result page;
    - without JavaScript, the endpoints answer with a 303 to `/wyslano?form=…&status=…`;
    - the page trusted the bare `status`, so anyone could link to a fake "sent";
    - without parameters it showed "Nie udało się wysłać formularza" (GAP-14).
  - **Early failures:** before the body is read (rate limit, unreadable body), the redirect always went to the Polish page.
- **Done:**
  - **Signed result (no new system, no new secret):**
    - `lib/forms/result.ts` signs form, status and time with HMAC-SHA256, using a key derived from `RATE_LIMIT_SALT` with a purpose label;
    - `lib/forms/pipeline.ts` adds `t` and `sig` to the 303;
    - `/wyslano` (via `isConfirmedFormResult` in `lib/forms/context.ts`) states success or failure only for a valid signature at most an hour old; otherwise a neutral state with the existing neutral notice style, the direct contacts and the links back to the form and home;
    - new PL/EN/DE strings `forms.unknownTitle` and `forms.unknownText`.
  - **Early failures:** the redirect language comes from the same-origin `Referer` path; a foreign or missing referer still gives PL.
  - **Language switch:** `i18n/language-switch.ts` (pure rules) carries `temat` (contact, then `#pomoc`), `produkt` (offer) and `form`/`status`/`t`/`sig` (result page) when well-formed, plus a valid anchor. Every other parameter, and all parameters on other pages, are dropped. Target paths come only from `href()`.
  - **How the switch renders:**
    - `useSearchParams` suspends during server rendering, so the server-rendered links (kept by browsers without JavaScript) use the request's query;
    - `src/proxy.ts` always sets `x-search` (≤ 2048 characters), overwriting client values, and the layout passes it through `SiteHeader`;
    - with JavaScript the live query and the anchor (re-read on hover, touch and focus) take over.
  - **Contact router:** a chosen topic is written to the address with `history.replaceState` (`?temat=`, no new history entry).
- **Files changed:**
  - **Code:** `src/lib/forms/result.ts` (new), `src/lib/forms/pipeline.ts`, `src/lib/forms/context.ts`, `src/app/[locale]/wyslano/page.tsx`, `src/i18n/language-switch.ts` (new), `src/components/navigation/LanguageSwitch.tsx`, `src/components/layout/SiteHeader.tsx`, `src/app/[locale]/layout.tsx`, `src/proxy.ts`, `src/components/contacts/ContactRouter.tsx`, `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts`.
  - **Tests:** `tests/form-result.test.mjs` (new), `tests/language-browser.mjs` (new), `package.json` (`npm test` runs the new unit tests; script `test:lang`).
  - **Docs:** `README.md`, `docs/architecture.md`, `docs/security.md`, `docs/content-source-map.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge, local production build):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 24/24 (19 + 5 new); `npm run build` passed.
  - `test:lang` 6/6, `test:notfound` 4/4, `test:home` 7/7, `test:nav` 16/16, `test:certs` 4/4, `test:totop` 8/8.
  - `test:forms` 12/12 with `FORMS_EXPECT=fail` on a temporary server with SMTP at `127.0.0.1:9` and test recipients at localhost; nothing left the machine.
  - **Form posts in the tests:** only no-JS submissions stopped before delivery (honeypot, expired stamp) and `test:forms` against the refused SMTP.
  - **A first run of `test:lang` failed:** with JavaScript off, the contact page links had no topic, because `useSearchParams` suspends during server rendering. This led to the `x-search` fallback.
  - **A later run hit the per-IP rate limit:** after `test:forms` the honeypot post got `rate`. The test now gives each submission its own `X-Forwarded-For`, as `test:forms` does.
  - `git diff --check` clean.
- **Security notes:**
  - **No open redirect:** the language links' paths come only from `href()`. Values are validated and re-encoded; `//evil.example` and `<script>` are dropped (unit and browser tests).
  - **`x-search`:** always set by the proxy, so client-supplied values are ignored.
  - **The result signature:** constant-time comparison; one hour of validity; the key is derived from `RATE_LIMIT_SALT` with a purpose label.
  - **The development salt:** if `RATE_LIMIT_SALT` is missing in production, the development salt makes signatures forgeable. The startup warning already covers it, and the deployment checklist now names this use.
- **Open issues / next steps:**
  - **Inline results with JavaScript** stay on the form page and are not carried by the language switch: the switch reloads the page, and an inline success message disappears (the form was sent; nothing is resent).
  - **A signed result older than an hour** shows the neutral page.
  - The user's decision on the next fix (UXA-03 proposed).

## 2026-10-11: UXA-01 — Request loop on EN/DE 404 pages (P0)

- **Task (as requested by the user):** fix only UXA-01 from the UX-IA-002 audit.
  - **The problem:** unknown EN/DE URLs (`/en/not-there`, `/de/gibt-es-nicht`, `/en/p/news`, `/de/p/aktuelles`) caused an endless request loop of about 480–540 requests/s; PL and existing pages were fine.
  - **Diagnosis first:** how Next.js handles 404s, PL/EN/DE routing, `Link` prefetching, whether the 404 prefetches its own links in a loop, interaction between language routing and not-found, unnecessary redirects in components or the proxy, and whether it happens only in production. Do not assume that disabling prefetch removes the real cause, and do not disable it site-wide without reason.
  - **Safe verification:** local production build only, short controlled reproductions, tabs closed at once. Compare PL/EN/DE 404s with existing EN/DE pages.
  - **Requirements:** stop the loop; keep proper 404 handling with HTTP 404, navigation from the error page, PL/EN/DE; no redirect loops; no regressions; no unnecessary navbar, hero, form, content or design changes; no dependencies; no hiding the 404 and no redirects to the home page.
  - **Regression test:** watch PL/EN/DE 404s for a short equal window, detect repeated identical requests (not just a total), check the 404 status, navigation to existing subpages and normal pages; before/after table.
  - **Final checks:** lint, TypeScript, existing tests, the new test, build, `git diff --check`, a real browser, a short security review of the routing change; STATUS, this log, technical docs.
  - **Out of scope:** UXA-02 … and everything else. No commit, push, merge or deployment; report in Polish and stop.
- **Goal:** no request storm, with the 404 behaviour and navigation unchanged in PL/EN/DE.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Diagnosis** (local production build, Edge, 2–5 s reproductions, tabs closed at once):
  - **What repeated:** only head-only prefetches. They carried the request header `Next-Router-State-Tree: ["",{},null,"metadata-only"]` and went to the first four section links of the EN/DE 404 (`/en/products`, `/en/quality`, `/en/certificates`, `/en/sales-export`), all answered 200 with `x-nextjs-rewritten-path: /en/produkty` etc. Each link sent no route-tree request (`Next-Router-Segment-Prefetch: /_tree`). On the PL 404 and on normal EN pages, each link sends one route-tree and one head request.
  - **The mechanism:** Next.js 16.3.8 "optimistic routing" (`next/dist/client/components/segment-cache/optimistic-routes.js`).
    - The client learns a route as a pattern when the URL maps one to one onto the rendered route; this happens already for the initial page (`create-initial-router-state.js`).
    - The proxy rendered `/en/not-there` from the identical path through `[locale]/[...rest]`. The client therefore learned "every `/en/<x>` without a static sibling `x` is the catch-all" and predicted it for the localised slugs, which the proxy actually rewrites to other folders.
    - For head-only requests Next skips the tree-divergence check (`cache.js`, `fetchSegmentPrefetchesUsingDynamicRequest`), so the wrong prediction is never corrected and the prefetch repeats without end.
  - **Why PL was unaffected:** its URLs have no locale segment, so the client detects the rewrite and learns nothing.
  - **The loop persists in the session:** after clicking Home on the EN 404, the loop continued on `/en` (1540 requests in 3 s). So `prefetch={false}` on the 404 page's links would not have been enough: the header, footer and later pages link to the same URLs.
  - **Not in development:** automatic prefetching runs only in production (Next.js docs, "Prefetching"); a dev server was not started.
- **Done:** `src/proxy.ts` rewrites unknown paths to `/<locale>/unknown/<path>` instead of `/<locale>/<path>` (constant `UNKNOWN_PATH_SEGMENT`, with the reason in a comment).
  - The rendered path no longer mirrors the URL, so the client detects a rewrite and never learns the catch-all as a pattern.
  - Unchanged: the 404 page and its links, prefetching everywhere, statuses and redirects.
- **New test:** `tests/not-found-browser.mjs` (`npm run test:notfound`). It runs on a local production build, watches each page for 3 s and closes the tab, and fails if any identical RSC request repeats more than 3 times. It covers:
  - six unknown PL/EN/DE URLs: 404, address kept, localised heading;
  - five existing pages (200);
  - four click-throughs from the EN/DE 404 to home and a section;
  - runtime errors.

  Before the fix it failed (EN 404: one request 282 times in 3 s).
- **Files changed:** `src/proxy.ts`, `tests/not-found-browser.mjs` (new), `package.json` (script `test:notfound`), `README.md`, `docs/architecture.md`, `docs/STATUS.md`, this log.
- **Before → after** (RSC requests in 3 s; most repeated request in brackets):

  | Test | Before | After |
  |---|---|---|
  | 404 PL `/nie-ma-takiej-strony` | 20 (1) | 20 (1) |
  | 404 EN `/en/not-there` | 1324 (331) | 20 (1) |
  | 404 DE `/de/gibt-es-nicht` | 1564 (391) | 20 (1) |
  | 404 EN `/en/p/news` | 1328 (332) | 20 (1) |
  | 404 DE `/de/p/aktuelles` | 1485 (371) | 20 (1) |
  | Existing EN `/en/products` | 20 (1) | 21 (1) |
  | Existing DE `/de/produkte` | 21 (1) | 21 (1) |
  | EN 404 → click Home | 1540 (385) | 2 (1) |
  | DE 404 → click Home | 1716 (429) | 0 |

- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge, local production build):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `test:notfound` 4/4, `test:home` 7/7, `test:nav` 16/16, `test:certs` 4/4, `test:totop` 8/8.
  - **Also checked:**
    - 10 s on `/en/not-there`: 20 requests, each link once for its route tree and once for its head;
    - phone 390 px EN/DE/legacy 404s: 18 requests, no repeats.
  - **HTTP:**
    - unknown URLs 404 without a redirect; `/pl/…` and `/en/kontakt` keep their 308s;
    - `/en/%2e%2e/admin` 404; `/en//evil.example.com` → 308 to the same-origin path `/en/evil.example.com` (Next.js slash normalisation, not an open redirect);
    - no `x-powered-by` or `server` header, no rewritten path on documents.
  - `git diff --check` clean.
- **Security notes:**
  - The change is an internal rewrite only. No new redirect, so no open redirect and no redirect loop (`/en/unknown`, `/en/unknown/unknown` answer 404).
  - The internal segment is visible only in the rewritten-path header of RSC responses, like every other folder name.
  - It removes a load risk: one tab could send about 500 requests per second.
- **Open issues / next steps:**
  - The user's decision on the next fix (UXA-02 proposed).
  - **Residual risk:** the same Next.js behaviour would return if a future route renders a URL one to one through a dynamic segment whose siblings are reached through proxy rewrites. `test:notfound` covers the 404 case.

## 2026-10-11: UX-IA-002 — Site functionality and information architecture audit (analysis only)

- **Task (as requested by the user):** the user accepted the stage 1.4 findings, kept them in the backlog and asked for an audit of the whole site instead of more home page work.
  - **Priorities, in order:** functionality; intuitive navigation and findability; section order and information architecture; readability, hierarchy and mobile comfort; consistency. Design and photo replacement are not priorities (assets will be generated later; none to be replaced now).
  - **Scope:** every subpage and route in PL/EN/DE: Produkty, Jakość, Certyfikaty, Sprzedaż i eksport, Zakłady, O firmie, Kariera, Kontakt, Zapytaj o ofertę, Biogazownia, Strategia podatkowa, Polityka prywatności, form result pages and other routes. The home audit is the reference and is not repeated.
  - **Checks:**
    - links, buttons, forms, documents, anchors, language switch, menu and other interactions in a real browser;
    - whether users know where they are, where to find information, what to do next, and meet no dead ends;
    - readability on phones;
    - consistency of shared patterns without forcing identical layouts.
  - **Six user tasks:** importer, quality employee, cattle supplier, candidate, foreign customer, full company data.
  - **Content:** no removal or blind shortening; justify repetitions.
  - **Widths:** 1440/768/390 px plus problem widths; screenshots and close-ups.
  - **Report:** global functional problems, per-page audit, user tasks, cross-page problems, P0–P3 with evidence, things to keep, an order of small testable fixes, a separate asset list. Every problem must name the place, the consequence and a proposal.
  - **Rules:** Git first, uncommitted changes kept, routing and shared components before pages, no full-repository scans. Audit only, with no changes to code, content, assets or configuration. No commit, push, merge or deployment; report, then stop.
- **Goal:** a concrete, evidence-based backlog that lets any visitor understand each page, find information and know where to go next.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit. The production build was current (UX-IA-001 stage 1.3).
- **Done (no code, content, asset or configuration change):**
  - Browser crawl of all 42 pages and verification of 274 internal links, 96 anchors, 63 documents and 6 external links.
  - Readability pass at 390/768/1440 px on every page, interaction checks, the six user tasks, and phone positions of key blocks.
  - Full-page screenshots and close-ups.
  - Form checks used empty or incomplete fake data; every `/api` request was intercepted in the browser, so nothing reached the server or a mailbox.
- **Findings:** UXA-01 … UXA-18 in [`docs/ux-audit-2026-10-11.md`](docs/ux-audit-2026-10-11.md); live status in the new "UX audit tracker" in `docs/STATUS.md`.
  - **P0:** UXA-01. Unknown EN/DE URLs, including old `/en/p/…` URLs and `/en/Contact`, prefetch the 404 page's links in an endless loop: about 480–540 requests per second from one tab. The PL 404 and normal pages are unaffected.
  - **P1:**
    - UXA-02: the language switch drops the query, so after a successful form the EN/DE page says "could not be sent".
    - UXA-03: no route from "certificate not published" (SH, SH II) to the plant's quality contact.
    - UXA-04: the offal/UPPZ buttons open the Oelde offer form (one mailbox), while the page names the Linne department. This needs a client decision.
  - **P2:**
    - UXA-05: no next step at page ends.
    - UXA-06: the desktop selector shows "Strona główna" on pages outside the menu.
    - UXA-07: certificate archive on phones.
    - UXA-08: verification databases are not linked.
    - UXA-09: unbranded default 404 for URLs with an extension.
  - **P3:** UXA-10 … UXA-18.
  - **Confirmed known items:** GAP-10, GAP-12, GAP-13, GAP-14, GAP-16 … GAP-18, C-50; and from stage 1.4, Known issues 12–15.
- **Files changed:** `docs/ux-audit-2026-10-11.md` (new), `docs/STATUS.md` (verification row, in progress, UX audit tracker, next steps), `AGENTS.md` (documentation table row), this log. Screenshots and scripts stay outside the repository.
- **Tests and results:** no code changed, so the project suites were not rerun; they passed on this build in stage 1.3, the same day. The audit's own checks are listed above. `git diff --check` clean.
- **Security notes:** read-only. UXA-01 is also a load risk; until it is fixed, a single visitor on an unknown EN/DE URL generates about 500 server requests per second.
- **Open issues / next steps:** the user picks the fixes. The proposed order starts with UXA-01, then UXA-02, UXA-03, UXA-04 (after the client's answer), UXA-05 and UX-IA-001 decision 3.

## 2026-10-11: UX-IA-001 stage 1.4 — Final homepage design and UX review (analysis only)

- **Task (as requested by the user):** the user accepted the direction of stage 1.3 and asked for a final review of the whole home page, from the navbar and hero to the footer. Analysis only, no code changes.
  - **In a real browser, check:**
    1. visual hierarchy;
    2. section flow (products → process → quality → environment → sales → contact);
    3. visual rhythm;
    4. brand identity (embroidery, cattle tags, cattle illustrations, materials, icons: consistent but not overdone);
    5. content hierarchy (small text, weak contrast, composition);
    6. mobile UX;
    7. CTAs and navigation for a B2B buyer (products, certificates, contact);
    8. photos and materials in context;
    9. accessibility (contrast, focus, target sizes, reduced motion; A11Y-001 included, not implemented);
    10. PL/EN/DE consistency.
  - **Widths:** 1440, 768 and 390 px; full screenshots and close-ups of problems.
  - **Report:** what is ready and stays; real problems; fixes needed before further work; optional polish; whether the home page can be the pattern for the other pages. No redesign without a concrete reason, no shortening for length; McKeen Beef is a serious, extensive production group, not a minimal landing page.
  - **Rules:** Git and docs first, uncommitted changes kept, no commit, push, merge or deployment; stop after the report.
- **Goal:** an evidence-based list of what to keep, what to fix and what is optional before the home page sets the pattern for the subpages.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit. The production build was newer than the last source change.
- **Done (no file in the site changed):**
  - Full-page screenshots in Edge on a local production build: PL/EN/DE × 1440/768/390 px.
  - Measured page-wide:
    - per-section heights and surfaces;
    - text contrast against the computed background (gradients: worst stop);
    - text sizes and interactive target sizes;
    - images: served file against displayed box, including at device pixel ratio 2;
    - headings, B2B link positions, mobile header and menu contents;
    - every Tab stop at 1440 and 390 px (ring, sticky-header overlap, ring contrast);
    - reduced motion against default motion.
  - Close-ups of each finding. The report was given to the user in Polish.
- **Findings:**
  - **Ready:**
    - the section order and links;
    - the light/dark rhythm (light, light, dark, paper-2, light, paper-2, light, dark);
    - one consistent material system (ear tags, stitched cards, embroidered icons, patches);
    - B2B paths: the sticky desktop header with all destinations and the CTA; on phones the menu with 8 links, the sales phone and the CTA.
  - **Accessibility:**
    - all text ≥ 4.5:1 (lowest 4.69:1, red eyebrow tags); smallest text 13 px, metadata only;
    - focus ring ≥ 2 px on all 64/55 Tab stops, none hidden by the sticky header;
    - no target below 24 px;
    - reduced motion: video paused, no animations;
    - no overflow or console errors in 9 variants;
    - DE is 2–3 % longer and holds.
  - **Real problems** (STATUS Known issues 13–15):
    - (13) empty area under the quality photo from 64rem: 347–431 px at 1280–1920 px, 798 px at 1024 px;
    - (14) trust strip as 3 + 1 at 700–899 px (frozen element, needs consent);
    - (15) soft photos on phones: chain tiles about 2.5× and truck about 1.9× enlarged, because their `sizes` ignore the cover crop; product photos are limited by 595–660 px sources (C-61);
    - A11Y-001 measured: 34 of 64 Tab stops at 1440 px have 2.94–2.96:1 ring contrast.
  - **Optional:**
    - the chain eyebrow tag wraps to 2 lines at 360–390 px (PL);
    - the chain photos on phones are three narrow crops with little to read;
    - the quality photo is very tall on tablets (721 × 577 px);
    - there is no compact enquiry button in the phone header (the menu has one).
- **Files changed:** `docs/STATUS.md`, this log. Screenshots and measurement scripts stay outside the repository.
- **Tests and results:** no code changed, so the test suites were not rerun (they passed on this build in stage 1.3, the same day). The review's own checks are listed above; `git diff --check` clean.
- **Security notes:** none; read-only.
- **Open issues / next steps:** the user's decision on the necessary fixes (Known issues 13–15) and on A11Y-001's timing; no implementation before a separate approval.

## 2026-10-11: UX-IA-001 stage 1.3 — Environment section

- **Task (as requested by the user):** the user accepted the final result of stage 1.2 (sales and process are not to be touched again) and asked to refine only the home section "Fotowoltaika i projekt biogazowni".
  - **Goal:** a professional presentation of a large production group's environmental activities, no longer visually modest. Clearer hierarchy, better composition, Premium Crafted Ranch, a subtle nod to industry, nature and the company, a smooth flow Jakość → Środowisko → Sprzedaż, all facts kept.
  - **Direction:**
    - no three identical generic cards; a more distinctive editorial layout with a stronger heading;
    - waste, photovoltaics and the biogas plant clearly separated;
    - subtle icons or illustrations in one style and small brand-inspired marks;
    - soft natural surfaces and stitching, delicate material depth, good spacing;
    - the biogas plant may stand out a little, since it has its own documentation page;
    - not a huge decorative block.
  - **Content rules:**
    - no stock photos or AI images posing as the company's installation;
    - keep all existing content on waste, photovoltaics, the Linne biogas plant, the confirmed project parameters, the EU co-financing and the link to the project documentation;
    - no unconfirmed ecological effects or slogans ("zeroemisyjna produkcja", "100% zielona energia", "neutralność klimatyczna");
    - no company attribution of the biogas plant (GAP-07 stays resolved, C-64 open);
    - the EU project page's mandatory content and logos untouched.
  - **Flow:** the section has to fit both neighbours, with no contrast added just for more colour.
  - **Process:** check the current layout with "before" screenshots, propose the smallest effective change, implement it in this section only. Hero, navbar, trust proof, products, process, quality, sales, contact and other pages unchanged.
  - **Verification:**
    - Git checks first, uncommitted changes kept, not on main/dev;
    - PL/EN/DE at 390/768/1024/1440 px: texts and links complete, readability, contrast, mobile behaviour, overflow, fit with the neighbours, accessibility, the project link kept;
    - before/after screenshots and the whole home page for rhythm;
    - lint, TypeScript, tests, build, `git diff --check`;
    - STATUS, this log and the relevant docs;
    - no commit, push, merge or deployment; show the result and stop.
- **Goal:** the same facts, presented with weight and structure, in the materials of the sections around it.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Findings before the change:** a split head (heading, line button on the right) over three equal text columns under a 2 px rule. There were no icons and no material; the first two columns ended after 2 lines and the biogas one after 4. The section was visibly lighter than quality above (photo and certificate cards) and the sales board below.
- **Done:**
  - **Markup** (`src/app/[locale]/page.tsx`, this section only):
    - a red eyebrow above the numbered H2, reusing Jakość's section title `quality.envTitle` (Środowisko / Environment / Umwelt), the only text added;
    - waste and photovoltaics as ruled rows with embroidered icons;
    - the biogas plant project as one `stitched` card with a small felt `BrandPatch` (size `sm`: no lettering, so nothing names a company or brand with the project) and the existing link, moved from the section head into the card.
  - **Content file:** `src/content/environment.ts` got an `id` per fact (`waste`, `solar`, `biogas`) so the home can place them. Texts unchanged; Jakość renders them as before.
  - **Icons:** `public/craft/icons/recycle.svg`, `solar.svg` and `biogas.svg`, drawn in the DESIGN-002 style (192 grid, 7 px round strokes) and registered in `BrandMarks.tsx`. They are generic symbols, not a picture of an installation. A first biogas version with a flame read as a water drop at small size, so it has a lightning bolt instead (electricity from cogeneration, as the text says).
  - **CSS** (`src/styles/art.css`, new `.env-home` block):
    - Phones: head, rows, card, with the patch beside the card's title.
    - From 40rem: the rows side by side, the patch left of the card's text.
    - From 64rem: 5fr / 7fr columns. The head and rows sit on the left; the card on the right runs from the eyebrow to the rows' bottom line, patch on top.
    - The card's content is 1–34 px shorter than that column at 1024–1920 px; the difference goes into its row gaps.
    - The unused `.facts-row` rule was removed from `pages.css`; `.facts-row__title` stays for Jakość.
  - **Iterations:** two built versions were rejected after review.
    - The first had icons that were too small and faint, and a plain icon in the card.
    - The second had the card ending on the rows' line but starting 1–34 px below the eyebrow, a near miss.
- **Files changed:** `src/app/[locale]/page.tsx`, `src/content/environment.ts`, `src/components/brand/BrandMarks.tsx`, `src/styles/art.css`, `src/styles/pages.css`, `public/craft/icons/recycle.svg`, `solar.svg`, `biogas.svg` (new), `docs/STATUS.md`, `docs/architecture.md`, `docs/content-source-map.md`, `docs/asset-map.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge, local production build; the dev server on port 5000 was not running):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:home` 7/7 (incl. the section order with `env-h`), `test:nav` 16/16, `test:certs` 4/4, `test:totop` 8/8.
  - **Content (PL/EN/DE × 390/768/1024/1440 px, 12 variants):**
    - all 8 earlier texts kept; the only text added is the eyebrow;
    - the project link is identical in label and target (`/biogazownia`, `/en/biogas-plant`, `/de/biogasanlage`);
    - headings unchanged (H2 > 3 × H3); no company named; no image; no horizontal overflow.
  - **Accessibility:**
    - lowest contrast 4.69:1 (white on the red eyebrow tag, the same tag as in other sections); body text 8.65:1; headings ≥ 14:1;
    - the 4 decorative marks are `aria-hidden`;
    - Tab from the quality section's last link reaches the project link (3 px ring, in view), then the sales phone, at 1440/1024/390 px in PL/EN/DE.
  - **Section height:**
    - 1440 px 524 → 632;
    - 1024 px 525 → 598 (DE 498 → 625);
    - 768 px 634 → 727;
    - 390 px 755 → 977 (EN 728 → 922, DE 755 → 949).
  - Before/after section screenshots and full-page home screenshots (1440 and 390 px) reviewed for the rhythm.
- **Security notes:** markup and CSS only; three static SVG files; no script, dependency or CSP change.
- **Open issues / next steps:**
  - The user's review.
  - The desktop card height relies on its content staying within about 35 px of the left column; check it when the texts change.
  - A11Y-001 (focus ring on dark surfaces) remains for before production.

## 2026-10-11: UX-IA-001 stage 1.2 — GmbH line removed, board aligned

- **Task (as requested by the user):** the user accepted the direction of stage 1.2 and asked for one final correction.
  - **Remove** only the repeated MCKEEN-BEEF SO GmbH line under "Rynki i zakłady", exactly:
    - PL "Sprzedaż: MCKEEN-BEEF SO GmbH, Oelde (Niemcy)";
    - EN "Sales: MCKEEN-BEEF SO GmbH, Oelde (Germany)";
    - DE "Vertrieb: MCKEEN-BEEF SO GmbH, Oelde".

    The company must stay in the main sales panel and in the sites ledger.
  - **Then fix** only the necessary spacing and alignment of the joined board, especially DE at 1440 px: no large empty areas, but no artificially stretched elements either.
  - **Keep** all other information, contacts, links, photos and the current style.
  - **Verify:** 390/768/1024/1440 px in PL/EN/DE, before and after, no fact lost. Git checks first, uncommitted changes kept, relevant tests and `git diff --check`, STATUS and this log.
  - **Do not** change the global focus contrast now; record it as a separate accessibility task before production.
  - No commit, push, merge or deployment; short report, then stop.
- **Goal:** one mention of the sales company fewer, with a board that ends cleanly in every language.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Done:**
  - **Text:** removed `<p className="note">{h.exportSales}</p>` from `src/app/[locale]/page.tsx` (its comment updated). Removed the `exportSales` key from `pl.ts`, `en.ts` and `de.ts`; it had no other use.
  - **Spacing:** the unused `.logistics__markets .note` rule is gone. The card's gap grew from 0.75 to 1.5rem, so the "Rynki i zakłady" heading keeps a clear distance from the ledger's tags now that the line between them is gone.
  - **Alignment from 64rem:**
    - The DE panel's natural height is 27–55 px above PL/EN (longer text), and at some widths the EN card is up to 31 px taller. With any fixed rise into the photo, one language kept up to 42–44 px unused; with the previous 6rem, the DE card kept up to 60 px.
    - The panel now keeps its own height and stands on the card's bottom line (`align-self: end`). It rises into the photo by as much as it is taller than the card: PL/EN 70–115 px, DE 116–156 px at 1024–1920 px.
    - The rise is capped by `--board-lift-max: 10rem`, which replaces `--board-lift: 6rem`.
    - The flex column and the link's `margin-top: auto` from stage 1.2 were no longer needed and were removed.
- **Files changed:** `src/app/[locale]/page.tsx`, `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts`, `src/styles/art.css`, `docs/STATUS.md`, `docs/architecture.md`, `docs/content-source-map.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge, local production build; the dev server on port 5000 was not running):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:home` 7/7, `test:nav` 16/16, `test:certs` 4/4, `test:totop` 8/8.
  - **Content (PL/EN/DE × 390/768/1024/1440 px, 12 variants):** the only text gone is the approved line (27 → 26 texts). Every other text, the 4 links and the photo's alt text are identical in DOM order. No horizontal overflow.
  - **Facts kept:**
    - the panel still says "Sprzedaż prowadzi MCKEEN-BEEF SO GmbH w Oelde w Niemczech", "Sales are handled by MCKEEN-BEEF SO GmbH in Oelde, Germany" and "Den Vertrieb übernimmt die MCKEEN-BEEF SO GmbH in Oelde";
    - the ledger keeps "Oelde (Niemcy) — Sprzedaż", "Oelde (Germany) — Sales" and "Oelde — Vertrieb".
  - **Alignment:** from 64rem both pieces end on one line (0 px difference) with no unused space in either. Before this change, at 1440 px DE the card had 26 px unused; at 1024 px PL/EN there were 39 px unused above the link.
    - Rise at 1024 px: PL/EN 89, DE 116 px.
    - Rise at 1440 px: PL/EN 100, DE 154 px.
  - **Section height:**
    - 390 px 1721 → 1665 (EN 1697 → 1665, DE 1751 → 1719);
    - 768 px 1295 → 1263 (DE 1322 → 1290);
    - 1024 px 1096 → 1064;
    - 1440 px 1290 → 1258 (DE 1316 → 1258).
  - **Keyboard** (1440/1024/390 px): phone, phone, e-mail, Sprzedaż i eksport, then the next section; the focus ring is visible.
  - **Structure:** headings H2 > H3 > 2 × H4; the ledger on Sprzedaż i eksport keeps its card.
  - Before/after screenshots reviewed and supplied.
- **Security notes:** no script, dependency or CSP change; one text removed with the user's consent.
- **Open issues / next steps:**
  - **A11Y-001**, to be done before production: the global focus ring has 2.96:1 contrast on the maroon panel (STATUS Known issues 12). Not changed now.
  - The alignment assumes the panel stays taller than the card; check it when markets or sites are added.
  - The environment section is to be refined separately, after approval.

## 2026-10-11: UX-IA-001 stage 1.2 — Sales, markets and sites refinement

- **Task (as requested by the user):** the user accepted the direction of stage 1.1 (chain not to be changed again) and asked for a premium refinement of only the merged section "Sprzedaż w Polsce i za granicą" + "Rynki i zakłady".
  - **Keep:** the truck photo, all contact data, the full markets and sites ledger; remove no information.
  - **Goals:**
    - panel and ledger as one visual system;
    - a natural transition photo → contact panel → information;
    - no large accidental empty areas on desktop;
    - on phones: message, contact, then markets and locations;
    - no new huge section;
    - existing typography, materials, embroidery and colours;
    - no new unconfirmed export, logistics or scale facts.
  - **GmbH line:** check whether the repeated MCKEEN-BEEF SO GmbH information disturbs visually. Do not remove it; if a change is suggested, show exactly what would be removed and why.
  - **Process:** check desktop and mobile, propose the smallest effective composition change, implement only that.
  - **Verification:** 390/768/1024/1440 px, PL/EN/DE, before/after and the whole composition, texts/contacts/links kept, overflow, accessibility, lint, TypeScript, tests, build, `git diff --check`, STATUS, this log and the relevant docs. Git checks first; no commit, push, merge or deployment; report and stop. The environment section is out of scope.
- **Goal:** the same content as one composed board that ends cleanly on every width.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Findings before the change (local production build):**
  - From 64rem the panel rose 16rem into the photo while markets and sites (heading and note above a separate cream ledger card) started 2rem lower on the left. Both ended at different heights: 266 px of empty paper under the panel at 1024 px and 287 px at 1440 px.
  - The dark panel and the light card read as two unrelated objects.
  - At 768 px the panel (34rem) was narrower than the ledger below it.
- **Done (CSS only, `src/styles/art.css`, the `.logistics` block; markup, texts and links unchanged):**
  - **One sewn board.** The dark panel and a light card are joined without a gap, square where they meet and rounded outside, each with its own running stitch. The card holds the "Rynki i zakłady" heading, the GmbH line and the ledger.
    - The ledger's own card styling is dropped inside `.logistics` only; on Sprzedaż i eksport it is unchanged.
    - The panel's contacts are ruled rows like the ledger rows (`--on-dark-rule`).
  - **Below 64rem:** the panel at full container width overlaps the photo by 3rem as before, and the card is sewn on directly below.
  - **From 64rem:**
    - The card sits on the left from the photo's lower edge, so the "MC KEEN-BEEF" lettering on the trailer stays clear. The panel on the right rises 6rem (`--board-lift`) into the photo, over the road.
    - Both pieces end on one line. The panel is a flex column with its link on that line.
    - Contact rows get 0.5rem padding.
    - The lift and the padding were chosen by measuring five variants in PL/EN/DE at 1024/1180/1280/1440/1920 px (injected CSS, then built).
    - A first built version without ruled rows left 104–114 px above the link at 1440/1024 px (80–90 px of it unused); this was rejected.
- **GmbH line (assessed, kept, not removed):**
  - **Where it appears:** three times in the board.
    1. The panel text (`home.salesText`), for example PL "Sprzedaż prowadzi MCKEEN-BEEF SO GmbH w Oelde w Niemczech. …".
    2. The note under "Rynki i zakłady" (`home.exportSales`).
    3. The sites ledger row "Oelde (Niemcy) — Sprzedaż".
  - **Effect:** from 64rem items 1 and 2 now stand side by side at almost the same height. On phones item 2 follows the panel directly. It reads as an echo, though the note is small and muted.
  - **Possible removal, not applied, needs the user's consent:** remove only item 2:
    - PL `Sprzedaż: MCKEEN-BEEF SO GmbH, Oelde (Niemcy)`;
    - EN `Sales: MCKEEN-BEEF SO GmbH, Oelde (Germany)`;
    - DE `Vertrieb: MCKEEN-BEEF SO GmbH, Oelde`.

    This means the `<p className="note">` in `page.tsx` and the unused `exportSales` key in the three dictionaries.
  - **Why:** every fact in it stays on the page. Company, town and country are in the panel text (DE text: company and town; the DE note has no country either), and the location stays in the ledger row.
  - **Simulated effect** (note hidden in the browser, nothing removed):
    - phones and tablets 44–68 px shorter;
    - 1024 px 12–39 px shorter;
    - 1440 px PL/EN 28 px shorter;
    - 1440 px DE unchanged in height, but the card would have 70 px to spare at its foot. The lift would then need re-tuning.
- **Files changed:** `src/styles/art.css`, `docs/architecture.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge, local production build; the dev server on port 5000 was not running):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:home` 7/7 (incl. the sales composition check), `test:nav` 16/16, `test:certs` 4/4, `test:totop` 8/8.
  - **Section content:** 27 texts, 4 links (two phones, e-mail, Sprzedaż i eksport) and the photo's alt text identical in DOM order in PL/EN/DE at 390/768/1024/1440 px (12 variants); no horizontal overflow.
  - **Height:**
    - 390 px 1702 → 1721 (PL: the GmbH line wraps inside the card; EN/DE −5);
    - 768 px 1324 → 1295;
    - 1024 px 1112 → 1096;
    - 1440 px 1338 → 1290 (DE 1316).
  - **Free space from 64rem:** 24–82 px above the panel link, including the list's 24 px margin; 0–28 px at the card's foot (DE, where the panel is the taller piece).
  - **Keyboard** (1440/1024/390 px): Tab order phone, phone, e-mail, Sprzedaż i eksport, then the next section; the focus ring is visible.
  - **Structure:** headings unchanged (H2 > H3 > 2 × H4); the ledger on Sprzedaż i eksport keeps its card.
  - Before/after screenshots at all four widths reviewed and supplied.
  - `git diff --check` clean.
- **Security notes:** CSS only; no script, dependency or CSP change.
- **Open issues / next steps:**
  - The user's review, and the decision on the GmbH line.
  - The global focus ring has 2.96:1 contrast on the maroon panel (pre-existing; STATUS Known issues 12).
  - The environment section is to be refined separately, after approval.

## 2026-10-11: UX-IA-001 stage 1.1 — Production chain refinement

- **Task (as requested by the user):** the user accepted the new home flow and asked to refine only the section "Jedna grupa, cały proces".
  - **Problems named:** on desktop the seven steps are very dense and the icons, descriptions and new links compete; on mobile the steps form one very long vertical run where orientation gets lost.
  - **Goal:** a premium, professional presentation of a large group's production process: clear, elegant, easy to scan, Premium Crafted Ranch, readable on phones, information-rich, linked to Zakłady.
  - **Requirements:**
    - keep all 7 steps in order, 100% of the information and all approved links;
    - no accordions;
    - better hierarchy of number, icon, name, description and links;
    - less density on desktop without smaller text;
    - better vertical rhythm and alignment on mobile;
    - links readable but not dominant;
    - keep the embroidered cattle motif, photos, colours and character;
    - no generic SaaS cards or decorations;
    - no longer section without a real readability gain.
  - **Process:** check the current layout, propose the smallest effective fix, then implement it in this section only.
  - **Verification:** Git checks first; 390/768/1024/1440 px; before/after screenshots; PL/EN/DE, keyboard, overflow, project tests, lint, build, `git diff --check`; STATUS and this log. No commit, push, merge or deployment; report and stop. The sales and environment sections are for later.
- **Goal:** the same content, presented so it can be scanned at every width.
- **Branch / commit:** `codex/3d-drum-navbar`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Findings before the change:**
  - At 1024 px the seven columns were about 124 px wide, so descriptions ran 6–7 lines of 15 characters.
  - At 1440 px (159 px columns) the EN/DE descriptions started on 2 lines and the links on 4.
  - At 390 and 768 px every step stacked marker, badge, title, text and links on separate rows (2332 / 2108 px section).
  - At 768 px the two "Ubój" links ran together.
- **Done (CSS only, `src/styles/pages.css`, the `.chain__steps` block; markup, texts and links unchanged):**
  - **Below 64rem: a vertical timeline.**
    - A beef-red thread runs through the horn markers, one segment per step masked by the markers.
    - The number tag, the icon (2.6 → 2.2rem) and the title share one row; the text (max 40rem) and links are indented under the tag.
  - **From 64rem: two rows on horizontal threads.**
    - Steps 1–4 run from the animal to the product, steps 5–7 to the customer.
    - Each step is a five-row subgrid, so titles, texts and links line up per row in every language.
    - The "Zakłady i spółki grupy" button sits in the free fourth cell of the second row, bottom-aligned with its links.
  - **Links are quieter:** a warm light tone with a fine coral underline and a coral arrow (full coral on hover).
    - With a fine pointer from 64rem they are about 30 px high instead of 44 px, so a two-link step does not stretch its row.
    - The arrow never wraps onto a line of its own.
  - **Reveal:** the thread segments draw in with the steps' reveal (staggered); no animation under reduced motion.
  - **Cleanup:** the unused `chain-draw` keyframes were removed.
- **Files changed:** `src/styles/pages.css`, `docs/architecture.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge, local production build; the dev server on port 5000 was not running):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:home` 7/7 (incl. the chain links check), `test:nav` 16/16, `test:totop` 8/8, `test:certs` 4/4.
  - **Section content:** 34 texts and 7 links identical in DOM order in PL/EN/DE at 390/768/1024/1440 px (12 variants); no horizontal overflow.
  - **Alignment:** per row, titles, texts and links share one line in every language.
  - **Height:**
    - 390 px 2332 → 1905;
    - 768 px 2108 → 1634;
    - 1024 px 1051 → 1189;
    - 1440 px 1081 → 1255.

    A first two-row version was 1307 / 1373 px on desktop; the link height and the button placement brought it down.
  - **Keyboard:** the Tab order follows the steps and ends with the plants button; the focus ring is visible.
  - **Motion:** with motion allowed, every thread and step ends fully drawn.
  - Before/after screenshots at all four widths reviewed and supplied.
  - `git diff --check` clean.
- **Security notes:** CSS only; no script, dependency or CSP change.
- **Open issues / next steps:**
  - The user's review.
  - The plants button's position assumes seven steps in four columns; adding a step needs a layout check.
  - The sales and environment sections are to be refined separately, after approval.

## 2026-10-11: UX-IA-001 stage 1 — Home page flow

- **Task (as requested by the user):** implement only stage 1 of UX-IA-001 (the home page), with one change to the proposal.
  - Approved order: Hero → trust proof → Asortyment → process → quality → environment → sales and markets → contact.
  - Merge "Sprzedaż w Polsce i za granicą" and "Rynki i zakłady" into one coherent composition, not two old blocks stacked, keeping all information.
  - Add contextual links in the production chain. No "Od 2009 roku" band; no "Historia" link for now. Remove or shorten nothing valuable.
  - The closing block becomes "Kontakt i współpraca" with a strong natural heading (e.g. "Porozmawiajmy o współpracy"), containing:
    - the buyers' main path with "Zapytaj o ofertę";
    - secondary paths: cattle purchasing, supplies, quality/audit, careers;
    - access to the full directory.
    It uses existing routes, forms, the router and confirmed texts, repeats no contact data shown directly above, and is elegant, Premium Crafted Ranch and not oversized.
  - Overriding rule: natural transitions and a good visual rhythm across the whole page, keeping the impression of scale.
  - Constraints: do not change other pages, hero, navigation or trust proof. Git checks first; feature branch; minimal changes. Compare all content before and after in PL/EN/DE, check links and anchors, take desktop and mobile screenshots, assess the whole page's rhythm, run tests, lint, TypeScript, build and `git diff --check`, update docs. No commit, push, merge or deployment; report and stop.
- **Goal:** a home page that leads from interest through offer, process and proof to the right contact, with nothing lost.
- **Branch / commit:** `codex/3d-drum-navbar` (the feature branch holding all uncommitted work; not main/dev), 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Done:**
  - **Order (`src/app/[locale]/page.tsx`):** the environment section moved above sales.
  - **Sales composition:** "Rynki i zakłady" was folded into the sales section. Its heading is now an H3 and the ledger titles H4; the GmbH line is kept. From 64rem the panel overlaps the truck photo on the right and markets and sites sit beside it, starting at the photo's edge; on narrower screens they follow the panel. The unused `.export` styles were removed.
  - **Chain (`ProductionChain.tsx`):**
    - steps link to where they are described, using existing labels and the anchors present in all languages: "Sprzedaję bydło" → contact topic, both slaughterhouses, the cutting plant, the freezer section, the GmbH card;
    - packing and transport have no link;
    - a ghost button "Zakłady i spółki grupy" sits under the steps;
    - the links use the eyebrow's light coral on the dark felt, at least 44 px high, with an arrow that never wraps alone.
  - **Contact and cooperation (`.coop`):**
    - one sewn board in the card cloth: the buyer's side (beef-red edge, handshake icon, router label and hint, the enquiry CTA, modal with JavaScript);
    - a seam, then the router's topics as ruled rows with embroidered icons: cattle, supplies, quality/audit, careers; then "Wszystkie działy";
    - no phone or e-mail repeated.
    - A first version with five separate cards was 746 px (desktop) and 1175 px (phone) high; the board is 726 / 998 px.
  - **New copy (PL/EN/DE):** only `home.coopEyebrow` and `home.coopTitle`.
  - **Test:** `tests/home-browser.mjs` gained the check "home flow in PL/EN/DE".
  - **Docs:** STATUS (completed, verification, in progress), `architecture.md` §10 "Home page flow", `content-source-map.md` (home), README (`test:home`).
- **Files changed:** `src/app/[locale]/page.tsx`, `src/components/sections/ProductionChain.tsx`, `src/styles/art.css`, `src/styles/pages.css`, `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts`, `tests/home-browser.mjs`, `README.md`, `docs/architecture.md`, `docs/content-source-map.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge, local production build; the dev server on port 5000 was not running):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:home` 7/7 (including the new home flow check), `test:nav` 16/16, `test:totop` 8/8 (2 min 21 s), `test:certs` 4/4.
  - **Content check**, `/`, `/en`, `/de` at 1440 and 390 px, every text node and link in `<main>` before and after:
    - 0 removed texts, 0 texts no longer visible, 0 removed links;
    - +22 texts and +13 links per variant, exactly the planned additions (146 → 168 texts, 20 → 33 links).
  - **Links:** all 75 link targets answer 200, and every #anchor exists in PL/EN/DE.
  - **Height:** PL desktop 7060 → 7810 px, phone 10 254 → 11 553 px.
  - **Screenshots:** full-page before/after at 1440 and 390 px, and close-ups of the three changed sections, reviewed for the whole page's rhythm.
  - `git diff --check` clean.
- **Security notes:** no new dependency, no script, no CSP change. Links only to existing internal routes; the enquiry CTA uses the existing dialog and form.
- **Open issues / next steps:**
  - The user's review.
  - The duplicated GmbH line in the sales section stays until decided.
  - "Sprzedaję bydło" now appears twice, in the chain and in the contact board; this is intentional and leads to the same topic.
  - Other pages unchanged; the next stage needs separate approval.

## 2026-10-11: UX-IA-001 — Decisions on the plan and stage 1 proposal for the home page (read-only)

- **Task (as requested by the user):** the user accepted the general direction of UX-IA-001 but not the whole plan for implementation, and set decisions 1–8 (recorded in `docs/STATUS.md`, "In progress").
  - Explain the difference between the 42 pages of the gap audit and the 39 pages of UX-IA-001, and make sure no significant route or language version was left out.
  - Before any implementation, show stage 1 (home page flow) exactly: current order, proposed order, what moves or merges, which information is kept, how the links to related pages look, and whether anything is hidden or shortened.
  - No code changes for UX-IA-001; after approval implement only stage 1, with a before/after comparison and a content completeness check. No commit, push, merge or deployment.
- **Goal:** an exact, reviewable stage 1 proposal, and the user's decisions recorded for later sessions.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Done:**
  - **42 vs 39:** `src/i18n/routes.ts` has 14 route keys, each with PL/EN/DE slugs: 42 pages, as crawled in the gap audit. UX-IA-001 analysed the 13 content routes (39 pages) and left out only the form result page `sent` (`/wyslano`, `/en/sent`, `/de/gesendet`). That page is the 303 target of the forms without JavaScript: `noindex`, not in the sitemap or the navigation, with only a status message, fallback contacts and back links (its message is GAP-14). Neither count includes 404 pages, the 117 legacy redirect URLs, API routes, the sitemap, robots or the icon.
  - **Stage 1 proposal for the home page, presented in chat** (exact PL/EN/DE texts taken from the dictionaries and content files):
    - hero, trust strip, Asortyment and quality sections unchanged;
    - the chain keeps its texts and gets one link per step, built from existing labels and anchors that exist in all languages, plus the plant list moved from "Rynki i zakłady" and a link to Zakłady;
    - the environment section moves above sales;
    - the markets list moves into the sales section;
    - a contextual block for the other audiences ends the page, using the contact router's existing labels.
  - **Removals:** none applied. The dissolved section heading and one duplicated line are shown with their exact texts as separate decisions.
  - **"Od 2009 roku" band:** compared with the trust strip. Not proposed: "2009" and Lisków already appear on the home page in the trust strip, the chain eyebrow and the chain patch, and 2012/2013 in chain step 5. A single link to the history is offered as the alternative.
  - **Docs:** STATUS ("In progress" with decisions 1–7; next steps), this log.
- **Files changed:** `docs/STATUS.md`, this log.
- **Tests and results:** none required; read-only analysis of source files and of the page outline measured earlier the same day.
- **Security notes:** none; read-only.
- **Open issues / next steps:** the user's approval of the stage 1 proposal, and the decisions on the heading "Rynki i zakłady", the duplicated GmbH line and the optional history link. Then implement stage 1 only.

## 2026-10-11: UX-IA-001 — Reorganisation proposal for content, structure and flow (read-only)

- **Task (as requested by the user):** "UX-IA-001 – Kompleksowe uporządkowanie treści, struktury i flow całej witryny McKeen Beef", with the addendum "skala firmy i zachowanie pełnej treści".
  - Analyse the audiences (B2B buyers, foreign buyers, purchasing and quality departments, cattle and raw-material suppliers, candidates): why they come, what they look for first, the shortest path, what convinces them, the target action.
  - Audit all pages in PL/EN/DE by their real sections with 10 questions per page.
  - Propose the home page flow (interest → offer → how we work → why trust us → contact) without changing the hero video, H1, CTA and trust proof.
  - Define the logic of each page, one section system (consistent but not monotonous), navigation and findability, and copywriting rules.
  - Use the eight original audit documents (01, 02, 03, 06 named), the gap audit and the repository docs; report missing documents instead of assuming their content; do not undo closed GAPs.
  - Deliver for each page: current and proposed order; what to keep, move, merge, shorten, remove (only if truly redundant) and complete; CTA placement; links to other pages. Add a content-preservation mapping per page.
  - Content preservation first: nothing valuable may disappear; any removal of valuable information needs the user's separate consent. No invented figures.
  - Split the later implementation into small, testable stages.
  - Constraints: no code changes for UX-IA-001, no large refactors, keep uncommitted changes, no commit, push, merge or deployment; stop after presenting the plan and wait for approval. The planned back-to-top button was not to be implemented here (it already existed as UX-001).
- **Goal:** one coherent, information-rich corporate site that leads each audience from orientation to the right contact, by reorganising content instead of cutting it.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`, 0 ahead / 0 behind `origin/main` after `git fetch origin`; no commit.
- **Done:**
  - **Sources read:** the original research documents 00–07 were not in `../research`; local copies were found outside the repository (the user's Downloads folder) and 00, 01, 02, 03 and 06 were read. Also read: `STATUS.md`, `gap-audit-2026-10-10.md`, `content-source-map.md`, `client-confirmations.md`, all 13 page compositions and the PL dictionary.
  - **Measured:** all 39 pages on a local production build (the dev server on port 5000 was not running): sections, headings, words, links, CTAs, accordions, page heights at 1440 and 390 px, the surface tone of every section, header and footer navigation. EN and DE have the same structure as PL.
  - **Plan (Polish, for the user's review):** a private page at https://claude.ai/artifact/YZz6b7tXg9Aj2MYqvALYVC. Main proposals:
    - home: merge the two adjacent sales and markets sections, move plant locations into the integration chain and link its steps, add an "Inne sprawy" entry for the other audiences, an optional "Od 2009 roku" band;
    - a "Co dalej" closing block on every page (five pages end without a next step today);
    - Jakość: certificates right after the quality system;
    - Sprzedaż i eksport: sales contact at the top;
    - Certyfikaty: a status overview of all three plants;
    - Zakłady: group structure as a diagram and links to departments;
    - O firmie: a factual lead and a heading for the first section;
    - Kontakt: a lead;
    - footer order aligned with the header;
    - in-page navigation on Jakość, Certyfikaty and the privacy policy.
  - **Content preservation:** a mapping table per page. Eight proposed removals, all literal repetitions, filler sentences or one decorative photo, each with the reason and what remains; each needs separate consent. No company, contact, historical, certification or legal data is proposed for removal.
  - **Scale:** shown only with facts already on the site (5 companies, 3 plants with a veterinary number, a 7-step chain, 37 directory entries, 61 certificate documents since 2019, history since 2009). No new figures.
  - **Other parts of the plan:** the client confirmations each addition depends on, and 12 implementation stages with tests.
- **Files changed:** `docs/STATUS.md` (in progress, next steps), this log. No code for UX-IA-001; the plan page lives outside the repository. The approved version will be recorded in `docs/` after approval.
- **Tests and results:** none required for a read-only proposal. The measurement scripts (read-only, outside the repository) ran without errors on all 39 pages. Lint, tests and build of the final working tree: see the next entry.
- **Security notes:** read-only; no form was submitted. The plan page is private; it contains only information that is already public on the site.
- **Open issues / next steps:** the user's decisions (the list in the plan); then stage 0: record the approved plan in `docs/` and implement stage by stage, each with a text diff showing that nothing disappeared beyond the approved items.

## 2026-10-11: UX-001 follow-up — Larger back-to-top tag

- **Task (as requested by the user):** "Dodatkowa poprawka – zwiększ przycisk „Powrót na górę”".
  - Make it somewhat larger, more noticeable and easier to tap on desktop and mobile.
  - Keep it premium and consistent with the identity (cattle ear tag, embroidered arrow), never dominant over the main CTAs.
  - Container, arrow, padding, shadow and shape readability may grow slightly; a slightly bigger, clearer tag, not a huge floating button.
- **Goal:** a clearly visible, practical tag that still does not compete with the red CTAs.
- **Branch / commit:** `codex/3d-drum-navbar`; no commit.
- **Done (`src/components/ui/BackToTop.module.css`):**
  - **Size:** phones 48×56 → 54×62 px; desktop 52×60 → 58×68 px.
  - **Arrow:** 1.35 → 1.6rem; desktop 1.45 → 1.75rem.
  - **Hole and stitch:** the punched hole grows slightly; the stitch sits 5 px inside the edge on desktop.
  - **Padding and shadow:** top padding follows the size. A 1 px brown edge in the shadow keeps the silhouette readable on the cream paper, with a slightly deeper cast shadow (also on hover).
  - **Behaviour unchanged.** At the end of a page on phones it now rises 112 px (before 48 px) to clear the footer links.
  - **Test:** `tests/to-top-browser.mjs` prints the measured phone size instead of a fixed "48×56".
  - **Docs:** `architecture.md` §10 and `STATUS.md` (UX-001 section and verification).
- **Files changed:** `src/components/ui/BackToTop.module.css`, `tests/to-top-browser.mjs`, `docs/architecture.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge; the Codex runtime folder changed, so the new `PLAYWRIGHT_MODULE` path was used):**
  - `npm run lint` and `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed (the built CSS contains the new size).
  - Local production build: `npm run test:totop` 8/8 (2 min 22 s, phone tag 54×62 px), `npm run test:home` 6/6, `npm run test:certs` 4/4, `npm run test:nav` 16/16. The dev server on port 5000 was not running, so `test:nav` ran on the production build.
  - **Behaviour measurement** (13 PL pages × 1440/1024/390 px):
    - no overlap with page controls or footer content; hidden at the top; available and clear at the end everywhere;
    - shown share past 600 px slightly lower on link-dense pages: Kontakt 24 % at 1024 px (was 38 %) and 7 % at 390 px (was 9 %).
  - Before/after screenshots at 1440 and 390 px (rest, hover, focus, end of page) reviewed and supplied.
  - `git diff --check` clean.
- **Security notes:** CSS only; no new dependency, no CSP change.
- **Open issues / next steps:**
  - On link-dense pages the larger tag is shown a little less often, because it never covers links.
  - On phones it can briefly cover the end of a plain text line while scrolling, as any floating button does.

## 2026-10-11: UX-001 — Back to top ear tag on every page

- **Task (as requested by the user):** "UX – Premium Back to Top na wszystkich podstronach McKeen Beef": a global floating "Powrót na górę" control in the Premium Crafted Ranch style.
  - Look: cream textured material shaped like a cattle ear tag, stitched edge, soft 3D shadow, red embroidered up arrow, subtle relief, a slight lift on hover. Not a generic circle, and not larger or louder than the main CTAs.
  - Behaviour: every page in PL/EN/DE, bottom right; hidden at the top, shown smoothly after about 500–700 px; a click scrolls smoothly to the top, instantly under `prefers-reduced-motion`; hidden again at the top; at least 44×44 px on phones; respects `safe-area-inset`; never covers forms, CTAs, the footer or important UI.
  - Architecture: one lightweight global component with the existing CSS/React, no libraries; keyboard accessible with visible focus and PL/EN/DE labels; sensible without JavaScript if possible. Navbar mechanics, hero, content and other elements unchanged.
  - Verification: home and all main pages, PL/EN/DE, desktop and mobile, appearing/disappearing, scroll to top, reduced motion, keyboard/focus, no collisions with forms/CTAs.
  - First `git fetch origin`, `git branch --show-current`, `git status`, and a check of existing components, styles and the tracker to avoid duplicates. Afterwards tests, lint, build, `git diff --check`; update STATUS, this log and the other relevant docs.
  - Constraints: keep all uncommitted changes, not on main/dev; no commit, push, merge or deployment; show the result on desktop and mobile, then stop.
- **Goal:** a way back to the top on long pages that matches the crafted identity and never gets in the way.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`, 0 ahead / 0 behind `origin/main` after `git fetch origin` (checked at the start and again at the end); no commit.
- **Done:**
  - **Before:** no back-to-top control, `#top` link or `toTop` label existed in the code, the styles or the trackers (STATUS, gap audit).
  - **`components/ui/BackToTop.tsx`** (client island) and **`BackToTop.module.css`**, rendered once at the end of `<main>` by `[locale]/layout.tsx`:
    - **Look:** a cream felt ear tag (the crafted layer's grain and felt tokens, punched hole, dashed stitch inside the edge, soft shadow) with the up arrow in red satin thread, like the embroidered icons. Fixed bottom right with safe-area insets; 48×56 px on phones, 52×60 px from 64rem; `z-index: 30`, under the header, the mobile menu and dialogs.
    - **Visibility:** shown after 600 px, never over a link, control, label or form in `<main>` nor over the footer's text, links and marks. It hides at once and reappears after 250 ms of clear position. At the end of the page it rises in 16 px steps (up to 128 px) to a clear spot. Checks run per frame on scroll, on resize and on `ResizeObserver` changes; unrendered content (closed `<details>`) is skipped. Hidden while a form field has focus (CSS `:has`).
    - **Activation:** smooth scroll to the top, instant under reduced motion, no hash. Keyboard activation moves focus to the header wordmark.
    - **Without JavaScript:** a plain `#top` link. Where scroll-driven animations and `timeline-scope` exist, CSS shows it after 520–640 px and hides it as soon as the footer starts to enter the viewport (a view timeline on the footer, shared through the body). It stays hidden on pages with a form in `<main>` and wherever these features are missing. Mid-page it can lie over a link while scrolling, since no collision check is possible. Hidden in print.
  - **Labels:** `a11y.toTop` "Powrót na górę" / "Back to top" / "Zurück nach oben".
  - **Icon:** `public/craft/icons/arrow-up.svg`, drawn in this repository.
  - **Iterations during verification:**
    - A first version (a sticky rail inside `<main>`) ended under the header or off-screen at the page end, because the footer is 832–1173 px tall. It was replaced by the fixed tag with collision avoidance and the end-of-page lift.
    - Link-dense pages made it blink. Fixed with the 250 ms settle delay.
    - Content moving without scrolling was missed. Fixed with `ResizeObserver`.
    - Point sampling missed small links. Fixed by checking line boxes.
    - Closed `<details>` content counted as an obstacle. Fixed with `checkVisibility()`.
    - The show/hide transform skewed the measured box. Fixed by computing the box from layout.
    - The PL label was first "Wróć na górę strony" and was changed to the requested "Powrót na górę".
    - The first no-JavaScript fallback was hidden only over the last 200–260 px of the page. Without a collision check it could therefore lie over the enquiry form fields and over footer rows above that stretch. It now hides when the footer starts to enter the viewport and on pages with a form.
  - **Test:** `tests/to-top-browser.mjs` (`npm run test:totop`, same runtime and variables as `test:nav`). Docs: architecture §2 and §10 "Back to top", README scripts table, asset map (icon), STATUS (Completed, verification, known issue 8 browser coverage).
- **Files changed:** `src/components/ui/BackToTop.tsx` (new), `src/components/ui/BackToTop.module.css` (new), `public/craft/icons/arrow-up.svg` (new), `src/app/[locale]/layout.tsx`, `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts`, `tests/to-top-browser.mjs` (new), `package.json`, `README.md`, `docs/architecture.md`, `docs/asset-map.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-11, Node v24.16.0, bundled Playwright + Edge):**
  - Final state, after the no-JavaScript change: `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed. Local production build: `npm run test:totop` 8/8 sections (2 min 18 s), `npm run test:home` 6/6, `npm run test:certs` 4/4. Dev server: `npm run test:nav` 16/16.
  - The same checks, all passed, also ran once before the no-JavaScript change (`test:totop` 2 min 24 s).
  - Without JavaScript (dev server, final CSS; 8 pages incl. EN/DE at 1440 and 390 px, with and without reduced motion, 40 px steps): hidden at the top, shown from 560 px until the footer starts to enter, never over footer content, hidden on Zapytaj o ofertę and Kariera; the link reaches the top. Restoring the previous animation inline makes both new no-JavaScript checks of `test:totop` fail, as intended.
  - `test:totop` on the dev server: sections 1–6 passed, then section 7 hung. It awaited a page timer with JavaScript disabled, which never fires. Fixed in the test (it now waits outside the page), not in the component.
  - Fault injection of the test's overlap detector: the tag was forced visible at the 30 positions where the component had hidden it (Kontakt and the privacy policy at 390 px, Zapytaj o ofertę at 1024 px). 27 were reported as overlaps; 3 were near misses inside the component's 6 px margin.
  - Behaviour measurement (before the no-JavaScript change, which only touches the no-JavaScript rules), 13 PL pages × 1440/1024/390 px on the production build: no overlap with page controls or footer content, hidden at the top, available at the end everywhere. Shown share past 600 px in STATUS ("UX-001 behaviour check"); lowest on Kontakt at 390 px (9 %).
  - Screenshots at 1440 and 390 px (rest, hover, keyboard focus, end of page; production build, JavaScript on) reviewed and supplied to the user.
  - `git diff --check` clean.
- **Security notes:** no new dependency, no inline script and no CSP change. The only runtime style write is the `--lift` custom property via the CSSOM. The icon is a same-origin static file. No form is submitted; the tests only focus a field.
- **Open issues / next steps:**
  - The user's visual review (screenshots supplied).
  - On link-dense pages the tag shows over a smaller part of the page, by design (it never covers links): on phones Kontakt 9 %, privacy policy 17 %. If it should be available more often there, it would have to cover some links or get a reserved margin; that is a design decision for the user.
  - Not tested: Firefox and Safari (without JavaScript the tag stays hidden there if scroll-driven animations are missing), real phones with notches, screen readers.

## 2026-10-10: GAP-08 — Own validity date for every certificate on product cards

- **Task (as requested by the user):** GAP-08. Every certificate on the product cards shows its own correct validity date. Per the source documents: BRCGS Food Safety Issue 9, AA+, CP Lisków, valid until 27.04.2027; IFS Food v8, Higher Level 98,60 %, CP Lisków, valid until 12.05.2027.
  - First:
    1. Run `git fetch origin`, `git branch --show-current` and `git status`.
    2. Read STATUS, this log and the gap audit.
    3. Check `ProductGroups.tsx` and the central certificate data.
    4. Keep uncommitted changes and work on the feature branch.
  - Requirements:
    - Correct the dates, taken from the central data without duplication, and keep the CP Lisków attribution.
    - Do not suggest that all plants are covered, and never show an expired certificate as current.
    - Check PL/EN/DE and the other places using these data.
    - Keep the Premium Crafted Ranch design and leave unrelated components unchanged.
  - Verification: both dates on the product cards, against the original PDFs; 390/1440 px; lint, TypeScript, tests, build, `git diff --check`; update STATUS, this log and the relevant documentation. Mark GAP-08 Done only after the tests pass.
  - Constraints: no commit, push, merge or deployment; report and stop.
- **Goal:** each certificate on a product card carries its own validity and its plant.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`, after `git fetch origin` (0 ahead / 0 behind `origin/main`) and branch/status checks; no commit.
- **Done:**
  - **Cause:** `ProductGroups.tsx` listed the certificates in one line and printed `certs[0].expiresOn` (BRCGS, 27.04.2027) for both, with the plant hard-coded as `entityById('cp').role`.
  - **Other uses of `expiresOn` checked, already per certificate:** the home trust strip, `CertificateStatus`, /zaklady, `CertificateArchive`.
  - **Change (`ProductGroups.tsx`):** the "Certyfikaty" row groups the product's current certificates by their plant. Each certificate gets its own line ("BRCGS Food Safety AA+, ważny do 27.04.2027" / "IFS Food 98,60%, ważny do 12.05.2027"), then the plant's place ("Zakład rozbioru, Lisków") as the existing small source line.
  - **Data:** taken from `certificates.ts` (`currentCertificates()`, `expiresOn`, `entity`), nothing duplicated. Only current certificates appear, so an expired one drops out on its own.
  - **Layout:** `.specs__validity` (`sections.css`, `white-space: nowrap`) keeps "ważny do <date>" together, so phones break after the comma. Uses the existing `.plain` list; design unchanged.
  - **Docs:** `content-source-map.md` (Produkty row; the certificate table line now also lists Produkty, and its record count is corrected from 25 to the actual 22); STATUS (tracker: GAP-08 Done).
- **Files changed:** `src/components/products/ProductGroups.tsx`, `src/styles/sections.css`, `docs/content-source-map.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-10, Node v24.16.0, bundled Playwright + Edge):**
  - `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:certs` 4/4 and `npm run test:home` 6/6 (local production build). `npm run test:nav` 16/16 (dev).
  - Product card check (dev and production HTML, PL/EN/DE): Elementy and Mięsa drobne show 27.04.2027 (BRCGS) and 12.05.2027 (IFS) with the CP plant; Ćwierci and Podroby have no certificate row.
  - Dates confirmed in the six 2026 CP PDFs with `pdftotext`:
    - BRCGS PL "Data ważności certyfikatu: 27.04.2027", EN "Certificate expiry date: 27.04.2027", DE "Gültigkeitsdatum des Zertifikats: 27.04.2027";
    - IFS PL/EN "… 12.05.2027", DE "Zertifikatgültigkeit bis: 12.05.2027".
  - Edge at 375/390/1440 px: no overflow, no console errors.
  - `git diff --check` clean.
- **Security notes:** presentation only; no dependency, header or CSP change. The temporary production server was stopped.
- **Open issues / next steps:** the other gap audit findings one at a time, after the user's decision.

---

## 2026-10-10: GAP-05 — Jakość metadata scoped to the certified plant

- **Task (as requested by the user):** GAP-05. Correct the metadata of the Jakość page so that it no longer suggests the whole McKeen Beef group holds current BRCGS and IFS certificates. The confirmed certificates (BRCGS AA+, IFS Food Higher Level 98,60 %) belong to the MCKEEN-BEEF CP cutting plant in Lisków.
  - First:
    1. Run `git fetch origin`, `git branch --show-current` and `git status`.
    2. Read STATUS, this log and the gap audit.
    3. Review the Jakość metadata in PL/EN/DE and where it is used.
    4. Stay on the feature branch and keep all uncommitted changes.
  - Scope:
    - Correct the PL/EN/DE meta descriptions, clearly separating the group's quality system from the plant's certificates.
    - Do not change results, numbers or validity dates, and add no certification claims for other plants.
    - Check Open Graph and other related metadata, and change them only if they have the same problem.
    - Keep the SEO positioning and natural language in each translation. Leave appearance, hero, navigation and unrelated content unchanged.
  - Afterwards: check the generated metadata in PL/EN/DE; run relevant tests, lint, TypeScript, build and `git diff --check`; update STATUS, this log and the relevant documentation. Mark GAP-05 Done only after verification.
  - Constraints: no commit, push, merge or deployment; report and stop.
- **Goal:** search and share snippets of the quality page attribute IFS Food and BRCGS only to the certified plant.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`, after `git fetch origin` (0 ahead / 0 behind `origin/main`) and branch/status checks; no commit.
- **Done:**
  - **Metadata traced:** `quality.description` (pl/en/de dictionaries) is used only by `pageMetadata` for /jakosc. It is rendered as `<meta name="description">`, `og:description` and `twitter:description` (same string). In PL/EN/DE all three carried the group-wide wording ("System jakości grupy MCKEEN-BEEF: HACCP, GMP, GHP, IFS Food i BRCGS").
  - **Checked and left unchanged** (no group-wide implication):
    - title, `og:title` and image alt;
    - the share images (`public/og/quality-*.jpg`, text "Zakład rozbioru, Lisków" / "Cutting plant, Lisków" / "Zerlegebetrieb, Lisków", also used by /certyfikaty);
    - canonical, robots, the JSON-LD (no certification claims);
    - the /certyfikaty metadata, already scoped to MCKEEN-BEEF CP.

    The share images' missing validity date is GAP-09, not changed here.
  - **New descriptions:** the group's quality system (HACCP, GMP, GHP) comes first, then BRCGS and IFS Food as certificates of the cutting plant in Lisków, then sourcing, welfare and environment as topics:
    - PL: "System jakości grupy MCKEEN-BEEF: HACCP, GMP i GHP. Certyfikaty BRCGS i IFS Food ma zakład rozbioru w Liskowie. Sprawdzone hodowle, dobrostan, środowisko." (154 characters).
    - EN: "MCKEEN-BEEF group quality system: HACCP, GMP and GHP. BRCGS and IFS Food: certificates of the Lisków cutting plant. Verified farms, animal welfare, environment." (160).
    - DE: "Qualitätssystem der MCKEEN-BEEF Gruppe: HACCP, GMP und GHP. BRCGS und IFS Food: Zertifikate des Zerlegebetriebs in Lisków. Geprüfte Betriebe, Tierwohl, Umwelt." (159; "geprüfte Betriebe" as in the DE page text).

    To stay within 160 characters, "kontrola na każdym etapie" and the separate terms "biogazownia i fotowoltaika" were folded into "środowisko"; the page itself is unchanged. As a side effect the PL /jakosc entry of GAP-26 (163 characters) is resolved.
  - **Docs:** `architecture.md` §11 records the rule that certification claims in metadata name the certified plant; `content-source-map.md` (Jakość); STATUS (tracker: GAP-05 Done, GAP-26 note).
- **Files changed:** `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts` (`quality.description` only), `docs/architecture.md`, `docs/content-source-map.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-10, Node v24.16.0, bundled Playwright + Edge):**
  - `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:nav` 16/16 (dev). `npm run test:certs` 4/4 (dev and local production build). `npm run test:home` 6/6 (local production build).
  - Metadata check before/after (dev HTML, production HTML and browser DOM): only the three description fields changed on /jakosc PL/EN/DE, with one meta/og tag each, identical across meta, OG and Twitter, and no group-wide IFS/BRCGS wording. The visible text of the three Jakość pages is identical to the audit snapshots. No console errors.
  - `git diff --check` clean.
- **Security notes:** text only; no dependency, header or CSP change. The temporary production server was stopped.
- **Open issues / next steps:** GAP-09 (share image without validity) and GAP-26 (four other long descriptions) stay open; the other gap audit findings one at a time, after the user's decision.

---

## 2026-10-10: GAP-07 — Biogas project not attributed to any company

- **Task (as requested by the user):** GAP-07. Remove the unconfirmed attribution of the Linne biogas project to MCKEEN-BEEF SH.
  - First:
    1. Run `git fetch origin`, `git branch --show-current` and `git status`.
    2. Read STATUS, this log, the gap audit record and client-confirmations.
    3. Check `src/content/plants.ts`, the biogas page and every place that shows the project.
    4. Verify that the source documents really name no beneficiary.
  - Requirements:
    - Do not remove the biogas information. Keep the project data, the 499 kW power and the required EU funding information.
    - Remove or neutralise only the unconfirmed company attribution. Do not guess the beneficiary.
    - Keep C-64 open, check PL/EN/DE, and change no design or unrelated elements.
    - If possible, present the plant as a project located in Linne.
  - Afterwards: lint, tests and build; check the pages in a browser; `git diff --check`; update STATUS, this log and the relevant documentation. Mark GAP-07 Done only after verification.
  - Constraints: keep all uncommitted changes; no commit, push, merge or deployment; report and stop.
- **Goal:** the site names no company for the EU project until the client confirms the beneficiary.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`, after `git fetch origin` (0 ahead / 0 behind `origin/main`) and branch/status checks; no commit.
- **Done:**
  - **Sources checked:** the eight research documents name no beneficiary. 01 §Legal lists the project's "full facts" without one; 04 describes both EU images as standard logos, and viewing them confirms no company name. The verbatim disclosure in `src/content/biogas.ts` names none either. The raw legacy page archive (`../source-assets`) is not available here.
  - **Places traced (server-rendered HTML, PL/EN/DE):** the Biogazownia page, the "Biogazownia w Linne" item in the Środowisko sections of Home and Jakość (`environment.ts`), the footer legal link, meta descriptions, and the SH card on /zaklady (`plants.ts`). The structure cards on /zaklady use only `activity`. Only the SH card's detail list tied the project to a company.
  - **Change (`src/content/plants.ts` only):** removed the SH detail "Biogazownia rolnicza w Linne (projekt UE)" (PL/EN/DE). Added a comment pointing to C-64. No new wording or placement: the project is already presented by location ("Biogazownia w Linne") on the Biogazownia page, Home and Jakość.
  - **Unchanged:** all project data, the EU marks, the footer link, the SH card's other items, design.
  - **Docs:** C-64 kept open with an accurate description; `content-source-map.md` (Zakłady, Biogazownia); STATUS (tracker: GAP-07 Done).
- **Files changed:** `src/content/plants.ts`, `docs/client-confirmations.md`, `docs/content-source-map.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-10, Node v24.16.0, bundled Playwright + Edge):**
  - `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:nav` 16/16 (dev). `npm run test:certs` 4/4 (dev and local production build). `npm run test:home` 6/6 (local production build).
  - GAP-07 content check (before/after, dev and production build): no company card or block on the 42 pages names the project together with a company. All 12 project-data snapshots (Biogazownia page, Home and Jakość Środowisko, footer link; PL/EN/DE) are byte-identical.
  - Browser (Edge): 499 kW, 0,499 MWe, costs, 57,28 %, plots, indicators and the reporting e-mail present on the three biogas pages; both EU logos load. No horizontal overflow on 12 pages at 375/390/1440 px; no console errors.
  - `git diff --check` clean.
- **Security notes:** content only; no dependency, header or CSP change. The temporary production server was stopped.
- **Open issues / next steps:** C-64 (client: the project's beneficiary), C-40 (is the plant operating), C-37 (EU visibility rules); the other gap audit findings one at a time, after the user's decision.

---

## 2026-10-10: GAP-06 — No unconfirmed product attribution for SH II

- **Task (as requested by the user):** GAP-06. Remove from the site the unconfirmed attribution of beef quarter production to SH II (Wydrzyn).
  - First check Git (`git fetch origin`, `git branch --show-current`, `git status`), the documentation and the actual use of the `products.ts` data.
  - Do not remove SH II from the site and do not remove the quarters category. Remove only claims that link this plant to a product without confirmation.
  - Check every place where the attribution is shown, in PL/EN/DE. Do not replace the missing information with a guess.
  - Keep C-51 as a client question; do not change unrelated elements.
  - Afterwards: relevant tests, lint, build, `git diff --check`; update STATUS, this log and the relevant documentation.
  - Constraints: keep all uncommitted changes; no commit, push, merge or deployment; report and stop.
- **Goal:** the site states only documented plant–product links.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`, after `git fetch origin` (0 ahead / 0 behind `origin/main`) and branch/status checks; no commit.
- **Done:**
  - **Data use traced:** `products.ts` `sites` drives the "Zakład" field of each product block (`ProductGroups`), the "Produkty" line of each company card on /zaklady and the certificate filter of a product. The quarters `summary` is shown on /produkty and on the home tile.
  - **Baseline (server-rendered HTML, PL/EN/DE):** SH II was linked to quarters in three places:
    - the plant list of quarters ("Zakład uboju II, Wydrzyn");
    - "Produkty: Ćwierci wołowe" on the SH II card;
    - the summary "Ćwierci wołowe z uboju w zakładach grupy", whose plural covers both slaughterhouses.

    No other text links them: the meta descriptions, the production chain, the router texts and the share images name SH II only as a slaughterhouse with livestock purchasing.
  - **Change (`src/content/products.ts` only):** quarters `sites: ['sh']`; summary "Ćwierci wołowe z uboju." / "Beef quarters from slaughter." / "Rinderviertel aus der Schlachtung." (removal only, no plant named); comment pointing to C-51. The SH II card now simply has no products line; no placeholder or new wording.
  - **Unchanged:** the quarters category; SH II (card, activity, livestock purchasing, contacts, legal data, certificate line, chain); the SH card ("Ćwierci wołowe, Podroby wołowe, UPPZ"); the evidence note of the quarters fact (it names Linne). The "Dotyczy: Linne" line under the form no longer appears, because it is shown only when a product lists several plants.
  - **Docs:** C-51 kept open with an accurate description; `content-source-map.md` (Produkty, Zakłady); STATUS (tracker: GAP-06 Done, GAP-22 note).
  - **Observation recorded, not changed:** the red "✗" cross-stitch bullets can read as negation. Added to the DESIGN-002 review TODO in STATUS.
- **Files changed:** `src/content/products.ts`, `docs/client-confirmations.md`, `docs/content-source-map.md`, `docs/STATUS.md`, this log.
- **Tests and results (2026-10-10, Node v24.16.0, bundled Playwright + Edge):**
  - `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:nav` 16/16 (dev). `npm run test:certs` 4/4 (dev and local production build). `npm run test:home` 6/6 (local production build), including the moved copy in the products section.
  - GAP-06 content check (before/after, dev and production build): the three links are gone in PL/EN/DE; no block on the 42 pages names quarters together with SH II/Wydrzyn.
  - No horizontal overflow on home, Produkty and Zakłady (PL/EN/DE) at 375/390/1440 px; no console errors.
  - `git diff --check` clean.
- **Security notes:** content only; no dependency, header or CSP change. The temporary production server was stopped.
- **Open issues / next steps:** C-51 (client: which products SH II supplies); the other gap audit findings one at a time, after the user's decision.

---

## 2026-10-10: GAP-01 — Original certificate PDFs on the Certyfikaty page (and the gap audit record)

- **Task (as requested by the user):** the user accepted the gap audit results.
  - First:
    1. Check Git and the current documentation.
    2. Record the audit results in the right `.md` file, without needless duplicates.
    3. Add GAP-01 … GAP-26 to `docs/STATUS.md` or an existing tracker, keeping priorities, statuses and client dependencies.
    4. Do not mark unverified items as resolved.
  - Then implement only GAP-01: on the Certyfikaty page visitors can open or download the original PDF, not only see the WEBP preview. Requirements:
    - keep the preview and add a clear link to the original PDF;
    - cover current and archived certificates;
    - keep the correct PL/EN/DE versions and verify that every link leads to the right document;
    - do not change certificate data or statuses, and do not redesign the page.
  - Afterwards: run the relevant tests, lint, build and `git diff --check`, and update CHANGELOG_AI, STATUS and the other relevant documents.
  - Constraints: work only in the files the task needs; keep all earlier uncommitted changes; no commit, push, merge or deployment; report and stop. The next GAPs follow separately, after the user's decision.
- **Goal:** keep every audit finding in the repository, and give buyers and auditors the original certificate documents again.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`, after `git fetch origin` (0 ahead / 0 behind `origin/main`) and branch/status checks. Read STATUS, this log and the certificate components. No commit.
- **Done:**
  - **Audit record:**
    - [`docs/gap-audit-2026-10-10.md`](docs/gap-audit-2026-10-10.md) (new): the dated record with scope, verified items, findings GAP-01 … GAP-26 with research reference, evidence, proposed change, client dependency and effort, user journeys, assets, client-confirmation assessment, performance snapshot, launch priorities, proposed order and readiness gates.
    - Tracker "Gap audit tracker" in `docs/STATUS.md`, with priority, type, state and dependency per finding. Only GAP-01 is marked Done, after verification.
    - `docs/client-confirmations.md`: new question C-64 (beneficiary of the EU biogas project, from GAP-07); C-04 records the document evidence that "PCA AC 169" is the certification body's accreditation.
    - The documentation tables in `README.md` and `AGENTS.md` list the new file.
  - **GAP-01:**
    - `CertificateFiles` takes `pdf`. On the Certyfikaty page (current cards via `CertificateLabel pdf`, archive rows) it renders "Podgląd" (unchanged viewer links, magnifier icon) and "Oryginał PDF" (plain links to `cert.files`, `type="application/pdf"`, `hreflang`, download icon).
    - The PDF links are not intercepted by the viewer and work without JavaScript. Their accessible names contain the visible code ("…, Oryginał PDF PL (wersja polska)").
    - New dictionary keys `cert.preview` and `cert.originalPdf` (PL/EN/DE); a two-column grid aligns the rows.
    - On phones the archive table keeps only the row icons. With text labels the table's inner scroll grew by ≈ 95 px; with icons only, by ≈ 18 px.
    - Home and Jakość keep the single "Dokument" row. Certificate data, statuses and files are unchanged. The viewer's comment was updated.
  - **New test:** `tests/certificates-pdf.test.mjs` (`npm run test:certs`, read-only, local server). For every card and archive row it checks:
    - the preview links are still present;
    - each PDF link's text, `hreflang` and file name agree;
    - the file matches the company, year and standard shown in that card or row.

    It also checks that the 61 PDFs are linked once per page and served byte-identical to the files on disk.
  - **Found while verifying:**
    - The SH EKO 2021 "DE" PDF is byte-identical to the PL file (the bilingual PL/EN certificate). Recorded as GAP-27, open: changing the label is a certificate data change and needs a decision.
    - A PDF tab requests `/favicon.ico`, which does not exist: STATUS, Known issues 11.
- **Files changed:**
  - Code: `src/components/certificates/CertificateStatus.tsx`, `src/components/certificates/CertificateArchive.tsx`, `src/components/certificates/CertificateViewer.tsx` (comment only), `src/app/[locale]/certyfikaty/page.tsx`, `src/i18n/dictionaries/pl.ts`, `en.ts`, `de.ts`, `src/styles/components.css`.
  - Tests and scripts: `tests/certificates-pdf.test.mjs` (new), `package.json` (script `test:certs`).
  - Documentation: `docs/gap-audit-2026-10-10.md` (new), `docs/STATUS.md`, `docs/client-confirmations.md`, `docs/architecture.md`, `docs/asset-map.md`, `docs/content-source-map.md`, `README.md`, `AGENTS.md`, this log.
- **Tests and results (2026-10-10, Node v24.16.0, bundled Playwright + Edge):**
  - `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:certs` 4/4 on the dev server and on a local production build. Fault injection in a scratch copy (swapped language, wrong year, missing link) made it fail as expected.
  - `npm run test:nav` 16/16 (dev server).
  - `npm run test:home` 6/6 on the local production build; not rerun on the dev server, where the audit run failed the LCP check (GAP-24, unrelated).
  - PDF content with `pdftotext`: 59/61 match company, certificate number, expiry date and language. CP EKO 2022 has no text layer and was checked visually. SH EKO 2021 DE = PL (GAP-27).
  - Browser checks (34/34): PL/EN/DE at 1440 and 390 px, viewer still opens, the PDF link loads `application/pdf` without the viewer, focus outline, no-JS links, Home and Jakość unchanged.
  - `git diff --check` clean.
- **Security notes:** no dependency, CSP or header change. The PDFs were already public (legacy redirects); they are same-origin static files with the existing 1-day cache. The temporary production server used for the tests was stopped.
- **Open issues / next steps:** GAP-27 (decision); the favicon for PDF tabs (cosmetic); the other gap audit findings one at a time, after the user's decision.

---

## 2026-10-10: Rebuild gap audit (read-only)

- **Task (as requested by the user):** "McKeen Beef – FULL REBUILD GAP AUDIT".
  - Compare the rebuilt site with the eight Phase 1 research documents (`00`–`07`, crawl of 2026-10-05). Cover:
    - content: 5 companies, 3 plants, GmbH, history and capacities, products, quality, environment, export, recruitment, contacts, legal;
    - certificates: plant attribution, AA+ / 98,60 %, validity, archive, 61 PDFs, PL/EN/DE;
    - UX/CRO journeys: B2B buyer, foreign buyer, livestock supplier, candidate, auditor;
    - page and routing completeness;
    - forms, security and personal data;
    - SEO and technical: meta, canonical, hreflang, sitemap, robots, 404, redirects, headings, alt, structured data, Core Web Vitals, mobile, reduced motion;
    - assets against the manifest;
    - open questions with P1/P2/P3.
  - Classify every finding with an id, priority, evidence, change, client decision and effort; report in Polish (sections A–J).
  - Constraints: read-only analysis and tests; no fixes, deletions, refactors or documentation changes before the results are presented; no real submissions to company mailboxes and no real CVs; no production configuration, DNS or redirects; no commit, push, merge or deployment.
- **Goal:** find what the rebuild lost or got wrong compared with the legacy site, with evidence, before the user decides on fixes.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66` after `git fetch origin`; no commit.
- **Done:**
  - Read the research documents and the project documentation, and the content, form, security, SEO and routing code.
  - Ran the read-only checks listed below. Reported 26 findings (GAP-01 … GAP-26; none critical) and an assessment of every client question in Polish.
  - Nothing in the repository was changed during the audit. The record was written after the user accepted the results (entry above).
- **Files changed:** none during the audit.
- **Tests and results (2026-10-10):**
  - `npm run lint` passed; `npm test` 19/19; `npm run build` passed.
  - `npm run test:nav` 16/16 (dev). `npm run test:home`: one failed check on the dev server (LCP video instead of poster, GAP-24), passed on a local production build.
  - `npm run test:forms` 12/12 (`FORMS_EXPECT=fail`, temporary local production server with SMTP at `127.0.0.1:9`, refused) plus 18 synthetic requests; nothing was sent.
  - `npm audit --omit=dev` 0; `npm audit` 5 high (dev tooling).
  - HTTP crawl: 42 pages and 123 internal links 200, 117 legacy URLs reach 200, 11 unknown URLs 404/405.
  - No horizontal overflow at 375/390 px on 42 pages; no-JS form and router checks; lab performance snapshot.
  - The 2026 CP certificates read from the PDFs.
- **Security notes:** forms were tested only with synthetic data on a temporary local production server whose SMTP connection was refused. It was stopped afterwards. No production configuration was touched.
- **Open issues / next steps:** the tracker in `docs/STATUS.md`. The user decides which findings to implement, one at a time.

---

## 2026-10-10: DESIGN-002 — One beef identity system on every page (experimental)

- **Task (as requested by the user):** DESIGN-001 was too subtle and covered only some places. Extend the Premium Crafted Ranch / beef identity to the whole site (cattle, Polish beef, meat production, natural materials, embroidery and craft, quality; professional B2B, no cartoon farm). Review every page from the real routing (home, Produkty, Jakość, Certyfikaty, Sprzedaż i eksport, Zakłady, O firmie, Kariera, Kontakt, footer; legal and other pages calmer; PL/EN/DE): what exists, what is invisible, where the cattle/meat motif belongs, how to apply embroidery, cattle tags and materials. Build a shared system (A embroidered cattle motif, B butcher cuts diagram where it makes sense, C cattle identification tags, D stitched surfaces, E premium beef icons), apply it page by page with one recognisable main motif per page, plus page-specific details; visible at first glance, no filler, no taller sections from decoration. Stages: shared components → home + Produkty → Jakość, Certyfikaty, Zakłady → Eksport, O firmie → Kariera, Kontakt, footer → site-wide consistency; check visually after each. Hero video, navbar mechanics and trust proof unchanged; no unconfirmed company facts; certificates and documents unchanged; forms and phone numbers stay usable. Full-page desktop and representative mobile screenshots of every main page; record DESIGN-002 with a per-page status in STATUS; lint, tests, build, `git diff --check`; no commit, push, merge or deployment.
- **Goal:** every main page recognisably part of the same McKeen-Beef brand.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66` after `git fetch origin` and branch/status checks; read AGENTS, CHANGELOG, STATUS, architecture and the page/component code. No commit.
- **Done:**
  - Reviewed all 14 routes and their components. Before: the identity was visible only in the header, the chain section and the footer; page headers carried no mark; the chain data already defined a step icon that nothing used; the brand cuts diagram appeared once as a flat plate.
  - Shared system (`src/components/brand/BrandMarks.tsx`, `src/styles/craft.css` restructured into sections 1–8): `BrandIcon` (embroidered line icons: the legacy category icons plus `public/craft/icons/` knife, box, cold, seal, certificate, pin and clipboard drawn in the same style), `BrandPatch` (felt patch with red satin edge, inner stitch, "MCKEEN-BEEF" and an existing label on the ring, a motif in the middle), `CutsDiagram` (the brand cuts line art sewn in red thread), ear-tag labels, numbered section tags (CSS counter, hidden from assistive technology) with a red running stitch under every section title, stitched cards, dark stitched cards and insets, cross-stitch bullets, a `motif` slot in `PageHeader`.
  - Pages: home (group patch, chain step icons and number tags, eyebrow tag, sewn ćwierci diagram, category badges, stitched ledger and panels); Produkty (cuts plate on desktop, steak patch on phones, jump links as tags, stitched product blocks); Jakość (seal patch, systems and control areas as tags, cow icon on the origin panel); Certyfikaty (certificate patch, red-stitched labels, pin, stitched archive; scans untouched); Sprzedaż i eksport (truck patch, globe and truck icons, stitched ledger); Zakłady (pin patch, structure cards with location tags, red role tags, snowflake); O firmie (largest bull patch, years as tags on a red stitch); Kariera (knife patch, stitched job card, red company tag, stitched pay and aside); Kontakt (handshake patch, stitched topics and answer, filter and department tags); Zapytaj o ofertę (steak patch); footer (bull patch, stitched dividers); Biogazownia, legal pages, Wysłano and 404 calm.
  - Checked each stage with full-page screenshots; fixed the cuts plate covering the fifth jump tag, the phone patch position, and kept `outline` as the focus ring on stitched links and buttons (their stitch is a pseudo-element). Eyebrow tags keep sentence case (readability; the moved-copy check reads rendered text).
- **Files changed:** `src/components/brand/BrandMarks.tsx` (new), `public/craft/icons/*.svg` (new, 7), `src/styles/craft.css`, `src/components/layout/PageHeader.tsx`, `src/components/layout/SiteFooter.tsx`, `src/components/sections/ProductionChain.tsx`, `src/app/[locale]/` `produkty`, `jakosc`, `certyfikaty`, `sprzedaz-eksport`, `zaklady`, `o-firmie`, `kariera`, `kontakt`, `zapytaj-o-oferte` pages, `docs/STATUS.md`, `docs/architecture.md`, `docs/asset-map.md`, `docs/security.md`, this log.
- **Tests and results (2026-10-10, Node v24.16.0, localhost:5000 dev server, bundled Playwright + Edge):** `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed (rerun after the last change); `npm run test:nav` passed (16/16); `npm run test:home` passed on the rerun (the first run failed the moved-copy check while the eyebrow tag was uppercased by CSS). Visual audit: no horizontal overflow on 25 pages × 6 widths; marks `aria-hidden`; focus rings intact; smooth scrolling; only the pre-existing 404 console warning. `npm run test:forms` not run (forms unchanged). Firefox, Safari, real devices and screen readers not tested.
- **Security notes:** no new dependency or script; CSP unchanged (same-origin SVG/PNG masks, inline SVG text, the existing `data:` grain).
- **Open issues / next steps:** the user's visual review; TODOs in STATUS (authentic origin photography, button radii, density of department tags in Kontakt, official icon set if any, Safari/Firefox).

---

## 2026-10-10: DESIGN-001 — Premium Crafted Ranch identity beyond the header (experimental)

- **Task (as requested by the user):** extend "Premium Crafted Ranch / Soft Tactile Comfort", with the embroidered navbar as the main inspiration, to the rest of the site as an experiment for review on localhost:5000, without rebuilding it, in three small stages: (A) a very subtle fabric texture on cream surfaces (not fur or carpet, no noise under text; light CSS preferred) and stitched seams/edges used selectively; (B) a minimalist cattle silhouette that looks embroidered in red thread (elegant, thin refined lines, a few places only, never replacing the logo; SVG with light CSS) and discreet labels inspired by cattle ear tags (no literal copies, no invented animal numbers, not a farming-app look); (C) better presentation of the existing authentic photographs (no stock cattle, nothing fabricated, images tied to documents/certificates unchanged; TODO where material is missing). Assess minimalism after each stage; do not stack competing effects; no big refactors or libraries. Hero (video, H1, CTA), navbar and its mechanics, logo, trust proof, routing and translations unchanged. Record DESIGN-001; check 1280/1440/1920, 768, 375/390 px, PL/EN/DE, legibility, contrast, overflow, accessibility, performance; lint, tests, build, `git diff --check`; before/after screenshots; no commit, push, merge or deployment; report in Polish and wait for the visual review.
- **Goal:** a calm, recognisable crafted identity across the site in the header's material, without decoration overload.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66` after `git fetch origin`, branch/status checks and reading AGENTS, CLAUDE, STATUS, this log and architecture. Stayed on this feature branch: everything is uncommitted, a new branch would carry the same working tree, and the NAV-006 side session was working in the same checkout at the time. No commit.
- **Done:**
  - Inspected the stylesheets, the home/footer/page-header components and the media registry; captured 25 "before" full-page screenshots (reduced motion, so reveals do not hide sections).
  - New experimental layer `src/styles/craft.css`, imported last in `[locale]/layout.tsx` and `global-not-found.tsx` (removing it restores the previous look). Stage A: the header's grain at lower strength without its weave on `body` and the paper-2 bands; sewn seams as background layers on the band edges, under page headers (with a soft lip) and along the top of the footer; the UPPZ note as a recessed stitched panel; certificate cards as sewn labels (10 px radius, inner stitch, slight lift). Stage B: `public/craft/cattle-outline.svg`, the outline of the existing brand bull line art (rasterized, outer contour traced, simplified to 113 points, smoothed into Béziers; drawn as a constant 2.2 px stitched line), embroidered in red thread through a mask with the wordmark's satin texture; placed only in the home chain introduction, the footer and the O firmie page header (desktop), decorative and `aria-hidden`; ear-tag-like labels (arched, embossed, punched hole) for the chain's real step numbers, hanging under the horn markers, and for the "illustrative photo" note. Stage C: content photographs as mounted prints (soft corners, light edge, quiet shadow), full-bleed bands square and certificate scans untouched; the three chain photographs in varied proportions (the 3:1 Hereford close-up leads); a gentle CSS grade (`.photo--natural`) on the two golden-hour pasture photographs (O firmie and Kontakt bands).
  - Assessed each stage with 2× close-ups; reworked the chain tags (moved under the horn markers, muted, smaller). Moved the outline from `public/assets/brand/` to `public/craft/` after finding that `npm run assets` deletes and rebuilds `public/assets/`.
  - No new photographs: the library holds no further authentic cattle material suitable for large frames (`vet-farmer-herd.webp` is 492 px); recorded as a TODO.
- **Files changed:** `src/styles/craft.css` (new), `public/craft/cattle-outline.svg` (new), `src/app/[locale]/layout.tsx`, `src/app/global-not-found.tsx`, `src/components/sections/ProductionChain.tsx`, `src/components/layout/SiteFooter.tsx`, `src/app/[locale]/o-firmie/page.tsx`, `src/app/[locale]/kontakt/page.tsx`, `docs/STATUS.md`, `docs/architecture.md`, `docs/asset-map.md`, `docs/security.md`, this log.
- **Tests and results (2026-10-10, Node v24.16.0, localhost:5000 dev server, bundled Playwright + Edge):** `npm run lint` passed; `npx tsc --noEmit` passed; `npm test` 19/19; `npm run build` passed (rerun after the last change); `npm run test:home` passed (all sections); `npm run test:nav` passed on the rerun (the first run passed every functional section, but its console check caught a Turbopack message caused by editing `craft.css` during the run). Visual audit: no horizontal overflow on 16 pages × 6 widths (375–1920 px), the bull marks are decorative, smooth scrolling (median 7.6 ms per frame with the layer on); the console is clean except a pre-existing React warning on 404 pages (STATUS, Known issues 10). `npm run test:forms` not run (forms unchanged). Firefox, Safari, real devices and screen readers not tested.
- **Security notes:** no new dependency or script; CSP unchanged (the grain is a `data:` URI, the bull a mask of a same-origin SVG).
- **Open issues / next steps:** the user's visual review; TODOs: authentic cattle/origin photography (`docs/asset-map.md`, item 7); decide whether stitched cards should extend to other cards and forms and whether buttons follow the soft radii; fix the 404 console warning in a separate task.

---

## 2026-10-09: NAV-006 — Spatial carriage motion: arc, detent pull-in, swing and lock click (refines NAV-005)

- **Task (as requested by the user):** "one more important navbar fix": the movement of the active tab/selector looked too flat, like sliding along the width. It should have a spatial, arcing character in line with a 3D mechanism: no plain horizontal slide; move as if mounted on a rounded, spatial mechanism, with a felt arc/curvature/rolling instead of an X shift only; at the end a subtle pull-in, a slight overshoot, a short settle/wobble and a final mechanical snap/lock. Subtle and premium, not exaggerated or rubbery; still elegant and responsive; `rotateX`/`rotateY`/`translateY`/`translateZ`, easing or light/shadow changes allowed. No change to the navbar height or layout; implement in the current mechanism and show the effect.
- **Goal:** the carriage visibly lifts out of the channel, travels on an arc, drops into the detent and clicks, with unchanged navigation timing.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66` after `git fetch origin` and branch/status checks; no commit. Started in the original session and finished in a side session after the user started DESIGN-001 there (same checkout; only the shared docs overlap).
- **Done:**
  - Measured first (per-frame trace in Edge): the snap was a quartic ease-out (≈ 60 % of the distance in the first ≈ 40 ms, a long creep, then a static 110 ms dwell), and a click on a tab more than four positions away took the shortest arc across the Contact/Home seam: from Home to Zakłady the carriage jumped to the right end of the rail and came back, a sweep along the whole width.
  - `drum-motion.ts`: `railPosition()` replaces `nearestPosition()`, so clicks and Home/End travel straight along the rail (the arrows still step across the seam). New snap profile within the unchanged phase timing (`snapping` 240 ms, `locked` 110 ms, lock ≈ 350 ms): a cubic-Hermite glide (momentum carries over; from rest a firm start at half the mean speed) that slows near the tab, a pull into the detent over the last 0.14 detent that arrives with a little momentum at 230 ms, and a damped swing of ≈ 0.047 detent (measured in Edge: ≈ 3.3 px) past the tab and ≈ 0.5 px back, settled before the lock. The swing is the same for any distance and scaled down for very short corrections. Public `origin`/`velocity`; rapid steps keep their momentum.
  - `DrumNav.tsx`: the Contact/Home seam segment is eased so that the carriage leaves and arrives at a normal step's pace; a swing past the first or last tab continues outwards. A frame loop writes `--lift` (out of the channel while travelling or held, down into the detent over the last 44 px) and `--tilt` (a lean into the travel, 6.7° for one step up to 9°, carried by a light spring, ≈ 8 Hz / damping 0.55, so the swing rocks the carriage back ≈ 3.5°). The lock clicks (Web Animations, 170 ms: the carriage presses 0.8 px, the stitch marks close by 1.5 px). Reduced motion: no loop, no lift or lean, no click.
  - `DrumNav.module.css`: carriage transform with `perspective(420px)`, a `translate3d` lift (≤ 12 px towards the viewer, 2 px up) and a `rotateY` lean (≤ 9°); lift-dependent shadows; the receding edge darkens slightly; the old `lock` keyframes removed. Header height and layout unchanged (104 px).
  - Showed the effect: deterministic header frames captured with a manual page clock (4 ms steps), encoded as two short videos (real time and 4× slower) for the user.
  - Tests: `drum-motion.test.mjs` (direct rail path; glide, pull, swing and settle for 1/3/8 steps; rapid steps keep their momentum); `navbar-browser.mjs` (a far click from Produkty to Kontakt travels straight, swings 1–8 px past the tab, rests on it, lifts and leans while moving, the lock clicks; reduced motion: no lift, lean or click).
- **Files changed:** `src/components/navigation/drum-motion.ts`, `DrumNav.tsx`, `DrumNav.module.css`, `tests/drum-motion.test.mjs`, `tests/navbar-browser.mjs`, `docs/architecture.md`, `docs/STATUS.md`, `README.md`, this log.
- **Tests and results (2026-10-09, Node v24.16.0, localhost:5000 dev server, bundled Playwright + Edge):** `npm test` 19/19; `npx tsc --noEmit` passed; `npm run lint` passed; `npm run build` passed; `npm run test:nav` passed (all 16 sections, including the new motion checks); `npm run test:home` passed. Run while DESIGN-001 was being edited in the same checkout. Firefox, Safari, real trackpads and touch not tested; the motion was judged from traces and frame captures, not yet by the user.
- **Security notes:** no dependencies, scripts or external resources added; CSP unchanged (CSS variables and the Web Animations API only).
- **Open issues / next steps:** the user's visual review of the motion (the amplitudes are named constants in `drum-motion.ts`, `DrumNav.tsx` and `DrumNav.module.css` if it should be calmer or stronger). Pre-existing NAV-005 detail: while the reel rolls during fast travel, the red stitch marks cross the passing label.

---

## 2026-10-09: HERO-003 / NAV-005 (crafted) — Original-quality hero video and an embroidered soft-3D header with all nine tabs

- **Task (as requested by the user):** refine the homepage after a reference visualisation ("Premium Crafted Ranch / Soft Tactile Comfort": warm cream materials, subtle fabric/embroidery, soft 3D, red accents; no metal panel, screws, frames, heavy black, glass or gaming UI). Header: embroidered red McKeen-Beef logo stitched into the header material; one coherent soft-3D construction; all nine pages visible and directly selectable on desktop without a taller header or a second row (check real dimensions first; show compromises before implementing if impossible); keep the revolver character (3D rotation, drag, inertia, snap, mechanical lock, click any position, selection animation, URL sync, PL/EN/DE, keyboard, reduced motion); check 1216/1280/1440/1920 px; mobile keeps every page reachable. Video: re-verify the source and the served file, compare the original with CRF 18/20/22 on grass, trees, coat and motion, choose the best practical variant (6–10 MB acceptable if clearly better), 25 fps, no upscaling or over-sharpening, faststart, smooth loop, check for a poster jump, keep the pause button and static fallbacks, separate phone variant with checked cropping, browser diagnostics (dropped frames, decoding, bytes, source choice, load, LCP), find the real cause before assuming more bytes help. Hero: only H1 and CTA (CTA may grow), trust proof unchanged below, no large overlay. Intro kept and adapted. Record HERO-003, update NAV-005; no commit, push, merge or deployment; stop for visual review.
- **Goal:** the best image the footage allows and a premium, tactile header in which every page is one click away.
- **Branch / commit:** continued `codex/3d-drum-navbar` at `b2fdc66` after `git fetch origin`, branch/status checks and reading AGENTS, CLAUDE, STATUS, this log, architecture and asset notes; HERO-003 was new, NAV-005 was reopened with the new scope. No new commit; all earlier uncommitted work preserved.
- **Done:**
  - Measured before changing anything: source re-verified; CRF 18/20/22 encoded (`veryslow`, `tune film`) and compared with a lossless decode of the source (VMAF/SSIM/PSNR, `blurdetect`, 2× crops of grass, trees, coat and the tree wipe). CRF 18/20 were larger than the source; all variants looked like the source, whose own compression is visible. Browser diagnostics: hardware decoding, no dropped frames worth mentioning, ≈ 1 % main-thread load, correct sources and byte counts; the softness comes from the source enlarged on high-density screens (phones 1.8×, 2× laptops ≈ 1.7×). Correction: the HERO-002 entry reported VMAF 99.6 for the CRF 24 file through a different reference pipeline; like-for-like it is 98.6.
  - Video: desktop/tablet now serve the original stream unchanged (remux only, MD5-identical bitstream, 9.54 MiB); phones a square 800×800 CRF 22 crop (3.20 MiB, enlargement 1.46× instead of 1.82×, herd in frame throughout); the poster is frame 0 with an explicit BT.709 conversion. File names carry a content hash after a stale optimised poster showed as ghosting in development. `HeroVideo` now starts playback only with enough data (autoplay attribute plus an explicit start on `canplaythrough`, robust against React's development double effects), reveals at frame 0 with a 160 ms fade and then grows over the 1px LCP hairline (the final screenshots showed that hairline as a static frame-0 edge around the moving picture), detects refused autoplay via `navigator.getAutoplayPolicy` or a single checked `play()`, and keeps the pause button and poster fallbacks.
  - Hero: phones 1:1, H1 scale adjusted, CTA larger (scaled with the headline) as a soft red cushion; poster `sizes` updated.
  - Header (NAV-005 crafted): measured the room first (≈ 670/730/780 px for the tabs at 1216/1280/≥1440 px against 430–487 px of label text) — all constraints met without compromise. Rewrote `DrumNav` rendering: nine real links in a stitched channel, a raised carriage with a 3D reel (`rotateX`, nine faces) that slides and resizes between measured tab boxes and rolls the chosen label in; drag (bounded to the rail), sideways wheel, arrows with wrap, roving keyboard focus; the motion controller is unchanged. Removed the wheel-mode button, the full-list menu and the control row. New header material in `components.css` (fabric grain as inline SVG noise, weave, sewn seam, soft lip; embroidered wordmark as a satin-stitch texture masked by `logo.svg` with a raised shadow and a dashed seam; soft language recess; soft red CTA with arrow). Updated the drum instructions in PL/EN/DE.
  - Intro: unchanged sequence, now over the crafted header (surface, embroidered wordmark, selector, languages, CTA, then H1 and CTA).
  - Tests: rewrote `tests/navbar-browser.mjs` for the new interaction model (nine links, direct clicks, roving focus, sideways wheel, carriage drag, label fit at four widths in three locales); `tests/home-browser.mjs` updated (square phone file by variant name, refused-autoplay simulation, LCP read after the poster has painted, storage guard for opaque frames).
- **Files changed:** `public/video/` (three hashed files replace the previous ones), `src/content/media.ts`, `src/components/ui/HeroVideo.tsx`, `src/app/[locale]/page.tsx`, `src/components/navigation/DrumNav.tsx`, `DrumNav.module.css`, `src/components/layout/SiteHeader.tsx`, `src/styles/components.css`, `src/styles/art.css`, the PL/EN/DE dictionaries (drum instructions), `tests/navbar-browser.mjs`, `tests/home-browser.mjs`, `README.md`, `docs/STATUS.md`, `docs/architecture.md`, `docs/asset-map.md`, `docs/security.md`, `docs/client-confirmations.md` (new C-63), and this log.
- **Tests and results (2026-10-09, Node v24.16.0, localhost:5000 dev server, bundled Playwright + Edge):** `npm run lint` passed; `npm test` 17/17; `npm run build` passed; `npm run test:nav` passed (all sections, no runtime errors); `npm run test:home` passed (all sections, including the new check that the playing video covers the whole poster). All five were re-run after the final hairline fix with the same results. Diagnostics as listed in `docs/STATUS.md`. `npm run test:forms` not run (form API unchanged). Firefox, Safari, real phones and screen readers not tested.
- **Security notes:** no new dependencies or scripts; CSP unchanged (the fabric grain is a `data:` image, the embroidery a same-origin CSS mask).
- **Open issues / next steps:** user's visual review; a higher-resolution master would be needed for sharper large/high-density screens (C-63); footage licence (C-43); browser coverage beyond Chromium. See `docs/STATUS.md`.

---

## 2026-10-09: HERO-002 / NAV-005 — Cinematic hero, video quality and a simpler 3D header

- **Task (as requested by the user):** revise the just-built homepage and header (message received while HERO-001/NAV-004/INTRO-001 were being finished). Hero: remove the oxblood gradient, full-surface footage in natural colours, only the H1 "Polska wołowina jakościowa", the CTA "Zapytaj o ofertę" and the existing trust proof; move the other hero copy to matching sections without losing facts (PL/EN/DE); very large H1 in at most two or three lines; legibility by placement and a discreet text-shadow, not a gradient (report if impossible); compare H.264 CRF 20/22/24 against the source and pick the best quality/weight/smoothness compromise; keep 25 fps, poster, mobile optimisation, pause button and reduced-motion fallback. Header: one coherent, minimal 3D construction (cream, graphite, McKeen red, subtle realistic depth) without screws, plates, frames or decorative controls; the drum must read as a rotating cylinder with about five positions, a strongly emphasised active position and angled, deeper neighbours; keep all mechanics, nine pages, routing, accessibility and the mobile menu. Keep trust proof and the intro (adapted). Plan first, then two stages with checks on localhost:5000; no commit, push, merge or deployment.
- **Goal:** a cleaner, cinematic first screen and an elegant header in which the drum is the one convincing mechanism.
- **Branch / commit:** continued `codex/3d-drum-navbar` at `b2fdc66` after `git fetch origin`, branch/status checks and reading AGENTS, STATUS, this log and the architecture notes; no other open work on these elements. No new commit; all earlier uncommitted work preserved.
- **Done:**
  - Analysis before changes: luminance of every frame in candidate text regions (Node script over raw ffmpeg frames). The sky above 35 % of the frame gives white text only 1.2–1.6:1, the 35–62 % band ≥ 3.2:1 at its 90th percentile and 5:1+ at its median, so the H1 starts at 37 % of the hero with a soft text-shadow and no gradient; checked on screenshots at six loop times (desktop and mobile, longest DE headline).
  - Video: encoded CRF 20/22/24 (`slow`) and compared with the source by VMAF/SSIM/PSNR, size, 1-s bitrate peaks and 1:1 crops of a detailed and a fast-motion frame. CRF 20 was larger than the source, CRF 31 (the HERO-001 file) visibly softer (VMAF 88); CRF 24 with `veryslow` + `tune film` matched CRF 22 visually at 6.01 MiB (VMAF 99.6). Re-encoded desktop 1920×800 and a new phone file 640×800 (4:5 crop, 2.05 MiB, replaces the 720×494 file), 25 fps, loop start kept at 5.40 s. Table and commands in `docs/asset-map.md`.
  - Hero: full-bleed on all breakpoints (phones 4:5, tablets 4:3), veil and panel removed, only H1 + one CTA; H1 `clamp(3rem, 1.6rem + 5.4vw, 7.5rem)`. Poster `sizes` set to the real rendered width per shape so the poster stays the LCP element. `HeroVideo` now reveals the video only when playback is smooth (enough data or 2 s without stalling), skips 3G-class connections, and shows a user-started video at once.
  - Moved hero copy: product lead → products introduction; group line (as eyebrow) and process summary → integration-chain introduction (`ProductionChain.tsx`, light eyebrow colour on the dark section); the sales phone already appears in the sales band (same number), "Zobacz produkty" duplicated the products button. No dictionary text changed.
  - Header: rewrote `DrumNav.module.css` (cream roller in a groove, fixed light, labels on a 20° cylinder, radius 320/340 px, perspective 1000/1100 px, no face backgrounds or borders, red index marks, arrows at the roller ends, quiet wheel/list icons, instruction on hover/focus) and the header part of `components.css` (smooth cream surface, 4 px lip, soft shadow, logo and language switch directly on it, simple red CTA, `--glint` light reaction). `paint()` additionally writes `--focus` and `--fade` per label; the first 24° / 280 px attempt compressed the ±2 labels to 46 % of their width (measured), so step and perspective were adjusted to ≈60 %. Header back to 104 px. The logo uses `loading="eager"` instead of the deprecated `priority`.
  - Intro: kept, now H1 then CTA after the header; veil and removed elements dropped from the sequence.
  - Tests: `tests/navbar-browser.mjs` checks the ±2 labels by projected-width ratio and opacity and the 104 px header; new `tests/home-browser.mjs` (`npm run test:home`).
- **Files changed:** `public/video/home-hero-1920.mp4` (re-encoded), `home-hero-640.mp4` (new), `home-hero-720.mp4` (removed; created earlier this session); `src/app/[locale]/page.tsx`, `src/components/ui/HeroVideo.tsx`, `src/components/sections/ProductionChain.tsx`, `src/components/navigation/DrumNav.tsx`, `DrumNav.module.css`, `src/components/layout/SiteHeader.tsx`, `src/content/media.ts`, `src/styles/art.css`, `components.css`, `pages.css`, `tokens.css`, `tests/navbar-browser.mjs`, `tests/home-browser.mjs` (new), `package.json`, `README.md`, `docs/STATUS.md`, `docs/architecture.md`, `docs/asset-map.md`, `docs/security.md`, `docs/content-source-map.md`, `docs/client-confirmations.md`, and this log.
- **Tests and results (2026-10-09, Node v24.16.0, localhost:5000 dev server, bundled Playwright + Edge):** `npm run lint` passed; `npm test` 17/17; `npm run build` passed; `npm run test:nav` passed (all sections; centring ≤ 0.01 px, CTA clearance 40–61 px, ±2 labels 59–61 % width); `npm run test:home` passed (all sections). Video served with Range (206) and the 7-day cache header. `npm run test:forms` not run (form API unchanged). Firefox/Safari, real phones and screen readers not tested.
- **Security notes:** no new dependencies; CSP unchanged. The intro gate is a static nonce'd inline script (documented in `security.md` §6); one `sessionStorage` key for UI state (§7, C-35).
- **Open issues / next steps:** user review; footage licence (C-43); browser coverage beyond Chromium. See `docs/STATUS.md`.

---

## 2026-10-09: HERO-001 / NAV-004 / INTRO-001 — Hero video, five-position drum, spatial header, home intro

- **Task (as requested by the user):** after an approved analysis: replace the home hero photo with the supplied `home_bottom.mp4` (autoplay, muted, loop, playsInline, no scroll control, poster, reduced-motion and autoplay fallbacks, no LCP regression), H.264 ≈2.5 MB desktop / ≈0.8 MB mobile, loop start at 5.40 s, new H1 in PL/EN/DE, keep the other hero copy, add a pause button; show about five drum positions (18° step, arrows under the drum, three positions at 1216 px if needed) and make the **whole header** one spatial premium-industrial construction; add a ≈1.3 s home intro once per session, also across language switches and reloads, without weakening the CSP and working without JavaScript. Trust proof unchanged; no commit.
- **Goal:** a premium first impression and a selector that shows the available pages.
- **Branch / commit:** `codex/3d-drum-navbar` at `b2fdc66`; no new commit.
- **Done:**
  - Video: measured the source (1920×800, 25 fps, 10 s, 8 Mbit/s, 10 MB; same footage as the legacy ambient loop; first/last frames match; tree wipe at ≈4.2–5.2 s), found the poster frame (135, SSIM 0.97), encoded CRF 31 desktop and a 720×494 mobile crop with the loop rotated to frame 135, and extracted a 1920 px poster from that frame after measuring that the 1280 px poster let the video frame become the LCP element. Video box 1px inside the poster box for the same reason. `HeroVideo` client component (source after hydration, reduced motion / Save-Data / 2G skip, poster on error, play button when autoplay is blocked, pause/resume). `/video/*` cache header in `next.config.ts`.
  - Hero with an angled oxblood veil over full-bleed footage on desktop, new H1 (DE with a soft hyphen), pause/play labels in all dictionaries, `pause`/`play` icons.
  - NAV-004: measured that nine faces 40° apart can never show more than three readable positions; replaced the rotor rotation by per-face wrapped offsets (`--offset`) on an 18° long-drum geometry with five hit areas; fixed-size housing (also removed the hydration layout shift); a machined console header (plate, front edge, name plate, screws, key-style language switch, bezel CTA, `--glint` light reaction). Fixed an arrow that the rail overlay made unclickable (caught by `test:nav`); reduced motion shows a static metal strip.
  - INTRO-001: nonce'd inline gate script in the layout (`sessionStorage` `mb-intro`, `intro-seen` class before first paint, set after 1.6 s), CSS-only sequence; removed an override of the page-enter fade after a test showed it restarted the fade when the class was set.
- **Files changed:** `public/video/*` (new), `next.config.ts`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/components/ui/HeroVideo.tsx` (new), `src/components/ui/Icon.tsx`, `src/components/navigation/DrumNav.tsx`, `DrumNav.module.css`, `src/content/media.ts`, the PL/EN/DE dictionaries, `src/styles/art.css`, `components.css`, `tokens.css`, `tests/navbar-browser.mjs`, `docs/STATUS.md`. The hero and header styling was revised the same day (entry above).
- **Tests and results:** lint, TypeScript and `npm run test:nav` passed (five hit areas, ±2 faces, clearances, reduced motion); ad-hoc Playwright checks (outside the repository) for LCP, CLS, fallbacks, slow network, intro filmstrip and replay rules passed. Superseded by the entry above for the final state.
- **Security notes:** CSP unchanged; inline script with the request nonce; no new dependencies.
- **Open issues / next steps:** revised by HERO-002 / NAV-005.

---

## 2026-10-09: NAV-003 — Add Home as the ninth drum position

- **Task (as requested by the user):** first audit the documentation and summarize outstanding work, then add the localised homepage as the first of nine desktop drum positions, 40° apart, preserving the design, controller, accessibility and mobile menu. Update the relevant docs and verify locally; preserve all uncommitted work, do not change AGENTS, and do not commit, push, merge or deploy.
- **Goal:** return to Home through the same mechanical selector, with the correct URL and current position in every locale.
- **Branch / commit:** continued `codex/3d-drum-navbar` at `b2fdc66` after successful fetch and branch/status checks. No new commit. Saved a temporary baseline of affected working files for incremental diff review.
- **Done:**
  - Reviewed AGENTS, CLAUDE, STATUS, recent log entries, README, architecture and the relevant client/security/asset documentation. Compared the documented navbar with code and reported the remaining work before editing: NAV-002 visual review, client/production prerequisites, missing CI/source materials and verification limits. Did not implement other backlog items or change their status. Existing audit findings were not rerun and remain labelled as earlier results in STATUS.
  - Recorded NAV-003 scope and completion criteria in STATUS before implementation. Read the installed Next.js pathname/Link reference for the existing routing integration.
  - Prepended `home` only to the desktop items, reusing existing translations and locale routes. Corrected exact URL matching so `/en` and `/de` cannot incorrectly mark subpages as Home. Adjusted the radius for nine contiguous faces while retaining the face/viewport/header sizes, body width and centring.
  - Adapted motion tests to nine detents and added a Contact/Home boundary test. Extended browser checks to all 27 routes, direct entry, Home keyboard confirmation, locale switching, wrapping/history, reduced motion and no-JS Home return.
  - Kept the motion controller, input handlers, MobileMenu, shared eight-entry mainNav, dictionaries, routing map and AGENTS unchanged. Added no dependencies. Updated the current docs; historical eight-position log entries remain unchanged.
- **Files changed in NAV-003:** `src/components/layout/SiteHeader.tsx`, `src/components/navigation/DrumNav.tsx`, `DrumNav.module.css`, `tests/drum-motion.test.mjs`, `tests/navbar-browser.mjs`, `README.md`, `docs/STATUS.md`, `docs/architecture.md`, and this log. Earlier uncommitted files preserved.
- **Tests and results:** `npm run lint` passed; `npm test` 17/17 passed; `npm run build` passed including TypeScript. `npm run test:nav` passed on localhost:5000 in installed Edge using the bundled Playwright runtime: all 27 localised desktop URLs, current-page/preview semantics, homepage language switching, Contact/Home wrapping after lock and Back/Forward, drag/wheel, keyboard, cancellation, reduced motion, mobile menu, CTA and no-JS fallback. No runtime/console errors. Desktop screenshots at 1216/1280/1440/1920 px inspected; centring and CTA separation match NAV-002 (measurements in STATUS). Responsive menu checked at 390/768/1024/1215 px. `git diff --check` and untracked trailing-whitespace checks passed. Form API tests, installs and dependency audits not rerun: affected code/dependencies unchanged.
- **Security notes:** existing trusted locale hrefs, navigation guards and CSP retained; no external submissions or publication actions.
- **Open issues / next steps:** user review. No NAV-003 functional or header-layout defect found in the tested matrix. Firefox/Safari, physical mobile hardware and actual screen-reader output remain untested; unrelated backlog remains in STATUS.

---

## 2026-10-09: NAV-002 — Integrate the desktop drum with the cream header

- **Task (as requested by the user):** visually integrate and enlarge the existing 3D selector, centre it in the header, reduce small helper labels and heavy framing, preserve the working navigation and mobile menu, and verify localhost:5000 at 1216/1280/1440/1920 px. Preserve all uncommitted work; no reset, stash, commit, push, merge or deployment.
- **Goal:** a legible mechanical cylinder that belongs to the McKeen Beef design rather than looking like a separate dark widget.
- **Branch / commit:** continued `codex/3d-drum-navbar` at `b2fdc66`, after fetch/branch/status checks. No new commit. Saved a temporary baseline of the affected working files to review this task independently of earlier uncommitted work.
- **Done:**
  - Recorded NAV-002 scope, expected effect and completion criteria in STATUS before implementation; marked it locally verified after checks.
  - Removed black housing, heavy borders, numeric counter and face numbers. Enlarged the cylinder and labels; added warm metal shading, subtle ground shadow and a single red detent marker.
  - Centred the cylinder with equal side tracks, increased desktop header height through the shared token, and preserved the mobile height. Simplified the helper rail to one readable instruction plus accessible wheel/list icons; updated the short PL/EN/DE hints.
  - Extended the existing browser suite with measured centring and minimum CTA-clearance checks and screenshots at each requested width. Measurements and current status live in `docs/STATUS.md`; final design dimensions are in `docs/architecture.md`.
  - Kept the motion controller, event handling, routing and mobile-menu implementation unchanged. No dependencies added.
- **Files changed in NAV-002:** `src/components/navigation/DrumNav.module.css`, the presentation markup in `DrumNav.tsx`, `src/styles/components.css`, `src/styles/tokens.css`, the three i18n dictionaries, `tests/navbar-browser.mjs`, `docs/STATUS.md`, `docs/architecture.md`, and this log. Earlier uncommitted files remain preserved.
- **Tests and results:** `npm run lint` passed; `npm test` 16/16 passed; `npm run build` passed including TypeScript. `npm run test:nav` passed on localhost:5000 with bundled Playwright and installed Edge: all 24 locale routes, gestures, keyboard, URL/history, cancellation, reduced motion, mobile menu, CTA and desktop no-JS fallback; no browser runtime/console errors. Screenshots at all four requested desktop widths were visually inspected. The cylinder was horizontally centred with no collisions or overflow. `npm run test:forms` not run because form API code did not change; the CTA dialog was checked in the browser. No dependency installation/audit rerun. Physical devices, Firefox/Safari and actual screen-reader output were not tested.
- **Security notes:** presentation-only application changes; existing event guards, trusted navigation targets and CSP unchanged.
- **Open issues / next steps:** user's visual review. No functional or layout defect found in the tested matrix; remaining verification limits are recorded in STATUS.

---

## 2026-10-09: Desktop CSS 3D drum navigation

- **Task (as requested by the user):** implement the approved eight-position mechanical desktop navbar: graphite metal, perspective, horizontal drag, controlled wheel input, momentum, snap and lock before navigation. Preserve all PL/EN/DE routes, logo, locale switch, offer CTA and the traditional mobile menu. Verify locally on port 5000. Preserve earlier uncommitted documentation. No commit, push, merge or deployment.
- **Goal:** an accessible, predictable physical selector without new dependencies or global scroll capture.
- **Branch / commit:** `codex/3d-drum-navbar`, created with `git switch -c` from the current local `docs/ai-workflow` state at `b2fdc66`, after `git fetch origin`, branch/status checks and documentation review. All earlier uncommitted changes carried forward; no reset or stash. No new commit.
- **Done:**
  - Read the installed Next.js 16.3.8 guides for client components, pathname rewrites, router and Link navigation interception.
  - Replaced desktop `NavLinks` with `DrumNav`, CSS 3D geometry, an independent cancellable motion controller, direct links and a full-list fallback. Removed the unused old component and `.mainnav` rules.
  - Added localised control instructions, keyboard preview/confirmation, settled-choice announcements, URL/history synchronization and reduced-motion presentation. Implementation details live in `docs/architecture.md`, "Desktop drum navigation".
  - Kept the existing mobile menu, locale mapping, logo, offer dialog trigger and header height. Added no packages, media, API or security-policy changes.
  - Added deterministic motion tests and a repeatable optional browser runner using an existing Playwright installation. Updated README test commands and corrected the stale two-tier-header description in STATUS.
- **Files changed:** new `src/components/navigation/DrumNav.tsx`, `DrumNav.module.css`, `drum-motion.ts`, `tests/drum-motion.test.mjs`, `tests/navbar-browser.mjs`; removed `src/components/navigation/NavLinks.tsx`; updated `src/components/layout/SiteHeader.tsx`, `src/styles/components.css`, the PL/EN/DE dictionaries, `package.json`, `README.md`, `docs/STATUS.md`, `docs/architecture.md`, and this log. Earlier documentation edits remain in the working tree.
- **Tests and results:** `npm run lint` passed; `npm test` 16/16 passed (9 drum, 7 form); `npm run build` passed including TypeScript. `npm run test:nav` passed against the existing localhost:5000 dev server using bundled Playwright and installed Edge: all 24 navigation URLs, direct list clicks, drag, guarded wheel, keyboard, Back/Forward, replacement during lock, Escape, live reduced-motion changes, locale switching, offer modal, logo, desktop no-JS fallback and responsive mobile menu. Layout checked at 390/768/1024/1215/1216/1280/1440/1920 px; desktop DE, mobile menu and reduced-motion screenshots visually inspected. No browser runtime or console errors. `npm run test:forms` not run: API unchanged; modal integration tested in-browser. `npm ci` and audits not rerun: dependencies unchanged. Physical mobile devices, Firefox/Safari and actual screen-reader output not tested.
- **Security notes:** only existing, trusted navigation hrefs reach `router.push`; wheel handling is local and opt-in. No secrets, form submissions, external messages or deployment actions.
- **Final Git checks:** `git diff --check` and trailing-whitespace checks of all untracked files passed. `git status` shows the navbar work together with the preserved documentation changes. Hashes of `AGENTS.md`, `docs/asset-map.md`, `docs/client-confirmations.md`, `docs/content-source-map.md` and `docs/security.md` match the start of this session; README, STATUS, architecture and the log were extended for this task.
- **Open issues / next steps:** review the selector and combined uncommitted changes. Current verification limits and repository issues remain in `docs/STATUS.md`.

---

## 2026-10-09: Documentation system for AI sessions

- **Task (as requested by the user):** Analyse the repository and its Markdown documentation (read-only first), then introduce a documentation system that works as the project's persistent memory: `CHANGELOG_AI.md`, a restructured `docs/STATUS.md`, a mandatory workflow in `AGENTS.md`, a real README, and corrections of confirmed discrepancies in the other documents. No application code changes, no asset deletions, no implementation of missing features; no commit, push, merge or deployment without consent.
- **Goal:** the next AI session can see what was asked, what was done and the current state without the chat history.
- **Branch / commit:** `docs/ai-workflow`, created from `main` at `b2fdc66`. Not committed (waiting for the user's consent).
- **Done:**
  - Read-only analysis: Git state, all Markdown documents, project structure.
  - `npm ci` (approved by the user).
  - Created this file. The history from the old `docs/STATUS.md` moved here as reconstructed entries.
  - `docs/STATUS.md` rewritten as a current-state snapshot: verification table, completed, in progress, known issues, next steps, waiting for.
  - `AGENTS.md`: mandatory AI workflow added below the Next.js managed block. The block itself is unchanged; `node_modules/next/dist/server/lib/generate-agent-files.js` was checked: `next dev` replaces only the text between the markers. `CLAUDE.md` unchanged (`@AGENTS.md`).
  - `README.md`: create-next-app template replaced with requirements, setup, scripts, assets, environment, deployment pointers and a documentation map.
  - Corrected discrepancies between the docs and the repository:
    - `security.md` §7, `client-confirmations.md` C-36, `architecture.md` §2: the consent module and banner described as ready do not exist; now documented as not implemented.
    - `security.md` §9: `lib/security/errors.ts` → `src/lib/security/log.ts`.
    - `security.md` §1: `npm audit` "in CI" → the repository has no CI.
    - `architecture.md` §3: directory tree matched to the repository (removed `site/`, `components/tables/`, `src/types/`, `public/assets/images`; added `public/photos`, `public/og`, `lib/forms`, scripts, tests, styles).
    - `architecture.md` §4–§5: component examples and import rules matched to real files; the non-existent `Pending` and `SourceRef` types replaced by how open data and sources are actually tracked.
    - `architecture.md` §6: the draft-translation notice is in the footer, not under the header.
    - `architecture.md` §9: the import script also writes `public/photos`.
    - `architecture.md` §11: JobPosting is emitted only with a confirmed `datePosted` (currently withheld, C-52).
    - `architecture.md`, `content-source-map.md`, `asset-map.md`: `../research` and `../source-assets` are outside the repository and absent next to this checkout; source codes appear only in the `source` fields of `history.ts`, not as `// src:` comments.
    - `content-source-map.md`: SH / SH II certificate wording matched to the site text (`noCurrent` in `src/i18n/dictionaries/pl.ts`).
    - `asset-map.md`: removed the `site/` prefix; fixed the contradiction about certificate previews (all 61 scans are published in `public/photos/certificates/`) and removed the matching "rejected" row.
- **Files changed:** `CHANGELOG_AI.md` (new), `AGENTS.md`, `README.md`, `docs/STATUS.md`, `docs/architecture.md`, `docs/security.md`, `docs/asset-map.md`, `docs/content-source-map.md`, `docs/client-confirmations.md`. No application code and no assets changed.
- **Tests and results (2026-10-09, Node v24.16.0):** `npm run lint` passed (no findings); `npm test` 7/7 passed; `npm run build` passed; `npm audit --omit=dev` 0 vulnerabilities; `npm audit` 5 high, dev tooling only; `npm run test:forms` not run (needs a running local server; not affected by a docs-only change); `git diff --check` and a trailing-whitespace check of the new file: clean.
- **Security notes:** the docs now state that no consent mechanism exists and that `npm audit` is not automated. No secrets or environment values added; `.env.example` unchanged.
- **Open issues / next steps:** see `docs/STATUS.md` (Known issues, Next steps).

---

## Before this log (reconstructed, unverified)

Reconstructed on 2026-10-09 from the former `docs/STATUS.md` and the Git history. Authorship, test runs and results of these entries could not be verified. All of this work is contained in the single commit `b2fdc66` "Dodanie strony McKeen Beef" (2026-10-08); the branch `feature/mckeen-audit-fixes` named in the old notes does not exist locally or on `origin`.

### 2026-10-06: Audit fix pass (reconstructed, unverified)

- **Branch named in the old notes:** `feature/mckeen-audit-fixes` (not found).
- **Recorded changes:**
  - Certificate grids without overflow at 1024 px.
  - Contact router opens the answer under the chosen topic on phones.
  - Per-instance form ids.
  - Recoverable `expired` / `tooFast` form outcomes instead of a silent fake success; a visible status for every non-success outcome.
  - Lint clean.
  - Product imagery: no restaurant photos, ćwierci as line art; IFS/BRCGS banner removed; map replaced by a markets/sites ledger.
  - "Eksport" in the main navigation; hamburger flush right.
  - Mobile folds for registration data, the footer group block and the directory.
  - Claims reduced to source wording (biogas project, documentation, SH II, recruitment language).
  - JobPosting withheld without a real publication date.
  - EN/DE privacy drafts prepared but unpublished.
- **New client questions from this pass:** C-40, C-41, C-51 to C-54, C-61, C-62 (`docs/client-confirmations.md`).
- **Tests:** none recorded apart from "lint clean".

### 2026-10-05: Initial site build (reconstructed, unverified)

- **Base:** `88b96fa` "Initial commit from Create Next App" (2026-10-05).
- **Recorded state:** all pages in PL, EN and DE; `npm run build` reported as passing on 2026-10-05; a production crawl of 103 internal URLs reported no broken link; unknown URLs return a real 404 and legacy URLs redirect with 308.
- **Tests:** as reported above; no logs available.
