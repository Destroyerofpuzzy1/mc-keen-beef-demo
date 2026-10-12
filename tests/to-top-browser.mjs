// Browser checks for the floating "back to top" ear tag (UX-001), against a LOCAL server.
// Uses an existing Playwright installation, never installs packages; same variables as test:nav
// (PLAYWRIGHT_MODULE, NAV_BROWSER_CHANNEL, NAV_BASE_URL). Read-only: nothing is submitted.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Browser checks must use a local server');
const browser = await chromium.launch({ headless: true, channel: process.env.NAV_BROWSER_CHANNEL || undefined });
const errors = [];
const TAG = 'main a[href="#top"]';
const labels = { pl: 'Powrót na górę', en: 'Back to top', de: 'Zurück nach oben' };
const routes = {
  pl: ['/', '/produkty', '/jakosc', '/certyfikaty', '/zaklady', '/o-firmie', '/sprzedaz-eksport', '/kariera', '/kontakt', '/zapytaj-o-oferte', '/biogazownia', '/strategia-podatkowa', '/polityka-prywatnosci'],
  en: ['/en', '/en/products', '/en/quality', '/en/certificates', '/en/plants', '/en/about-us', '/en/sales-export', '/en/careers', '/en/contact', '/en/request-a-quote', '/en/biogas-plant', '/en/tax-strategy', '/en/privacy-policy'],
  de: ['/de', '/de/produkte', '/de/qualitaet', '/de/zertifikate', '/de/standorte', '/de/ueber-uns', '/de/vertrieb-export', '/de/karriere', '/de/kontakt', '/de/angebot-anfragen', '/de/biogasanlage', '/de/steuerstrategie', '/de/datenschutz'],
};

async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', ...options });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  // The home intro is not under test here.
  await page.addInitScript(() => { try { sessionStorage.setItem('mb-intro', '1'); } catch {} });
  return { context, page };
}
const shown = (page) => page.evaluate((s) => { const t = document.querySelector(s); return t.hasAttribute('data-visible') && getComputedStyle(t).visibility === 'visible'; }, TAG);
const settle = (page) => page.waitForTimeout(450);

/** Scrolls down from `from` in steps until the tag shows; returns the position or -1. */
const scrollUntilShown = (page, from = 700) =>
  page.evaluate(async ([s, start]) => {
    const t = document.querySelector(s);
    const max = document.documentElement.scrollHeight - innerHeight;
    for (let y = start; y <= max; y += 80) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 400));
      if (t.hasAttribute('data-visible')) return y;
    }
    return -1;
  }, [TAG, from]);

/** Whether the visible tag overlaps a control or link in <main>, or the footer's content. */
const overlaps = (page) =>
  page.evaluate((s) => {
    const t = document.querySelector(s);
    const r = t.getBoundingClientRect();
    const hit = (b) => b.width > 1 && b.height > 1 && b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top;
    const ui = 'a[href], button, input, select, textarea, summary, label, form, [role="button"]';
    const els = [...document.querySelector('main').querySelectorAll(ui)].filter((e) => !t.contains(e)).concat([...document.querySelector('footer').querySelectorAll(`${ui}, svg, img`)]);
    if (els.some((e) => e.checkVisibility() && [...e.getClientRects()].some(hit))) return 'control';
    const walker = document.createTreeWalker(document.querySelector('footer'), NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.textContent.trim() || n.parentElement.closest('.visually-hidden') || !n.parentElement.checkVisibility()) continue;
      range.selectNodeContents(n);
      if ([...range.getClientRects()].some(hit)) return 'footer text';
    }
    return null;
  }, TAG);

try {
  // 1. Every main page in PL/EN/DE: one localised tag, hidden at the top, available at the end and clear.
  for (const [locale, paths] of Object.entries(routes)) {
    for (const path of paths) {
      const { context, page } = await open();
      await page.goto(base + path, { waitUntil: 'networkidle' });
      assert.equal(await page.locator(TAG).count(), 1, `${path}: one back-to-top link`);
      // Hidden at the top (visibility: hidden), so the role query must include hidden elements.
      assert.equal(await page.getByRole('link', { name: labels[locale], exact: true, includeHidden: true }).count(), 1, `${path}: accessible name "${labels[locale]}"`);
      await settle(page);
      assert.equal(await shown(page), false, `${path}: hidden at the top`);
      await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(700);
      const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      if (max > 600) {
        assert.equal(await shown(page), true, `${path}: available at the end of the page`);
        assert.equal(await overlaps(page), null, `${path}: clear of controls and footer content at the end`);
      }
      await context.close();
    }
  }
  console.log('PASS: one localised tag on all 39 pages (PL/EN/DE), hidden at the top, available and clear at the end');

  // 2. Appears after scrolling, disappears back at the top; smooth scroll to the top on click.
  {
    const { context, page } = await open({ reducedMotion: 'no-preference' });
    await page.goto(base + '/jakosc', { waitUntil: 'networkidle' });
    await page.evaluate(() => scrollTo(0, 450));
    await settle(page);
    assert.equal(await shown(page), false, 'hidden at 450 px');
    const y = await scrollUntilShown(page, 700);
    assert.ok(y > 600, `shown after scrolling past 600 px (at ${y})`);
    const trace = await page.evaluate(async (s) => {
      document.querySelector(s).click();
      const out = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 2500) {
        out.push(Math.round(scrollY));
        if (scrollY === 0) break;
        await new Promise((r) => requestAnimationFrame(r));
      }
      return out;
    }, TAG);
    assert.equal(trace.at(-1), 0, 'reaches the top');
    assert.ok(trace.length > 3 && trace.some((v) => v > 0 && v < y), `scrolls smoothly (${trace.length} frames)`);
    await settle(page);
    assert.equal(await shown(page), false, 'hidden again at the top');
    assert.equal(await page.evaluate(() => location.hash), '', 'no #top in the address with JavaScript');
    await context.close();
  }
  console.log('PASS: appears after 600 px, smooth scroll to the top, hides again, no hash');

  // 3. Reduced motion: instant jump.
  {
    const { context, page } = await open();
    await page.goto(base + '/jakosc', { waitUntil: 'networkidle' });
    await scrollUntilShown(page, 700);
    const after = await page.evaluate(async (s) => {
      document.querySelector(s).click();
      await new Promise((r) => requestAnimationFrame(r));
      return scrollY;
    }, TAG);
    assert.equal(after, 0, 'reduced motion: at the top within one frame');
    await context.close();
  }
  console.log('PASS: reduced motion scrolls instantly');

  // 4. Keyboard: reachable with Tab, visible focus, Enter goes up and focus continues at the logo.
  {
    const { context, page } = await open();
    await page.goto(base + '/produkty', { waitUntil: 'networkidle' });
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(700);
    assert.equal(await shown(page), true, 'shown at the end');
    await page.focus('footer a');
    await page.keyboard.press('Shift+Tab');
    const focus = await page.evaluate((s) => {
      const t = document.querySelector(s);
      const cs = getComputedStyle(t);
      return { onTag: document.activeElement === t, ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 };
    }, TAG);
    assert.equal(focus.onTag, true, 'Shift+Tab from the footer reaches the tag');
    assert.equal(focus.ring, true, 'visible focus ring');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => ({ y: scrollY, active: document.activeElement?.className ?? '' }));
    assert.equal(after.y, 0, 'Enter scrolls to the top');
    assert.match(after.active, /site-head__logo/, 'focus continues at the logo link');
    await context.close();
  }
  console.log('PASS: keyboard access, visible focus, Enter, focus moved to the logo');

  // 5. Phones: touch size, safe-area offsets in the stylesheet, never over controls or footer content.
  let phoneSize = '';
  {
    const { context, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.goto(base + '/produkty', { waitUntil: 'networkidle' });
    await scrollUntilShown(page, 700);
    const box = await page.locator(TAG).boundingBox();
    phoneSize = `${Math.round(box.width)}×${Math.round(box.height)}`;
    assert.ok(box.width >= 44 && box.height >= 44, `touch target ${box.width}×${box.height}`);
    const safeArea = await page.evaluate(() => [...document.styleSheets].some((sheet) => {
      try { return [...sheet.cssRules].some((r) => /safe-area-inset-bottom/.test(r.cssText) && /safe-area-inset-right/.test(r.cssText)); } catch { return false; }
    }));
    assert.equal(safeArea, true, 'safe-area insets in the tag position');
    await context.close();
    for (const [width, height, mobile] of [[390, 844, true], [1024, 768, false], [1440, 900, false]]) {
      for (const path of ['/', '/kontakt', '/zapytaj-o-oferte', '/kariera', '/certyfikaty']) {
        const { context: c, page: p } = await open({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile });
        await p.goto(base + path, { waitUntil: 'networkidle' });
        const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
        for (let y = 0; y <= max; y += 120) {
          await p.evaluate((v) => scrollTo(0, v), y);
          await p.waitForTimeout(60);
          if (await shown(p)) assert.equal(await overlaps(p), null, `${path} at ${width}px, ${y}px: covers nothing`);
        }
        await c.close();
      }
    }
  }
  console.log(`PASS: ${phoneSize} px on phones, safe-area offsets, never over controls, forms or footer content (390/1024/1440 px)`);

  // 6. Forms, menu and dialogs: steps aside for a focused field, stays under the mobile menu.
  {
    const { context, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await page.goto(base + '/zapytaj-o-oferte', { waitUntil: 'networkidle' });
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(700);
    await page.locator('main form input[name="person"]').focus();
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate((s) => getComputedStyle(document.querySelector(s)).visibility, TAG), 'hidden', 'hidden while a form field has focus');
    await page.locator('main form input[name="person"]').blur();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(700);
    await page.locator('.site-head button[aria-expanded]').first().click();
    await page.waitForTimeout(400);
    const covered = await page.evaluate((s) => {
      const t = document.querySelector(s);
      const r = t.getBoundingClientRect();
      const top = document.elementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2);
      return !t.contains(top);
    }, TAG);
    assert.equal(covered, true, 'the open mobile menu lies above the tag');
    await context.close();
  }
  console.log('PASS: hidden for a focused form field, below the open mobile menu');

  // 7. Without JavaScript: a plain link to #top, hidden at the top, revealed by scroll where supported.
  //    No collision check is possible then, so it hides once the footer enters and on pages with a form.
  {
    // Page timers never fire with JavaScript disabled, so the waiting happens here, not in the page.
    const vis = async (page, y) => {
      await page.evaluate((v) => scrollTo(0, v), y);
      await page.waitForTimeout(250);
      return page.evaluate((s) => getComputedStyle(document.querySelector(s)).visibility, TAG);
    };
    const { context, page } = await open({ javaScriptEnabled: false });
    await page.goto(base + '/jakosc', { waitUntil: 'load' });
    assert.equal(await vis(page, 0), 'hidden', 'no-JS: hidden at the top');
    const scrollDriven = await page.evaluate(() => CSS.supports('animation-timeline: scroll()') && CSS.supports('timeline-scope: none'));
    if (scrollDriven) {
      // 300 px of the footer in view, well before the end of the page.
      const footerIn = await page.evaluate(() => document.querySelector('footer').getBoundingClientRect().top + scrollY - innerHeight + 300);
      assert.equal(await vis(page, footerIn), 'hidden', 'no-JS: hidden once the footer is in view');
      assert.equal(await vis(page, 1200), 'visible', 'no-JS: shown after scrolling');
      await page.locator(TAG).click();
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => scrollY), 0, 'no-JS: the link goes to the top');
      // The enquiry form page on a phone: 1200 px is still above the footer.
      const phone = await open({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await phone.page.goto(base + '/zapytaj-o-oferte', { waitUntil: 'load' });
      assert.equal(await vis(phone.page, 1200), 'hidden', 'no-JS: hidden on a page with a form');
      await phone.context.close();
    }
    await context.close();
  }
  console.log('PASS: without JavaScript a #top link, hidden at the top, shown by scroll-driven CSS where supported, hidden near the footer and on form pages');

  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log('PASS: no browser runtime errors');
} finally {
  await browser.close();
}
