// Browser regression check for UXA-07: the certificate archive on phones and larger screens, against a
// LOCAL server. Uses an existing Playwright installation, never installs packages; same variables as
// test:nav (PLAYWRIGHT_MODULE, NAV_BROWSER_CHANNEL, NAV_BASE_URL). Read-only.
//
// Phones (320, 375, 390 px): every certificate is one entry: year and standard on one line, result (if
// any) and validity with the archive badge, then the labelled preview and original-PDF rows. Every
// document button is in view without sideways scrolling and at least 44 × 44 px.
// Larger screens (768, 1024, 1440 px): the table is unchanged (header row, cells side by side).
// Everywhere: no horizontal page scroll and no PDF linked twice. At 390 px the table keeps its
// semantics in the accessibility tree, the Tab order follows the visual order with a visible focus
// ring, and without JavaScript the groups open and show the same entries.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Browser checks must use a local server');
const browser = await chromium.launch({ headless: true, channel: process.env.NAV_BROWSER_CHANNEL || undefined });
const errors = [];

const pages = { pl: '/certyfikaty', en: '/en/certificates', de: '/de/zertifikate' };
const text = {
  preview: { pl: 'Podgląd', en: 'Preview', de: 'Vorschau' },
  pdf: { pl: 'Oryginał PDF', en: 'Original PDF', de: 'Original-PDF' },
  expired: { pl: 'Wygasł', en: 'Expired', de: 'Abgelaufen' },
  score: { pl: 'Wynik', en: 'Score', de: 'Ergebnis' },
};
const PHONES = [320, 375, 390];
const WIDE = [768, 1024, 1440];

async function open(width, options = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', ...options });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  return { context, page };
}

/** Geometry of the archive (all groups that are open). */
function measure(page) {
  return page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top, b: r.bottom, w: r.width, h: r.height };
    };
    const rows = [...document.querySelectorAll('.archive details[open] tbody tr')].map((tr) => {
      const [th, ...tds] = tr.children;
      const files = tds[3];
      return {
        id: `${th.textContent.trim()} ${tds[0].textContent.trim()}`,
        cells: [th, ...tds].map(box),
        // The empty result cell is deliberately reduced to 1 px on phones (see .archive__none).
        overflow: [th, ...tds].filter((c) => !c.classList.contains('archive__none') && c.scrollWidth > c.clientWidth + 1).length,
        hasResult: !tds[1].classList.contains('archive__none'),
        fieldLabels: [...tr.querySelectorAll('.archive__label')].map((s) => box(s).w),
        badge: { text: tr.querySelector('.badge--archive')?.textContent.trim(), ...box(tr.querySelector('.badge--archive')) },
        labels: [...files.querySelectorAll('.cert-files__text')].map((s) => ({ text: s.textContent.trim(), ...box(s) })),
        preview: [...files.querySelectorAll('a[data-cert-view]')].map(box),
        pdf: [...files.querySelectorAll('a[type="application/pdf"]')].map(box),
      };
    });
    return {
      vw: document.documentElement.clientWidth,
      pageWidth: document.documentElement.scrollWidth,
      rows,
      wraps: [...document.querySelectorAll('.archive details[open] .table-wrap')].map((w) => ({ scroll: w.scrollWidth, client: w.clientWidth })),
      heads: [...document.querySelectorAll('.archive details[open] thead')].map((h) => box(h).h),
      pdfHrefs: [...document.querySelectorAll('a[type="application/pdf"]')].map((a) => a.getAttribute('href')),
    };
  });
}

const center = (b) => (b.t + b.b) / 2;
const top = (list) => Math.min(...list.map((b) => b.t));
const bottom = (list) => Math.max(...list.map((b) => b.b));

/** Phone layout: one entry per certificate, all document buttons in view and labelled. */
function checkPhone(m, locale, where) {
  assert.ok(m.pageWidth <= m.vw, `${where}: page scrolls sideways (${m.pageWidth} > ${m.vw})`);
  for (const w of m.wraps) assert.ok(w.scroll <= w.client + 1, `${where}: archive area scrolls sideways (${w.scroll} > ${w.client})`);
  for (const row of m.rows) {
    const at = `${where} ${row.id}`;
    const [year, standard, , , files] = row.cells;
    assert.equal(row.overflow, 0, `${at}: text overflows its field`);
    assert.ok(standard.l >= year.r && standard.t < year.b, `${at}: year and standard share the first line`);
    assert.ok(files.t >= year.b - 1, `${at}: files are below the year (entry layout)`);
    assert.ok(row.fieldLabels.length === 2 && row.fieldLabels.every((w, i) => (i === 0 && !row.hasResult) || w > 10), `${at}: result and validity labels shown`);
    if (!row.hasResult) assert.ok(row.cells[2].w <= 1, `${at}: no "–" result line without a result`);
    assert.ok(row.badge.text === text.expired[locale] && row.badge.w > 10, `${at}: archive badge "${text.expired[locale]}" shown`);
    assert.deepEqual(row.labels.map((l) => l.text), [text.preview[locale], text.pdf[locale]], `${at}: document rows labelled`);
    assert.ok(row.labels.every((l) => l.w > 20), `${at}: preview and PDF labels visible`);
    assert.ok(row.preview.length > 0 && row.preview.length === row.pdf.length, `${at}: a preview and a PDF for every language`);
    for (const b of [...row.preview, ...row.pdf]) {
      assert.ok(b.l >= 0 && b.r <= m.vw, `${at}: a document button is off-screen (${Math.round(b.l)}–${Math.round(b.r)} of ${m.vw})`);
      assert.ok(b.w >= 44 && b.h >= 44, `${at}: a document button is ${Math.round(b.w)}×${Math.round(b.h)} px (min 44×44)`);
    }
    assert.ok(bottom(row.preview) <= top(row.pdf) + 1, `${at}: the PDF row is below the preview row`);
    const [preview, pdf] = row.labels;
    assert.ok(center(preview) > top(row.preview) && center(preview) < bottom(row.preview) && preview.r <= Math.min(...row.preview.map((b) => b.l)), `${at}: "${preview.text}" labels its buttons`);
    assert.ok(center(pdf) > top(row.pdf) && center(pdf) < bottom(row.pdf) && pdf.r <= Math.min(...row.pdf.map((b) => b.l)), `${at}: "${pdf.text}" labels its buttons`);
  }
}

/** Larger screens: the unchanged table. */
function checkWide(m, where) {
  assert.ok(m.pageWidth <= m.vw, `${where}: page scrolls sideways (${m.pageWidth} > ${m.vw})`);
  for (const w of m.wraps) assert.ok(w.scroll <= w.client + 1, `${where}: table wider than its area (${w.scroll} > ${w.client})`);
  assert.ok(m.heads.length > 0 && m.heads.every((h) => h > 10), `${where}: table header row shown`);
  for (const row of m.rows) {
    const at = `${where} ${row.id}`;
    for (let i = 0; i < row.cells.length - 1; i++) {
      assert.ok(row.cells[i].r <= row.cells[i + 1].l + 1, `${at}: cells ${i} and ${i + 1} are not side by side`);
      assert.ok(Math.abs(row.cells[i].t - row.cells[i + 1].t) <= 1, `${at}: cells ${i} and ${i + 1} are not on one row`);
    }
    assert.ok(row.fieldLabels.every((w) => w === 0), `${at}: field labels are for phones only`);
    for (const b of [...row.preview, ...row.pdf]) assert.ok(b.l >= 0 && b.r <= m.vw && b.w >= 40 && b.h >= 40, `${at}: document button off-screen or below 40 px`);
  }
}

// 1. Phones and larger screens in PL/EN/DE, every group open.
let rowCount = null;
for (const [locale, path] of Object.entries(pages)) {
  for (const width of [...PHONES, ...WIDE]) {
    const { context, page } = await open(width);
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const closed = await measure(page);
    assert.ok(closed.pageWidth <= closed.vw, `${path} at ${width}px (groups closed): page scrolls sideways`);
    await page.evaluate(() => document.querySelectorAll('details.archive__group').forEach((d) => { d.open = true; }));
    await page.waitForTimeout(150);
    const m = await measure(page);
    const where = `${path} at ${width}px`;
    rowCount ??= m.rows.length;
    assert.ok(m.rows.length > 0 && m.rows.length === rowCount, `${where}: ${m.rows.length} archive entries (expected ${rowCount})`);
    assert.equal(new Set(m.pdfHrefs).size, m.pdfHrefs.length, `${where}: a PDF is linked twice`);
    if (PHONES.includes(width)) checkPhone(m, locale, where);
    else checkWide(m, where);
    await context.close();
  }
}
console.log(`PASS: ${rowCount} archive entries in PL/EN/DE at 320/375/390 px as entries with every document button in view (≥ 44 px, labelled preview and PDF rows), at 768/1024/1440 px as the unchanged table; no sideways page scroll, no PDF linked twice`);

// 2. Semantics at 390 px: the restyled table is still a table for assistive technology.
{
  const { context, page } = await open(390);
  await page.goto(base + pages.pl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelectorAll('details.archive__group').forEach((d) => { d.open = true; }));
  const { tables, entries } = await page.evaluate(() => ({ tables: document.querySelectorAll('.archive table').length, entries: document.querySelectorAll('.archive tbody tr').length }));
  const cdp = await context.newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const live = nodes.filter((n) => !n.ignored);
  const count = (role) => live.filter((n) => n.role?.value === role).length;
  const headers = live.filter((n) => n.role?.value === 'columnheader').map((n) => n.name?.value);
  assert.ok(count('table') >= tables, `archive tables in the accessibility tree: ${count('table')} of ${tables}`);
  assert.ok(count('rowheader') >= entries, `row headers (years): ${count('rowheader')} of ${entries}`);
  assert.ok(count('cell') >= entries * 4, `cells: ${count('cell')} for ${entries} entries`);
  assert.ok(headers.filter((h) => h === text.score.pl).length >= tables, 'the column headers stay available to screen readers');
  const labelsRead = live.filter((n) => n.name?.value === text.score.pl && n.role?.value === 'StaticText').length;
  assert.ok(labelsRead <= tables, 'the visible field labels are hidden from screen readers (no double reading)');
  await context.close();
  console.log(`PASS: at 390 px the archive is still a table for assistive technology (${tables} tables, ${entries} row headers, column headers kept); the visible field labels are not read twice`);
}

// 3. Keyboard at 390 px: Tab order follows the visual order; each button is in view, not covered, with a focus ring.
{
  const { context, page } = await open(390);
  await page.goto(base + pages.pl, { waitUntil: 'networkidle' });
  const summary = page.locator('details.archive__group > summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  const expected = await page.evaluate(() => document.querySelectorAll('details.archive__group')[0].querySelectorAll('tbody a').length);
  const seen = [];
  for (let i = 0; i < expected + 10; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!document.querySelector('details.archive__group').contains(el) || el.tagName !== 'A') return el && document.querySelector('details.archive__group').contains(el) ? 'skip' : null;
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      const s = getComputedStyle(el);
      return {
        y: r.top + window.scrollY,
        x: r.left,
        // 1 px tolerance: Tab may scroll a button to the viewport edge at a fractional position.
        inView: r.top >= -1 && r.bottom <= window.innerHeight + 1 && r.left >= 0 && r.right <= window.innerWidth,
        covered: !(hit === el || el.contains(hit)),
        ring: s.outlineStyle === 'none' ? 0 : parseFloat(s.outlineWidth),
      };
    });
    if (info === null) break;
    if (info !== 'skip') seen.push(info);
  }
  assert.equal(seen.length, expected, `Tab reached ${seen.length} of ${expected} document buttons of the first group`);
  seen.forEach((f, i) => {
    assert.ok(f.inView && !f.covered, `button ${i + 1}: focused but not fully visible`);
    assert.ok(f.ring >= 2, `button ${i + 1}: focus ring ${f.ring}px`);
    if (i) {
      const p = seen[i - 1];
      assert.ok(f.y > p.y + 1 || (Math.abs(f.y - p.y) <= 1 && f.x > p.x), `button ${i + 1}: Tab order jumps against the visual order`);
    }
  });
  await context.close();
  console.log(`PASS: at 390 px Tab visits all ${expected} document buttons of the first group in visual order, each in view, uncovered, with a focus ring of at least 2 px`);
}

// 4. Without JavaScript the groups open natively and the entries look the same.
{
  const { context, page } = await open(390, { javaScriptEnabled: false });
  await page.goto(base + pages.pl, { waitUntil: 'load' });
  await page.locator('details.archive__group > summary').first().click();
  await page.waitForTimeout(150);
  const m = await measure(page);
  assert.ok(m.rows.length > 0, 'no archive entry after opening a group without JavaScript');
  checkPhone(m, 'pl', '/certyfikaty without JavaScript at 390px');
  await context.close();
  console.log('PASS: without JavaScript a group opens and its entries keep every document button in view and labelled');
}

assert.deepEqual(errors, [], `browser runtime errors: ${errors.join(' | ')}`);
console.log('PASS: no browser runtime errors');
await browser.close();
