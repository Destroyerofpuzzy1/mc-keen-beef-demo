// Optional browser checks. Uses an existing Playwright installation, never installs packages.
// PLAYWRIGHT_MODULE may point at a bundled playwright module; NAV_BROWSER_CHANNEL at msedge/chrome.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Browser checks must use a local server');
const browser = await chromium.launch({ headless: true, channel: process.env.NAV_BROWSER_CHANNEL || undefined });
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
// The home intro is tested by test:home. Opaque-origin frames have no storage, hence try/catch.
await context.addInitScript(() => { try { sessionStorage.setItem('mb-intro', '1'); } catch {} });
context.on('page', (page) => {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
});
const page = await context.newPage();
page.setDefaultTimeout(12000);
const nav = page.locator('nav[data-enhanced]');
const tabs = nav.locator('ul a');
const rail = nav.locator('ul');
const next = () => nav.getByRole('button', { name: 'Następna sekcja', exact: true });
const current = () => nav.locator('ul a[aria-current="page"]');
async function settled() {
  await page.waitForFunction(() => document.querySelector('nav[data-enhanced]')?.dataset.phase === 'idle');
}
async function at(path, index) {
  await page.waitForURL(new URL(path, base).href);
  await settled();
  assert.equal(await nav.getAttribute('data-selected'), String(index));
}
const focused = (locator) => locator.evaluate((el) => el === document.activeElement);
// Per-frame carriage samples (centre --x, --lift, --tilt, running animations) around an action,
// until the selector has been idle for 45 frames.
async function traceCarriage(trigger) {
  await page.evaluate(() => {
    const nav = document.querySelector('nav[data-enhanced]');
    const cart = nav.querySelector('ul + span');
    const samples = (window.__carriage = []);
    const tick = () => {
      const style = cart.style;
      samples.push({ phase: nav.dataset.phase, x: parseFloat(style.getPropertyValue('--x')), lift: parseFloat(style.getPropertyValue('--lift')), tilt: parseFloat(style.getPropertyValue('--tilt')), animations: cart.getAnimations().length });
      const quiet = samples.some((s) => s.phase !== 'idle') && samples.length > 45 && samples.slice(-45).every((s) => s.phase === 'idle');
      if (!quiet && samples.length < 400) requestAnimationFrame(tick);
      else window.__carriageDone = true;
    };
    window.__carriageDone = false;
    requestAnimationFrame(tick);
  });
  await trigger();
  await page.waitForFunction(() => window.__carriageDone);
  return page.evaluate(() => window.__carriage);
}
async function screenshot(name) {
  if (!process.env.NAV_SCREENSHOTS) return;
  await mkdir(process.env.NAV_SCREENSHOTS, { recursive: true });
  await page.screenshot({ path: join(process.env.NAV_SCREENSHOTS, `${name}.png`) });
}

try {
  await page.goto(base);
  await settled();
  await at('/', 0);
  assert.equal(await tabs.count(), 9);
  assert.equal(await current().innerText(), 'Strona główna');
  assert.equal(await page.locator('.site-head__logo').getAttribute('href'), '/');
  assert.equal(await page.locator('.site-head__logo').getAttribute('aria-label'), 'McKeen-Beef');
  await screenshot('desktop-home');
  console.log('PASS: all nine pages are real links, homepage current, embroidered logo links home');

  await next().click();
  assert.equal(new URL(page.url()).pathname, '/', 'No navigation before the lock');
  await at('/produkty', 1);
  await page.goBack();
  await at('/', 0);
  await page.goForward();
  await at('/produkty', 1);
  console.log('PASS: arrow → lock → URL, Back/Forward synchronization');

  // Any tab can be chosen directly; the carriage travels there and locks before navigating. From
  // Produkty to Kontakt it runs straight along the rail (formerly the shortest arc took the
  // Contact/Home seam), swings a few pixels past the tab, rests exactly on it, lifts and leans
  // only while moving, and the lock clicks.
  const run = await traceCarriage(async () => {
    await tabs.nth(8).click();
    assert.equal(new URL(page.url()).pathname, '/produkty', 'No navigation before the lock');
  });
  await at('/kontakt', 8);
  const peak = run.reduce((best, sample, i) => (sample.x > run[best].x ? i : best), 0);
  const rest = run.at(-1);
  const kontakt = await tabs.nth(8).evaluate((a) => {
    const box = a.getBoundingClientRect();
    return box.left + box.width / 2 - a.closest('ul').parentElement.getBoundingClientRect().left;
  });
  assert.ok(run.slice(1, peak + 1).every((sample, i) => sample.x >= run[i].x - 0.01), 'The carriage travels straight to a far tab');
  const swing = run[peak].x - rest.x;
  assert.ok(swing >= 1 && swing <= 8, `Detent swing past the tab: ${swing.toFixed(2)} px`);
  assert.ok(Math.abs(rest.x - kontakt) < 0.5, 'The carriage rests on the chosen tab');
  const moving = run.filter((sample) => sample.phase !== 'idle');
  assert.ok(moving.some((sample) => sample.lift > 0.3) && moving.some((sample) => Math.abs(sample.tilt) > 0.2), 'Lifts and leans while moving');
  assert.deepEqual([rest.lift, rest.tilt], [0, 0], 'No lift or lean at rest');
  assert.ok(run.some((sample, i) => i > peak && sample.phase === 'idle' && sample.animations > 0), 'The lock clicks');
  await tabs.nth(2).click();
  await at('/jakosc', 2);
  console.log('PASS: direct click on any tab, straight travel, detent swing, lift/lean, lock click, URL');

  // Keyboard: Tab reaches the current tab; arrows preview and move focus; Enter opens.
  await current().focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await settled();
  assert.equal(new URL(page.url()).pathname, '/jakosc');
  assert.equal(await nav.getAttribute('data-selected'), '4');
  assert.equal(await focused(tabs.nth(4)), true, 'Focus follows the selector');
  assert.equal(await nav.getByRole('status').innerText(), 'Eksport');
  await page.keyboard.press('Enter');
  await at('/sprzedaz-eksport', 4);
  await current().focus();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await at('/kontakt', 8);
  await current().focus();
  await page.keyboard.press('Home');
  await settled();
  assert.equal(new URL(page.url()).pathname, '/kontakt');
  assert.equal(await focused(tabs.nth(0)), true);
  assert.equal(await tabs.nth(0).getAttribute('aria-current'), null, 'Preview is not the current URL');
  await page.keyboard.press('Enter');
  await at('/', 0);
  assert.equal(await current().innerText(), 'Strona główna');
  await current().focus();
  await page.keyboard.press('Tab');
  assert.equal(await focused(nav.getByRole('button', { name: 'Następna sekcja', exact: true })), true, 'One tab stop for the nine links');
  console.log('PASS: keyboard preview, roving focus, Enter, Home/End, Tab order');

  await page.goto(`${base}/produkty`);
  await settled();
  const historyStart = await page.evaluate(() => history.length);
  await next().click();
  await page.waitForTimeout(260); // interrupt during lock dwell
  await next().click();
  await at('/certyfikaty', 3);
  assert.equal(await page.evaluate(() => history.length), historyStart + 1, 'Only the last choice creates history');
  await next().click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  assert.equal(new URL(page.url()).pathname, '/certyfikaty');
  console.log('PASS: replacement selection and Escape cancel pending navigation');

  // Vertical wheel over the selector scrolls the page; a sideways swipe turns the selector.
  await page.evaluate(() => scrollTo(0, 0));
  await rail.hover();
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate(() => scrollY > 0));
  assert.equal(new URL(page.url()).pathname, '/certyfikaty');
  await page.evaluate(() => scrollTo(0, 0));
  await rail.hover();
  await page.mouse.wheel(180, 0);
  await at('/sprzedaz-eksport', 4);
  assert.equal(await page.evaluate(() => scrollY), 0);
  console.log('PASS: ordinary page scroll, sideways wheel turns the selector');

  await page.goto(`${base}/produkty`);
  await settled();
  const from = await tabs.nth(1).boundingBox();
  const to = await tabs.nth(2).boundingBox();
  const step = (to.x + to.width / 2 - (from.x + from.width / 2)) / 5;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 5; i++) {
    await page.mouse.move(from.x + from.width / 2 + i * step, from.y + from.height / 2);
    await page.waitForTimeout(40);
  }
  assert.equal(new URL(page.url()).pathname, '/produkty');
  await page.mouse.up();
  await at('/jakosc', 2);
  console.log('PASS: horizontal drag of the carriage, release, snap and no click after drag');

  const routes = {
    pl: ['/', '/produkty', '/jakosc', '/certyfikaty', '/sprzedaz-eksport', '/zaklady', '/o-firmie', '/kariera', '/kontakt'],
    en: ['/en', '/en/products', '/en/quality', '/en/certificates', '/en/sales-export', '/en/plants', '/en/about-us', '/en/careers', '/en/contact'],
    de: ['/de', '/de/produkte', '/de/qualitaet', '/de/zertifikate', '/de/vertrieb-export', '/de/standorte', '/de/ueber-uns', '/de/karriere', '/de/kontakt'],
  };
  const labels = {
    pl: ['Strona główna', 'Produkty', 'Jakość', 'Certyfikaty', 'Eksport', 'Zakłady', 'O firmie', 'Kariera', 'Kontakt'],
    en: ['Home', 'Products', 'Quality', 'Certificates', 'Export', 'Plants', 'About us', 'Careers', 'Contact'],
    de: ['Startseite', 'Produkte', 'Qualität', 'Zertifikate', 'Export', 'Standorte', 'Über uns', 'Karriere', 'Kontakt'],
  };
  for (const [locale, paths] of Object.entries(routes)) {
    await page.goto(`${base}${paths[0]}`);
    await settled();
    assert.deepEqual(await tabs.evaluateAll((els) => els.map((el) => el.getAttribute('href'))), paths);
    assert.deepEqual(await tabs.evaluateAll((els) => els.map((el) => el.textContent.trim())), labels[locale]);
    for (let index = 0; index < paths.length; index++) {
      await tabs.nth(index).click();
      await at(paths[index], index);
      assert.equal(await current().getAttribute('href'), paths[index]);
      await page.reload();
      await at(paths[index], index);
      assert.equal(await current().getAttribute('href'), paths[index], 'Direct entry must match the URL');
    }
    // Contact → Home → Contact: the arrows wrap around the rail in both directions.
    const arrows = nav.locator('button[aria-label]');
    await arrows.nth(1).click();
    assert.equal(new URL(page.url()).pathname, paths[8], 'Home waits for the final lock');
    await at(paths[0], 0);
    await page.goBack();
    await at(paths[8], 8);
    await page.goForward();
    await at(paths[0], 0);
    await arrows.nth(0).click();
    await at(paths[8], 8);
    console.log(`PASS: all nine ${locale.toUpperCase()} routes, direct visits, current page and Contact/Home wrap with history`);
  }

  await page.goto(`${base}/en/privacy-policy`);
  await settled();
  assert.equal(await current().count(), 0, 'Locale root must not mark unrelated pages as Home');
  await page.goto(`${base}/de/kontakt`);
  await at('/de/kontakt', 8);

  // Language switch keeps the same route; check the layout with every locale's labels.
  await page.locator('.site-head__end > .lang').getByRole('link', { name: 'English', exact: true }).click();
  await at('/en/contact', 8);
  await page.locator('.site-head__end > .lang').getByRole('link', { name: 'Deutsch', exact: true }).click();
  await at('/de/kontakt', 8);
  await tabs.nth(0).click();
  await at('/de', 0);
  for (const path of ['/', '/en', '/de']) {
    await page.goto(base + path);
    await settled();
    for (const width of [1216, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1000 });
      await settled();
      const geometry = await page.locator('.site-head__row').evaluate((row) => {
        const [logo, drum, end] = [...row.children].map((el) => el.getBoundingClientRect());
        const links = [...row.querySelectorAll(':scope > nav ul a')];
        return {
          fits: logo.right <= drum.left && drum.right <= end.left,
          overflow: document.documentElement.scrollWidth > innerWidth,
          truncated: links.filter((a) => a.scrollWidth > a.clientWidth + 0.5).map((a) => a.textContent),
          inside: links.every((a) => { const b = a.getBoundingClientRect(); return b.left >= drum.left && b.right <= drum.right; }),
          font: parseFloat(getComputedStyle(links[0]).fontSize),
          gaps: [drum.left - logo.right, end.left - drum.right],
          headerHeight: document.querySelector('.site-head').getBoundingClientRect().height,
        };
      });
      const where = `${path} at ${width}px`;
      assert.equal(geometry.fits, true, `Header overlaps ${where}`);
      assert.equal(geometry.overflow, false, `Horizontal overflow ${where}`);
      assert.deepEqual(geometry.truncated, [], `Truncated labels ${where}`);
      assert.equal(geometry.inside, true, `A tab sticks out of the selector ${where}`);
      assert.ok(geometry.font >= 15.5, `Label font ${geometry.font}px ${where}`);
      assert.ok(geometry.gaps.every((gap) => gap >= 16), `Too close to logo/CTA ${where}`);
      assert.equal(geometry.headerHeight, 104, `Header height ${where}`);
      if (path === '/de') await screenshot(`desktop-de-${width}`);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  console.log('PASS: language switch; all nine labels fit, untruncated, ≥ 15.5px, 104px header at 1216/1280/1440/1920px in PL/EN/DE');

  await page.goto(`${base}/produkty`);
  await settled();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await next().click();
  await at('/jakosc', 2);
  assert.equal(await nav.getAttribute('data-phase'), 'idle');
  const still = await nav.locator('ul + span').evaluate((cart) => ({
    lift: cart.style.getPropertyValue('--lift'), tilt: cart.style.getPropertyValue('--tilt'), animations: cart.getAnimations({ subtree: true }).length,
  }));
  assert.deepEqual(still, { lift: '0.000', tilt: '0.000', animations: 0 }, 'Reduced motion: no lift, lean or lock click');
  await screenshot('reduced-motion');
  await current().focus();
  await page.keyboard.press('Home');
  assert.equal(new URL(page.url()).pathname, '/jakosc');
  await page.keyboard.press('Enter');
  await at('/', 0);
  await tabs.nth(1).click();
  await at('/produkty', 1);
  await next().click();
  await at('/jakosc', 2);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await next().click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(450);
  assert.equal(new URL(page.url()).pathname, '/jakosc', 'Preference change cancels pending navigation');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  console.log('PASS: reduced motion and live preference change');

  await page.locator('.site-head__cta').click();
  assert.equal(await page.locator('dialog.dlg').evaluate((el) => el.open), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog.dlg').evaluate((el) => el.open), false);
  await page.locator('.site-head__logo').click();
  await at('/', 0);
  console.log('PASS: enquiry modal, Escape, logo home link');

  for (const width of [390, 768, 1024, 1215]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(await nav.isVisible(), false);
    assert.equal(await page.locator('.mmenu__toggle').isVisible(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mmenu__toggle').click();
  assert.equal(await page.locator('.mmenu__panel').isVisible(), true);
  assert.equal(await page.locator('.mmenu__list a').count(), 8);
  await screenshot('mobile-menu');
  await page.locator('.mmenu__list a').nth(2).click();
  await page.waitForURL(`${base}/certyfikaty`);
  assert.equal(await page.locator('.mmenu__panel').isVisible(), false);
  await page.locator('.mmenu__toggle').click();
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.mmenu__toggle').evaluate((el) => el === document.activeElement), true);
  await screenshot('mobile');
  console.log('PASS: mobile/tablet traditional menu (logo for home, eight links), navigation, Escape/focus');

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  const plain = await nojs.newPage();
  await plain.goto(base);
  const links = plain.locator('.site-head__row > nav ul a');
  assert.equal(await links.count(), 9);
  await links.nth(2).click();
  await plain.waitForURL(`${base}/jakosc`);
  await plain.locator('.site-head__row > nav ul a').nth(0).click();
  await plain.waitForURL(base + '/');
  await nojs.close();
  console.log('PASS: navigation without JavaScript (plain links)');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS: no browser runtime errors');
} finally {
  await browser.close();
}
