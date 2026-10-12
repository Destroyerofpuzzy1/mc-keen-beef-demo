// Certificate documents on the Certyfikaty pages (GAP-01), read-only, against a LOCAL server
// (http://localhost:5000 by default; NAV_BASE_URL overrides it, remote hosts are rejected):
//   - every current certificate card and archive row keeps its scan preview links (viewer)
//     and links the original PDF of each language version;
//   - each PDF link's language (text and hreflang) matches the file, and the file belongs to
//     the certificate shown in that card or row (company, year, standard as displayed);
//   - all PDFs in public/documents/certificates are linked exactly once per page and are
//     served as PDF with the size of the file on disk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Certificate checks must use a local server');

const pages = { pl: '/certyfikaty', en: '/en/certificates', de: '/de/zertifikate' };
const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const onDisk = readdirSync(join(publicDir, 'documents', 'certificates'), { recursive: true })
  .filter((f) => f.endsWith('.pdf'))
  .map((f) => `/documents/certificates/${f.replaceAll('\\', '/')}`)
  .sort();

// Displayed company and standard → file naming of the archive (docs/asset-map.md).
const siteSlug = { 'MCKEEN-BEEF CP Sp. z o.o.': 'cutting-plant-cp', 'MCKEEN-BEEF SH Sp. z o.o.': 'slaughterhouse-sh' };
const stdSlug = (text) => (/BRCGS/.test(text) ? 'brcgs' : /IFS Food/.test(text) ? 'ifs-food' : /\(EKO\)/.test(text) ? 'ekogwarancja' : null);
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const anchors = (html) => [...html.matchAll(/<a\s[^>]*>[\s\S]*?<\/a>/g)].map((m) => m[0]);
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1] ?? null;

/** Checks one card or archive row and returns the PDF hrefs it links. */
function checkBlock(html, { company, year, standard }, where) {
  const site = siteSlug[company];
  const std = stdSlug(standard);
  assert.ok(site && std && /^\d{4}$/.test(year), `${where}: cannot read company/year/standard (${company} | ${year} | ${standard})`);
  const links = anchors(html);
  const pdf = links.filter((a) => /href="\/documents\/certificates\/[^"]+\.pdf"/.test(a));
  const preview = links.filter((a) => /data-cert-view="/.test(a));
  assert.ok(pdf.length > 0, `${where}: no original PDF link`);
  const langs = [];
  for (const a of pdf) {
    const href = attr(a, 'href');
    const label = text(a);
    const lang = attr(a, 'hrefLang');
    assert.match(label, /^(PL|EN|DE)$/, `${where}: PDF link text "${label}"`);
    assert.equal(lang, label.toLowerCase(), `${where}: hreflang of ${href}`);
    assert.equal(href, `/documents/certificates/${site}/${site}-${year}-${std}-${lang}.pdf`, `${where}: ${label} links another document`);
    assert.equal(attr(a, 'type'), 'application/pdf', `${where}: ${href} type`);
    assert.ok(!/data-cert-view=/.test(a), `${where}: ${href} would be opened by the scan viewer`);
    assert.ok((attr(a, 'aria-label') ?? '').includes(label), `${where}: accessible name of ${href} must contain "${label}"`);
    langs.push(lang);
  }
  // The scan preview stays, for the same language versions.
  const previewLangs = preview.filter((a) => !/cert-thumb/.test(a)).map((a) => attr(a, 'data-cert-lang'));
  assert.deepEqual([...previewLangs].sort(), [...langs].sort(), `${where}: preview languages`);
  return pdf.map((a) => attr(a, 'href'));
}

for (const path of Object.values(pages)) {
  test(`${path}: preview and original PDF for every certificate, correct language and document`, async () => {
    const res = await fetch(base + path);
    assert.equal(res.status, 200, path);
    const html = await res.text();
    const linked = [];

    // Current certificates: one card per certificate (company and standard as displayed,
    // year from the card id, e.g. cert-cp-2026-brcgs).
    const cards = [...html.matchAll(/<article class="cert-label[^"]*" aria-labelledby="cert-([a-z0-9]+)-(\d{4})-[a-z]+">([\s\S]*?)<\/article>/g)];
    assert.ok(cards.length > 0, `${path}: no current certificate card`);
    for (const [, , year, body] of cards) {
      const standard = text(body.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1] ?? '');
      const company = Object.keys(siteSlug).find((c) => body.includes(c)) ?? '';
      linked.push(...checkBlock(body, { company, year, standard }, `${path} card ${standard} ${year}`));
    }

    // Archive: one table per company, one row per certificate (the elements carry explicit
    // table roles since UXA-07, so attributes are allowed).
    const groups = [...html.matchAll(/<details class="archive__group"[^>]*>([\s\S]*?)<\/details>/g)];
    assert.ok(groups.length > 0, `${path}: no archive`);
    for (const [, group] of groups) {
      const company = text(group.match(/<span class="archive__entity">([\s\S]*?)<\/span>/)?.[1] ?? '');
      const rows = [...(group.split(/<tbody[^>]*>/)[1] ?? '').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)];
      assert.ok(rows.length > 0, `${path}: empty archive for ${company}`);
      for (const [, row] of rows) {
        const year = row.match(/<th[^>]*\sscope="row"[^>]*>(\d{4})<\/th>/)?.[1] ?? '';
        const standard = text(row.match(/<td[^>]*>([\s\S]*?)<\/td>/)?.[1] ?? '');
        linked.push(...checkBlock(row, { company, year, standard }, `${path} archive ${company} ${year} ${standard}`));
      }
    }

    assert.equal(new Set(linked).size, linked.length, `${path}: a PDF is linked twice`);
    assert.deepEqual([...linked].sort(), onDisk, `${path}: linked PDFs differ from public/documents/certificates`);
  });
}

test('every certificate PDF is served as the PDF file on disk', async () => {
  assert.equal(onDisk.length, 61, 'expected the 61 legacy certificate PDFs');
  for (const href of onDisk) {
    const res = await fetch(base + href);
    assert.equal(res.status, 200, href);
    assert.match(res.headers.get('content-type') ?? '', /^application\/pdf/, `${href} content type`);
    const body = Buffer.from(await res.arrayBuffer());
    const file = join(publicDir, ...href.split('/').filter(Boolean));
    assert.equal(body.length, statSync(file).size, `${href} size`);
    assert.equal(body.subarray(0, 5).toString('latin1'), '%PDF-', `${href} signature`);
    assert.ok(body.equals(readFileSync(file)), `${href} content differs from the file on disk`);
  }
});
