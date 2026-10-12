// Optional browser checks for the home hero (HERO-002) and intro (INTRO-001).
// Uses an existing Playwright installation, never installs packages; same variables as test:nav
// (PLAYWRIGHT_MODULE, NAV_BROWSER_CHANNEL, NAV_BASE_URL). Run against a local server only.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Browser checks must use a local server');
const browser = await chromium.launch({ headless: true, channel: process.env.NAV_BROWSER_CHANNEL || undefined });
const errors = [];
const titles = { '/': 'Polska wołowina jakościowa', '/en': 'Quality Polish beef', '/de': 'Polnisches Qualitätsrindfleisch' };

async function open(options = {}, { skipIntro = true } = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.addInitScript((skip) => {
    // Opaque-origin frames have no storage.
    try { if (skip) sessionStorage.setItem('mb-intro', '1'); } catch {}
    window.__lcp = [];
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) window.__lcp.push(entry.element?.className || entry.element?.tagName); }).observe({ type: 'largest-contentful-paint', buffered: true });
    window.__cls = 0;
    new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
  }, skipIntro);
  return { context, page };
}
const videoState = (page) => page.locator('.hero__video').getAttribute('data-state');
const introRunning = (page) => page.evaluate(() => document.getAnimations().filter((a) => String(a.animationName || '').startsWith('intro')).length);

try {
  // 1. Layout in every locale and breakpoint: footage only, a very large H1 below the sky, one CTA.
  for (const [width, height] of [[1920, 1080], [1440, 900], [1216, 800], [1024, 768], [768, 1024], [390, 844]]) {
    for (const [path, title] of Object.entries(titles)) {
      const { context, page } = await open({ viewport: { width, height } });
      await page.goto(base + path);
      await page.waitForFunction(() => document.querySelector('.hero__video')?.dataset.state === 'playing', null, { timeout: 20000 });
      // A cold image optimiser can deliver the poster late in development; read LCP once it is painted.
      await page.waitForFunction(() => document.querySelector('.hero__poster')?.complete, null, { timeout: 20000 });
      // Shortly after the fade starts the video grows over the poster's hairline (no static edge).
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero__video')).top === '0px', null, { timeout: 5000 });
      await page.waitForTimeout(200);
      const layout = await page.evaluate(() => {
        const hero = document.querySelector('.hero').getBoundingClientRect();
        const video = document.querySelector('.hero__video').getBoundingClientRect();
        const poster = document.querySelector('.hero__poster').getBoundingClientRect();
        const h1 = document.querySelector('.hero h1');
        const box = h1.getBoundingClientRect();
        const cta = document.querySelectorAll('.hero a, .hero button:not(.hero__toggle)');
        return {
          text: h1.textContent.replace(/­/g, ''),
          lines: Math.round(box.height / parseFloat(getComputedStyle(h1).lineHeight)),
          top: (box.top - hero.top) / hero.height,
          ctas: cta.length,
          ctaInside: cta[0].getBoundingClientRect().bottom <= hero.bottom,
          extra: document.querySelectorAll('.hero p').length,
          overflow: document.documentElement.scrollWidth > innerWidth,
          source: document.querySelector('.hero__video').currentSrc.split('/').pop(),
          covered: ['left', 'top', 'right', 'bottom'].every((side) => Math.abs(video[side] - poster[side]) < 0.5),
          lcp: window.__lcp.at(-1),
          cls: window.__cls,
        };
      });
      const where = `${path} at ${width}px`;
      assert.equal(layout.text, title, where);
      assert.ok(layout.lines >= 1 && layout.lines <= 3, `${where}: ${layout.lines} headline lines`);
      assert.ok(layout.top >= 0.36, `${where}: headline must stay below the sky (${layout.top.toFixed(2)})`);
      assert.equal(layout.ctas, 1, `${where}: exactly one CTA`);
      assert.equal(layout.ctaInside, true, `${where}: CTA inside the hero`);
      assert.equal(layout.extra, 0, `${where}: no other hero copy`);
      assert.equal(layout.overflow, false, `${where}: horizontal overflow`);
      // File names carry a content hash (cache busting); only the variant matters here.
      assert.match(layout.source, width >= 768 ? /^home-hero-1920\./ : /^home-hero-800\./, where);
      assert.equal(layout.covered, true, `${where}: the playing video must cover the whole poster`);
      assert.equal(layout.lcp, 'hero__poster', `${where}: the poster must stay the LCP element`);
      assert.ok(layout.cls < 0.01, `${where}: CLS ${layout.cls}`);
      await context.close();
    }
  }
  console.log('PASS: hero layout, one CTA, poster LCP and video source in PL/EN/DE at 390–1920px');

  // 2. Moved copy is still on the page, in the products and integration-chain introductions.
  {
    const { context, page } = await open();
    await page.goto(base + '/');
    // Polish copy keeps non-breaking spaces after one-letter words.
    const text = async (selector) => (await page.locator(selector).innerText()).replace(/ /g, ' ');
    assert.match(await text('#products-h + .lead'), /^Dostarczamy ćwierci/);
    assert.equal(await text('.chain__intro .eyebrow-plain'), 'Grupa MCKEEN-BEEF, Lisków, od 2009 roku');
    assert.match(await text('.chain__intro .lead'), /^Ubój, rozbiór, pakowanie i sprzedaż w jednej grupie\./);
    assert.ok(await page.locator('.logistics').getByText('+49 2522 832828 12').count() >= 1, 'Sales phone stays in the sales band');
    await context.close();
  }
  console.log('PASS: former hero copy in the products and chain sections; sales phone in the sales band');

  // 2b. Home flow (UX-IA-001 stage 1): section order, the chain's links, sales with markets and
  //     sites in one section, and the contact and cooperation close, in PL/EN/DE.
  {
    const slugs = {
      '/': { contact: '/kontakt', plants: '/zaklady', careers: '/kariera', enquiry: '/zapytaj-o-oferte' },
      '/en': { contact: '/en/contact', plants: '/en/plants', careers: '/en/careers', enquiry: '/en/request-a-quote' },
      '/de': { contact: '/de/kontakt', plants: '/de/standorte', careers: '/de/karriere', enquiry: '/de/angebot-anfragen' },
    };
    const { context, page } = await open();
    for (const [path, s] of Object.entries(slugs)) {
      await page.goto(base + path);
      const hrefs = (selector) => page.locator(selector).evaluateAll((els) => els.map((a) => a.getAttribute('href')));
      assert.deepEqual(await page.locator('main h2[id]').evaluateAll((els) => els.map((h) => h.id)), ['products-h', 'chain-h', 'q-h', 'env-h', 'sales-h', 'coop-h'], `${path}: section order`);
      assert.deepEqual(await hrefs('.chain__links a'), [
        `${s.contact}?temat=sell-cattle#pomoc`, `${s.plants}#zaklad-uboju`, `${s.plants}#zaklad-uboju-2`, `${s.plants}#zaklad-rozbioru`, `${s.plants}#mroznia`, `${s.plants}#sprzedaz`,
      ], `${path}: chain links`);
      assert.deepEqual(await hrefs('.chain__more a'), [s.plants], `${path}: plants link under the chain`);
      assert.equal(await page.locator('.logistics .logistics__markets .ledger').count(), 1, `${path}: markets and sites inside the sales section`);
      assert.deepEqual(await hrefs('.coop__buy a[data-enquiry]'), [s.enquiry], `${path}: buyer path to the enquiry`);
      assert.deepEqual(await hrefs('.coop__path'), [`${s.contact}?temat=sell-cattle#pomoc`, `${s.contact}?temat=supply#pomoc`, `${s.contact}?temat=quality#pomoc`, s.careers], `${path}: other audiences' paths`);
      assert.deepEqual(await hrefs('.coop__paths > a'), [`${s.contact}#dzialy`], `${path}: full directory`);
      assert.equal(await page.locator('.coop').getByText('+49 2522 832828 12').count(), 0, `${path}: no repeated phone numbers in the contact close`);
    }
    await context.close();
  }
  console.log('PASS: home flow in PL/EN/DE: section order, chain links, sales with markets and sites, contact and cooperation paths');

  // 3. Pause / resume (WCAG 2.2.2) and its accessible name.
  {
    const { context, page } = await open();
    await page.goto(base + '/en');
    await page.waitForFunction(() => document.querySelector('.hero__video')?.dataset.state === 'playing');
    const toggle = page.getByRole('button', { name: 'Pause background video' });
    await toggle.click();
    assert.equal(await page.evaluate(() => document.querySelector('.hero__video').paused), true);
    await page.getByRole('button', { name: 'Play background video' }).click();
    await page.waitForFunction(() => !document.querySelector('.hero__video').paused);
    await context.close();
  }
  console.log('PASS: pause and resume with localised accessible names');

  // 4. Fallbacks: reduced motion (nothing loads), network failure, blocked autoplay.
  {
    const { context, page } = await open({ reducedMotion: 'reduce' });
    const requests = [];
    page.on('request', (request) => { if (request.url().endsWith('.mp4')) requests.push(request.url()); });
    await page.goto(base + '/');
    await page.waitForTimeout(1500);
    assert.equal(await videoState(page), 'off');
    assert.equal(requests.length, 0, 'No video request with reduced motion');
    assert.equal(await page.locator('.hero__toggle').count(), 0);
    await context.close();
  }
  {
    const { context, page } = await open();
    await page.route('**/video/*.mp4', (route) => route.abort('failed'));
    await page.goto(base + '/');
    await page.waitForFunction(() => document.querySelector('.hero__video')?.dataset.state === 'off');
    assert.equal(await page.locator('.hero__poster').evaluate((img) => img.complete && img.naturalWidth > 0), true);
    assert.equal(await page.locator('.hero__toggle').count(), 0);
    await context.close();
    // The browser reports the deliberately aborted request; nothing else may fail.
    const aborted = errors.indexOf('Failed to load resource: net::ERR_FAILED');
    if (aborted !== -1) errors.splice(aborted, 1);
  }
  {
    const { context, page } = await open();
    await page.addInitScript(() => {
      // Simulate a browser that refuses autoplay until the user interacts.
      let allowed = false;
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () { return allowed ? play.call(this) : Promise.reject(new DOMException('blocked', 'NotAllowedError')); };
      navigator.getAutoplayPolicy = () => (allowed ? 'allowed-muted' : 'disallowed');
      addEventListener('click', () => { allowed = true; }, true);
    });
    await page.goto(base + '/');
    await page.getByRole('button', { name: 'Odtwórz film w tle' }).click();
    await page.waitForFunction(() => document.querySelector('.hero__video')?.dataset.state === 'playing');
    await context.close();
  }
  console.log('PASS: reduced motion, failed video and blocked autoplay keep the poster');

  // 5. Intro: once per session (not after reload, language switch or client-side return), no CLS.
  {
    const { context, page } = await open({}, { skipIntro: false });
    await page.goto(base + '/', { waitUntil: 'commit' });
    await page.waitForSelector('.hero');
    assert.ok((await introRunning(page)) > 0, 'Intro runs on the first home view of a session');
    await page.waitForFunction(() => document.documentElement.classList.contains('intro-seen'), null, { timeout: 4000 });
    assert.equal(await introRunning(page), 0);
    assert.ok((await page.evaluate(() => window.__cls)) < 0.01);
    await page.locator('nav[data-enhanced] ul a').nth(1).click();
    await page.waitForURL(base + '/produkty');
    await page.locator('.site-head__logo').click();
    await page.waitForURL(base + '/');
    assert.equal(await introRunning(page), 0, 'No replay after client-side navigation');
    await page.reload();
    assert.equal(await introRunning(page), 0, 'No replay after reload');
    await page.locator('.site-head__end > .lang').getByRole('link', { name: 'Deutsch', exact: true }).click();
    await page.waitForURL(base + '/de');
    assert.equal(await introRunning(page), 0, 'No replay after a language switch');
    await context.close();
  }
  {
    const { context, page } = await open({ reducedMotion: 'reduce' }, { skipIntro: false });
    await page.goto(base + '/');
    assert.equal(await introRunning(page), 0, 'No intro with reduced motion');
    await context.close();
  }
  {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(base + '/');
    await page.waitForTimeout(1800);
    const opacity = await page.evaluate(() => ['.hero h1', '.hero__cta', '.site-head', '.site-head__cta'].map((s) => getComputedStyle(document.querySelector(s)).opacity));
    assert.deepEqual(opacity, ['1', '1', '1', '1'], 'Without JavaScript the CSS intro ends with everything visible');
    await context.close();
  }
  console.log('PASS: intro once per session, no replay, reduced motion and no-JS visible');

  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS: no browser runtime errors');
} finally {
  await browser.close();
}
