// Browser checks for the language switch context (UXA-02) and the form result page (GAP-14),
// against a LOCAL server. Uses an existing Playwright installation, never installs packages; same
// variables as test:nav (PLAYWRIGHT_MODULE, NAV_BROWSER_CHANNEL, NAV_BASE_URL).
//
// Nothing is delivered: the only form posts are no-JavaScript submissions that the server stops
// before delivery (a filled honeypot gets a fake success, an expired fill-time stamp gets
// `expired`). They give genuine server results without sending anything.
//
// The suite adapts to the server (SECURITY-001): with a usable RATE_LIMIT_SALT the results are
// signed and their flows are checked; without one nothing may be signed and every result page
// must stay neutral (fail closed). Run it both ways. In both, a result forged with the public
// development salt from src/lib/env.ts must be neutral.
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Browser checks must use a local server');
const browser = await chromium.launch({ headless: true, channel: process.env.NAV_BROWSER_CHANNEL || undefined });
const errors = [];
const posts = [];

const text = {
  sent: { pl: 'Dziękujemy. Wiadomość została wysłana.', en: 'Thank you. Your message has been sent.', de: 'Vielen Dank. Ihre Nachricht wurde gesendet.' },
  failed: { pl: 'Nie udało się wysłać formularza.', en: 'The form could not be sent.', de: 'Das Formular konnte nicht gesendet werden.' },
  unknown: { pl: 'Brak wyniku do wyświetlenia', en: 'No result to show', de: 'Kein Ergebnis vorhanden' },
};
const sentPath = { pl: '/wyslano', en: '/en/sent', de: '/de/gesendet' };
const contactPath = { pl: '/kontakt', en: '/en/contact', de: '/de/kontakt' };

async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', ...options });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (r) => { if (r.method() === 'POST') posts.push(r.url()); });
  await page.addInitScript(() => { try { sessionStorage.setItem('mb-intro', '1'); } catch {} });
  return { context, page };
}
/** The header language link to `locale` (the desktop switch; the mobile menu renders the same links). */
const langHref = (page, locale) => page.locator(`header .site-head__end > .lang a[hreflang="${locale}"]`).getAttribute('href');
const h1 = async (page) => (await page.locator('h1').first().textContent()).replace(/­/g, '').trim();
const query = (url) => Object.fromEntries(new URL(url, base).searchParams);
/** A success "signed" with the public development salt, as anyone reading the source could make it. */
function forgedWithPublicSalt() {
  const fallback = readFileSync(new URL('../src/lib/env.ts', import.meta.url), 'utf8').match(/RATE_LIMIT_SALT\)\s*\?\?\s*'([^']*)'/)?.[1];
  assert.ok(fallback !== undefined, 'the public fallback is where this test expects it');
  const t = String(Math.floor(Date.now() / 1000));
  const key = createHmac('sha256', fallback).update('mckeen-beef:form-result:v1').digest();
  const sig = createHmac('sha256', key).update(`enquiry|ok|${t}`).digest('base64url').slice(0, 22);
  return `?form=enquiry&status=ok&t=${t}&sig=${sig}`;
}

/** A genuine signed result from a no-JS submission of the offer form that stops before delivery. */
async function signedResult(kind) {
  // Own client address per submission (as in test:forms), so the per-IP rate limit does not interfere.
  const ip = `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250) + 1}`;
  const { context, page } = await open({ javaScriptEnabled: false, extraHTTPHeaders: { 'X-Forwarded-For': ip } });
  try {
    await page.goto(base + '/zapytaj-o-oferte', { waitUntil: 'load' });
    await page.fill('input[name="person"]', 'Test Audyt');
    await page.fill('input[name="company"]', 'Audit Test');
    await page.fill('input[name="email"]', 'audit@example.invalid');
    await page.fill('input[name="country"]', 'Polska');
    await page.check('input[name="products"][value="elementy"]');
    await page.check('input[name="consent"]');
    // Bots fill the hidden honeypot and get a fake success; a stamp from 1970 is an expired session.
    if (kind === 'ok') await page.evaluate(() => { document.querySelector('input[name="website"]').value = 'x'; });
    else await page.evaluate(() => { document.querySelector('input[name="startedAt"]').value = '1000'; });
    await Promise.all([page.waitForURL(/\/wyslano\?/), page.locator('form button[type="submit"]').click()]);
    return new URL(page.url()).search;
  } finally {
    await context.close();
  }
}

try {
  // 1. Results without a signature are "unknown": no claim of success or failure (GAP-14).
  for (const [locale, path] of Object.entries(sentPath)) {
    for (const q of ['', '?form=enquiry&status=ok', '?form=careers&status=error', '?form=enquiry&status=ok&t=1&sig=AAAAAAAAAAAAAAAAAAAAAA', forgedWithPublicSalt()]) {
      const { context, page } = await open();
      const res = await page.goto(base + path + q, { waitUntil: 'load' });
      assert.equal(res.status(), 200, `${path}${q}: 200`);
      assert.equal(await h1(page), text.unknown[locale], `${path}${q}: neutral heading`);
      assert.ok(await page.locator('main a[href^="tel:"], main a[href^="mailto:"]').count() > 0, `${path}${q}: direct contacts`);
      assert.ok(await page.locator('main a[href="/"], main a[href="/en"], main a[href="/de"]').count() > 0, `${path}${q}: way home`);
      await context.close();
    }
  }
  console.log('PASS: a result page without a valid signature is neutral in PL/EN/DE, with contacts and links (also one forged with the public development salt)');

  // 2. Signed success and error survive PL → EN → DE → PL and a refresh; tampering makes them neutral.
  const before = posts.length;
  const ok = await signedResult('ok');
  const failed = await signedResult('error');
  // Does this server sign results (a usable RATE_LIMIT_SALT)? Without one it must sign nothing.
  const signing = 'sig' in query(ok);
  assert.deepEqual(Object.keys(query(ok)).sort(), signing ? ['form', 'sig', 'status', 't'] : ['form', 'status'], 'result parameters');
  assert.equal('sig' in query(failed), signing, 'success and error are signed alike');
  assert.equal(query(ok).status, 'ok');
  assert.equal(query(failed).status, 'expired');
  assert.equal(posts.length - before, 2, 'exactly the two test submissions were posted');
  // With signing the outcome is stated; without it every result page stays neutral (fail closed).
  const shown = { ok: signing ? text.sent : text.unknown, failed: signing ? text.failed : text.unknown };
  for (const [search, expected] of [[ok, shown.ok], [failed, shown.failed]]) {
    const { context, page } = await open();
    await page.goto(base + sentPath.pl + search, { waitUntil: 'load' });
    assert.equal(await h1(page), expected.pl, 'PL result');
    const posted = posts.length;
    for (const locale of ['en', 'de', 'pl']) {
      const target = await langHref(page, locale);
      assert.equal(new URL(target, base).pathname, sentPath[locale], `switch to ${locale}: result page`);
      assert.deepEqual(query(target), query(search), `switch to ${locale}: the signed result travels`);
      await Promise.all([page.waitForURL((u) => u.pathname === sentPath[locale]), page.locator(`header .site-head__end > .lang a[hreflang="${locale}"]`).click()]);
      assert.equal(await h1(page), expected[locale], `${locale}: same result`);
    }
    await page.reload({ waitUntil: 'load' });
    assert.equal(await h1(page), expected.pl, 'refresh keeps the result');
    assert.equal(posts.length, posted, 'switching language and refreshing post nothing');
    await context.close();
  }
  {
    // Without JavaScript (the result page's main audience) the server-rendered links carry it too.
    const { context, page } = await open({ javaScriptEnabled: false });
    await page.goto(base + sentPath.pl + ok, { waitUntil: 'load' });
    for (const locale of ['en', 'de']) assert.deepEqual(query(await langHref(page, locale)), query(ok), `no-JS: result to ${locale}`);
    await Promise.all([page.waitForURL((u) => u.pathname === sentPath.en), page.locator('header .site-head__end > .lang a[hreflang="en"]').click()]);
    assert.equal(await h1(page), shown.ok.en, 'no-JS: same result in EN');
    await context.close();
  }
  {
    const tampered = new URLSearchParams(ok);
    tampered.set('status', 'unavailable');
    const { context, page } = await open();
    await page.goto(`${base}${sentPath.en}?${tampered}`, { waitUntil: 'load' });
    assert.equal(await h1(page), text.unknown.en, 'an altered signed result is neutral');
    await context.close();
  }
  console.log(signing
    ? 'PASS: signed success and error stay the same through PL → EN → DE → PL and a refresh; nothing is re-sent'
    : 'PASS: server without a usable RATE_LIMIT_SALT signs nothing; success and error pages stay neutral through PL → EN → DE → PL and a refresh (fail closed); nothing is re-sent');

  // 3. Contact topic: carried by the switch (also without JavaScript) and kept after a click.
  for (const js of [true, false]) {
    const { context, page } = await open({ javaScriptEnabled: js });
    await page.goto(`${base}${contactPath.pl}?temat=quality#pomoc`, { waitUntil: 'load' });
    for (const locale of ['en', 'de']) {
      assert.equal(await langHref(page, locale), `${contactPath[locale]}?temat=quality#pomoc`, `${js ? 'JS' : 'no-JS'}: topic to ${locale}`);
    }
    await context.close();
  }
  {
    const { context, page } = await open();
    await page.goto(base + contactPath.pl, { waitUntil: 'load' });
    await page.locator('#pomoc button', { hasText: 'Transport' }).click();
    await page.waitForFunction(() => new URLSearchParams(location.search).get('temat') === 'transport');
    assert.equal(await langHref(page, 'en'), '/en/contact?temat=transport#pomoc', 'a chosen topic updates the switch');
    await Promise.all([page.waitForURL(/\/en\/contact\?temat=transport/), page.locator('header .site-head__end > .lang a[hreflang="en"]').click()]);
    assert.equal(await page.locator('#pomoc button[aria-expanded="true"]').textContent(), 'Transport', 'EN opens the same topic');
    await Promise.all([page.waitForURL(/\/de\/kontakt\?temat=transport/), page.locator('header .site-head__end > .lang a[hreflang="de"]').click()]);
    assert.equal(await page.locator('#pomoc button[aria-expanded="true"]').textContent(), 'Transport', 'DE opens the same topic');
    await page.reload({ waitUntil: 'load' });
    assert.equal(await page.locator('#pomoc button[aria-expanded="true"]').textContent(), 'Transport', 'a refresh keeps the topic');
    await context.close();
  }
  console.log('PASS: the contact topic travels through PL/EN/DE (with and without JavaScript) and survives a refresh');

  // 4. Anchors, the offer product and plain pages; nothing unrelated or unsafe is carried.
  {
    const { context, page } = await open();
    await page.goto(base + '/produkty#elementy', { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('header .site-head__end > .lang a[hreflang="en"]').getAttribute('href').endsWith('#elementy'));
    await page.goto(base + '/zaklady', { waitUntil: 'load' });
    await page.locator('main a[href="#zaklad-rozbioru"]').first().click();
    await page.locator('header .site-head__end > .lang a[hreflang="de"]').hover();
    assert.equal(await langHref(page, 'de'), '/de/standorte#zaklad-rozbioru', 'an in-page jump is carried');
    await Promise.all([page.waitForURL(/\/de\/standorte#zaklad-rozbioru/), page.locator('header .site-head__end > .lang a[hreflang="de"]').click()]);
    assert.equal(await page.locator('#zaklad-rozbioru').count(), 1, 'the anchor exists in DE');
    await page.goto(base + '/zapytaj-o-oferte?produkt=elementy', { waitUntil: 'load' });
    assert.equal(await langHref(page, 'en'), '/en/request-a-quote?produkt=elementy', 'the offer product travels');
    await Promise.all([page.waitForURL(/request-a-quote/), page.locator('header .site-head__end > .lang a[hreflang="en"]').click()]);
    assert.equal(await page.locator('main input[name="products"][value="elementy"]').isChecked(), true, 'EN form has the product ticked');
    const plain = [
      ['/jakosc?temat=quality&produkt=elementy&utm_source=x', 'en', '/en/quality'],
      ['/en/products?form=enquiry&status=ok', 'de', '/de/produkte'],
      ['/kontakt?temat=%2F%2Fevil.example&next=https://evil.example', 'en', '/en/contact'],
      ['/de/zertifikate', 'pl', '/certyfikaty'],
    ];
    for (const [from, locale, expected] of plain) {
      await page.goto(base + from, { waitUntil: 'load' });
      assert.equal(await langHref(page, locale), expected, `${from}: nothing unrelated or unsafe is carried`);
    }
    await context.close();
  }
  console.log('PASS: anchors and the offer product travel; plain pages, foreign parameters and unsafe values do not');

  // 5. Phone: the mobile menu carries the same context.
  {
    const { context, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.goto(`${base}${sentPath.pl}${ok}`, { waitUntil: 'load' });
    await page.getByRole('button', { name: /menu/i }).first().click();
    const menuLink = page.locator('.mmenu .lang a[hreflang="de"]');
    assert.deepEqual(query(await menuLink.getAttribute('href')), query(ok), 'phone menu carries the result');
    await Promise.all([page.waitForURL((u) => u.pathname === sentPath.de), menuLink.click()]);
    assert.equal(await h1(page), shown.ok.de, 'phone: same result in DE');
    await context.close();
  }
  console.log('PASS: on phones the menu language links carry the same context');

  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS: no browser runtime errors');
} finally {
  await browser.close();
}
