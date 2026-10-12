// Browser regression check for UXA-01: unknown URLs must not start a prefetch loop. Runs against a
// LOCAL production build (prefetching is off in development). Uses an existing Playwright
// installation, never installs packages; same variables as test:nav (PLAYWRIGHT_MODULE,
// NAV_BROWSER_CHANNEL, NAV_BASE_URL). Read-only.
//
// Each page is watched for the same short window after load, then its tab is closed at once. The
// check counts identical RSC requests (same URL and the same prefetch headers): a normal page asks
// for each link's route data once, while the bug repeated the same few requests hundreds of times a
// second. Totals are printed for comparison but are not the pass criterion.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Browser checks must use a local server');
const WINDOW_MS = 3000;
const MAX_REPEATS = 3;
const browser = await chromium.launch({ headless: true, channel: process.env.NAV_BROWSER_CHANNEL || undefined });
const errors = [];
const titles = { pl: 'Nie znaleźliśmy tej strony', en: 'We could not find this page', de: 'Diese Seite wurde nicht gefunden' };

/** Identical requests share the URL (without the cache-busting `_rsc` value) and the router headers. */
function requestKey(request) {
  const url = new URL(request.url());
  url.searchParams.delete('_rsc');
  const h = request.headers();
  return [url.pathname + url.search, h['next-router-prefetch'] ?? '', h['next-router-segment-prefetch'] ?? '', h['next-router-state-tree'] ?? ''].join(' | ');
}

/** Counts RSC requests per key until `stop()` is called. */
function watch(page) {
  const counts = new Map();
  let on = true;
  page.on('request', (request) => {
    if (!on || !request.headers()['rsc']) return;
    const key = requestKey(request);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return {
    stop() {
      on = false;
      const total = [...counts.values()].reduce((a, b) => a + b, 0);
      const [worstKey, worst] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? ['-', 0];
      return { total, worst, worstUrl: worstKey.split(' | ')[0] };
    },
  };
}

async function open() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => { try { sessionStorage.setItem('mb-intro', '1'); } catch {} });
  return { context, page };
}

/** Opens `path`, watches the window, closes the tab. Returns status, heading and request counts. */
async function measure(path) {
  const { context, page } = await open();
  try {
    const watcher = watch(page);
    const response = await page.goto(base + path, { waitUntil: 'load' });
    await page.waitForTimeout(WINDOW_MS);
    const result = watcher.stop();
    const h1 = (await page.locator('h1').first().textContent()).trim();
    return { status: response.status(), url: new URL(page.url()).pathname, h1, ...result };
  } finally {
    await context.close();
  }
}

const rows = [];
const report = (label, r) => {
  rows.push(`  ${label.padEnd(34)} status ${r.status}  RSC requests in ${WINDOW_MS / 1000} s: ${String(r.total).padStart(4)}  most repeated: ${r.worst}× ${r.worstUrl}`);
};

try {
  // 1. Unknown URLs in each language, including old-site and nested shapes: 404, localised page, no loop.
  const unknown = [
    ['pl', '/nie-ma-takiej-strony'],
    ['en', '/en/not-there'],
    ['de', '/de/gibt-es-nicht'],
    ['en', '/en/p/news'],
    ['de', '/de/p/aktuelles'],
    ['en', '/en/kontakt/xyz'],
  ];
  for (const [locale, path] of unknown) {
    const r = await measure(path);
    report(`404 ${path}`, r);
    assert.equal(r.status, 404, `${path}: HTTP 404`);
    assert.equal(r.url, path, `${path}: the address stays (no redirect)`);
    assert.equal(r.h1, titles[locale], `${path}: localised 404 page`);
    assert.ok(r.worst <= MAX_REPEATS, `${path}: the same request was sent ${r.worst} times (${r.worstUrl})`);
  }
  console.log('PASS: unknown PL/EN/DE URLs answer 404 with the localised page and no repeated requests');

  // 2. Existing pages: unchanged behaviour.
  for (const path of ['/produkty', '/en/products', '/de/produkte', '/en', '/de']) {
    const r = await measure(path);
    report(`page ${path}`, r);
    assert.equal(r.status, 200, `${path}: HTTP 200`);
    assert.ok(r.worst <= MAX_REPEATS, `${path}: the same request was sent ${r.worst} times (${r.worstUrl})`);
  }
  console.log('PASS: existing PL/EN/DE pages answer 200 without repeated requests');

  // 3. From a 404 page the user reaches existing pages with a client-side click, and the session stays
  //    quiet there. The bug carried over: after "Home" the next page kept looping, because the wrong
  //    route pattern learned on the 404 page stays in the client router for the whole session.
  const flows = [
    ['/en/not-there', '/en', 'Quality Polish beef'],
    ['/en/not-there', '/en/products', 'Products'],
    ['/de/gibt-es-nicht', '/de', 'Polnisches Qualitätsrindfleisch'],
    ['/de/gibt-es-nicht', '/de/produkte', 'Produkte'],
  ];
  for (const [path, linkHref, expectedH1] of flows) {
    const { context, page } = await open();
    try {
      await page.goto(base + path, { waitUntil: 'load' });
      await page.locator(`main a[href="${linkHref}"]`).click();
      await page.waitForURL(base + linkHref);
      const watcher = watch(page);
      await page.waitForTimeout(WINDOW_MS);
      const r = { status: 200, ...watcher.stop() };
      report(`${path} → ${linkHref}`, r);
      // The DE heading carries a soft hyphen for line breaking.
      const h1 = (await page.locator('h1').first().textContent()).replace(/­/g, '').trim();
      assert.equal(h1, expectedH1, `${path}: the link leads to ${linkHref}`);
      assert.ok(r.worst <= MAX_REPEATS, `${linkHref} after ${path}: the same request was sent ${r.worst} times (${r.worstUrl})`);
    } finally {
      await context.close();
    }
  }
  console.log('PASS: 404 links lead to existing pages (home and a section); no repeated requests there afterwards');

  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS: no browser runtime errors');
} finally {
  console.log(rows.join('\n'));
  await browser.close();
}
