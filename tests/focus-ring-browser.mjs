// Browser regression check for A11Y-001: the keyboard focus ring stays visible with at least 3:1 against the
// colours next to it, on light and dark surfaces, against a LOCAL server. Uses an existing Playwright
// installation, never installs packages; same variables as test:nav (PLAYWRIGHT_MODULE, NAV_BROWSER_CHANNEL,
// NAV_BASE_URL). Read-only: nothing is submitted.
//
// Real Tab presses reach sample elements; the ring is measured from the rendered pixels, not from the CSS
// value: on the middle of each side, the ring colour against the pixel just outside it and the pixel in the
// gap inside it. Every side must be drawn (not clipped by an overflow ancestor, not covered by a neighbour)
// and the element must not be covered by the sticky header. Where the background can be light or dark (the
// hero video, the floating back-to-top tag) the ring has two colours (WCAG technique C40): one of the two must
// reach 3:1 against what is behind, and over the video the two must be at least 9:1 apart.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { inflateSync } from 'node:zlib';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Browser checks must use a local server');
const browser = await chromium.launch({ headless: true, channel: process.env.NAV_BROWSER_CHANNEL || undefined });
const errors = [];

function decodePng(buf) {
  let off = 8, width = 0, height = 0, type = 0;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const kind = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (kind === 'IHDR') [width, height, type] = [data.readUInt32BE(0), data.readUInt32BE(4), data[9]];
    if (kind === 'IDAT') idat.push(data);
    off += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3;
  const stride = width * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? px[y * stride + i - bpp] : 0;
      const b = y ? px[(y - 1) * stride + i] : 0;
      const c = y && i >= bpp ? px[(y - 1) * stride + i - bpp] : 0;
      const p = a + b - c;
      const pred = [0, a, b, (a + b) >> 1, Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c][f];
      px[y * stride + i] = (raw[y * (stride + 1) + 1 + i] + pred) & 255;
    }
  }
  return (x, y) => (x >= 0 && y >= 0 && x < width && y < height ? [...px.subarray((y * width + x) * bpp, (y * width + x) * bpp + 3)] : null);
}
const lum = (c) => c.map((v) => (v / 255 <= 0.03928 ? v / 255 / 12.92 : ((v / 255 + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const median = (cs) => [0, 1, 2].map((k) => cs.map((c) => c[k]).sort((m, n) => m - n)[cs.length >> 1]);

/** The focused element's ring, side by side: ring, outside and gap colours from the pixels. */
async function ring(page) {
  const d = await page.evaluate(() => {
    const el = document.activeElement;
    const r = [...el.getClientRects()].sort((p, q) => q.width * q.height - p.width * p.height)[0] ?? el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const w = cs.outlineStyle === 'none' ? 0 : parseFloat(cs.outlineWidth);
    const o = parseFloat(cs.outlineOffset) || 0;
    const ext = Math.max(0, o + w) + 8;
    const vw = document.documentElement.clientWidth;
    const clip = { x: Math.max(0, Math.floor(r.left - ext)), y: Math.max(0, Math.floor(r.top - ext)) };
    clip.width = Math.min(vw, Math.ceil(r.right + ext)) - clip.x;
    clip.height = Math.min(innerHeight, Math.ceil(r.bottom + ext)) - clip.y;
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      name: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40),
      rect: { l: r.left, t: r.top, r: r.right, b: r.bottom }, w, o, clip,
      declared: (cs.outlineColor.match(/[\d.]+/g) || []).slice(0, 3).map(Number),
      visible: el.matches(':focus-visible'),
      covered: !(hit && (hit === el || el.contains(hit) || hit.contains(el))),
    };
  });
  const at = decodePng(await page.screenshot({ clip: d.clip }));
  const px = (x, y) => at(Math.floor(x) - d.clip.x, Math.floor(y) - d.clip.y);
  const { l, t, r, b } = d.rect;
  const [dr, dout, din] = [d.o + d.w / 2, d.o + d.w + 1.5, d.o / 2];
  const sides = [];
  for (const [name, fn] of Object.entries({
    top: (f, q) => px(l + f * (r - l), t - q),
    bottom: (f, q) => px(l + f * (r - l), b + q),
    left: (f, q) => px(l - q, t + f * (b - t)),
    right: (f, q) => px(r + q, t + f * (b - t)),
  })) {
    const fs = [0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65];
    const rings = fs.map((f) => fn(f, dr)).filter(Boolean);
    if (rings.length < 4) continue; // off screen
    const drawn = rings.filter((c) => Math.hypot(c[0] - d.declared[0], c[1] - d.declared[1], c[2] - d.declared[2]) < 60).length >= rings.length / 2;
    // Next to the viewport edge the pixel outside the ring may be off screen: then only the gap is compared.
    const [rc, oc, ic] = [rings, fs.map((f) => fn(f, dout)).filter(Boolean), fs.map((f) => fn(f, din)).filter(Boolean)].map((cs) => (cs.length >= 4 ? median(cs) : null));
    sides.push({ name, drawn, ring: oc ? contrast(rc, oc) : null, gap: contrast(rc, ic), haloOut: oc ? contrast(ic, oc) : null });
  }
  return { ...d, sides };
}

/** One Tab walk per page: each target is measured at the first stop that matches its selector. */
async function walk(path, width, targets, max = 160) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + path, { waitUntil: 'networkidle' });
  const found = {};
  for (let i = 0; i < max && Object.keys(found).length < targets.length; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
    for (const [key, selector] of targets) {
      if (!found[key] && (await page.evaluate((s) => document.activeElement?.matches(s) ?? false, selector))) found[key] = await ring(page);
    }
  }
  return { page, context, found };
}

function single(label, m) {
  assert.ok(m, `${label}: not reached by Tab`);
  assert.ok(m.visible && m.w >= 2, `${label}: no visible focus ring`);
  assert.ok(!m.covered, `${label}: covered (e.g. by the sticky header)`);
  assert.ok(m.sides.length >= 2, `${label}: ring not in view`);
  for (const s of m.sides) {
    assert.ok(s.drawn, `${label}: ${s.name} side of the ring is not drawn (clipped or covered)`);
    const outside = s.ring ?? s.gap;
    assert.ok(outside >= 3 && (m.o < 2 || s.gap >= 3), `${label}: ${s.name} side ${outside.toFixed(2)}:1 outside, ${s.gap.toFixed(2)}:1 inside (needs 3:1)`);
  }
  return Math.min(...m.sides.map((s) => Math.min(s.ring ?? s.gap, m.o < 2 ? Infinity : s.gap)));
}
function twoColour(label, m, apart) {
  assert.ok(m && m.visible && !m.covered, `${label}: not focused visibly`);
  for (const s of m.sides) {
    assert.ok(s.drawn, `${label}: ${s.name} side not drawn`);
    assert.ok(s.gap >= apart, `${label}: ${s.name} side, ring and halo only ${s.gap.toFixed(2)}:1 apart (needs ${apart}:1)`);
    if (s.ring !== null) assert.ok(Math.max(s.ring, s.haloOut) >= 3, `${label}: ${s.name} side, neither colour reaches 3:1 against the background`);
  }
}

// 1-2. Home page: light header, the hero video, the dark chain, the sales panel, the floating tag, the footer.
for (const width of [1440, 390]) {
  const { context, found } = await walk('/', width, [
    ['header', '.site-head a.btn--primary, .mmenu__toggle'],
    ['hero', '.hero a.btn--primary'],
    ['chain', '.chain a'],
    ['panel', '.logistics__panel a'],
    ['tag', 'a[href="#top"]'],
    ['footer', '.site-foot a'],
  ], 220);
  const light = single(`${width} px header`, found.header);
  const dark = ['chain', 'panel', 'footer'].map((k) => single(`${width} px ${k}`, found[k]));
  twoColour(`${width} px hero CTA over the video`, found.hero, 9);
  // On phones the tag steps aside at the page end, where it would cover footer links (UX-001), so Tab skips it.
  if (width === 1440) twoColour(`${width} px back-to-top tag`, found.tag, 3);
  await context.close();
  console.log(`PASS: home at ${width} px: light header ${light.toFixed(1)}:1, dark surfaces ≥ ${Math.min(...dark).toFixed(1)}:1 (chain, sales panel, footer); hero CTA${width === 1440 ? ' and back-to-top tag' : ''} with a two-colour ring; every side drawn, nothing covered`);
}

// 3. The header arrow's ring is not covered by the carriage (1440 px, the first tab is the current page).
{
  const { context, found } = await walk('/', 1440, [['prev', 'nav[data-selected] > button:first-child']], 12);
  single('header arrow', found.prev);
  await context.close();
  console.log('PASS: the header arrow keeps all four sides of its ring next to the carriage');
}

// 4. Dark cards and sections on inner pages, light cards next to them.
for (const [path, targets] of [
  ['/sprzedaz-eksport', [['enquiry', '.sales-card--dark a[data-enquiry]'], ['products', '.sales-card--dark .btn--ghost-light']]],
  ['/de/produkte', [['people', '.section--dark .sales-people a']]],
  ['/certyfikaty', [['files', '.cert-files__lang']]],
]) {
  const { context, found } = await walk(path, 1440, targets, 200);
  const min = targets.map(([k]) => single(`${path} ${k}`, found[k]));
  await context.close();
  console.log(`PASS: ${path}: ${targets.map(([k]) => k).join(', ')} at ≥ ${Math.min(...min).toFixed(1)}:1`);
}

// 5. Mobile menu (390 px): Enter opens it, the ring is light on the maroon panel, Escape returns to the toggle.
{
  const { page, context, found } = await walk('/', 390, [['toggle', '.mmenu__toggle']], 10);
  single('menu toggle', found.toggle);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  let link = null;
  for (let i = 0; i < 6 && !link; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(60);
    if (await page.evaluate(() => document.activeElement?.matches('.mmenu__panel a'))) link = await ring(page);
  }
  const c = single('menu link', link);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate(() => document.activeElement?.matches('.mmenu__toggle')), 'menu: Escape does not return the focus to the toggle');
  single('menu toggle after Escape', await ring(page));
  await context.close();
  console.log(`PASS: mobile menu: link ring ${c.toFixed(1)}:1 on the maroon panel; Escape returns the focus to the toggle with its ring`);
}

// 6. Certificate viewer (dark dialog): Enter opens it on its close button, Escape returns to the preview link.
{
  const { page, context, found } = await walk('/certyfikaty', 1440, [['preview', '[data-cert-view]']], 120);
  single('preview link', found.preview);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const close = single('viewer close', await ring(page));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate(() => document.activeElement?.matches('[data-cert-view]')), 'viewer: Escape does not return the focus to the preview link');
  await context.close();
  console.log(`PASS: certificate viewer: close button ring ${close.toFixed(1)}:1 on the dark dialog; Escape returns the focus to the preview link`);
}

assert.deepEqual(errors, [], `browser runtime errors: ${errors.join(' | ')}`);
console.log('PASS: no browser runtime errors');
await browser.close();
