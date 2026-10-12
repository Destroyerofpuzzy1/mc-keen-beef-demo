// UXA-03: every "current certificate not published" sentence leads somewhere, read-only, against a
// LOCAL server (http://localhost:5000 by default; NAV_BASE_URL overrides it, remote hosts are
// rejected). Server-rendered HTML, so this is also the no-JavaScript path:
//   - on Certyfikaty, Zakłady and Produkty in PL/EN/DE, each occurrence of the sentence is followed,
//     in the same block, by a link to the contact router's quality topic (`?temat=quality#pomoc`);
//   - that link opens Kontakt with the quality topic expanded, listing the quality department of
//     every plant by plant name (the visitor chooses; no routing to one person);
//   - UXA-05 stage 1: Certyfikaty ends, after the archive, with the quality contact and the quality
//     system (an existing section of Jakość), and has no other extra quality link;
//   - UXA-08: the verification note says that the official databases need a sign-in and links both
//     as marked external links; no BRCGS Site Code or IFS COID is published (GAP-03 open);
//   - UXA-05 stage 2: where the cutting plant's current certificates are listed (Elementy and Mięsa
//     drobne on Produkty, its card on Zakłady) one link leads to its section on Certyfikaty, nowhere
//     else; Jakość has the quality contact once, in its certificates section;
//   - UXA-05 stage 3: Sprzedaż i eksport offers Produkty as the secondary step after the enquiry
//     (the primary CTA), once in the page content; Produkty leads on to the enquiry per product;
//   - UXA-05 stage 4: on Zakłady the departments named on a card lead to their contact topic (livestock
//     purchasing on SH and SH II, transport on CP) and the sales company's card to Sprzedaż i eksport,
//     nowhere else; the topics open with those departments' contacts; no offal/UPPZ link (UXA-04);
//   - UXA-05 stage 5: Biogazownia ends, after the EU disclosure, with one link to Środowisko on
//     Jakość; the disclosure keeps both EU logos and its links and names no company (GAP-07).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const base = process.env.NAV_BASE_URL || 'http://localhost:5000';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(base).hostname), 'Certificate checks must use a local server');

const sentence = {
  pl: 'Aktualny certyfikat tego zakładu nie jest opublikowany na stronie.',
  en: 'A current certificate for this plant is not published on this website.',
  de: 'Ein aktuelles Zertifikat dieses Betriebs ist auf dieser Website nicht veröffentlicht.',
};
const label = { pl: 'Zapytaj dział jakości', en: 'Contact the quality department', de: 'Qualitätsabteilung kontaktieren' };
const contact = { pl: '/kontakt', en: '/en/contact', de: '/de/kontakt' };
const quality = { pl: '/jakosc', en: '/en/quality', de: '/de/qualitaet' };
const system = { pl: 'System jakości', en: 'Quality system', de: 'Qualitätssystem' };
const verifyText = {
  pl: 'Weryfikacja certyfikatów w oficjalnych bazach BRCGS i IFS wymaga zalogowania na konto. BRCGS oferuje bezpłatne konto Directory Lite.',
  en: 'Verifying certificates in the official BRCGS and IFS databases requires signing in to an account. BRCGS offers a free Directory Lite account.',
  de: 'Die Prüfung von Zertifikaten in den offiziellen Datenbanken von BRCGS und IFS erfordert die Anmeldung mit einem Konto. BRCGS bietet ein kostenloses Directory-Lite-Konto an.',
};
const newTab = { pl: 'otwiera się w nowej karcie', en: 'opens in a new tab', de: 'öffnet in einem neuen Tab' };
const sales = { pl: '/sprzedaz-eksport', en: '/en/sales-export', de: '/de/vertrieb-export' };
const enquiry = { pl: '/zapytaj-o-oferte', en: '/en/request-a-quote', de: '/de/angebot-anfragen' };
const productsLabel = { pl: 'Produkty', en: 'Products', de: 'Produkte' };
const salesLabel = { pl: 'Sprzedaż i eksport', en: 'Sales and export', de: 'Vertrieb und Export' };
const biogasPage = { pl: '/biogazownia', en: '/en/biogas-plant', de: '/de/biogasanlage' };
const envLabel = { pl: 'Środowisko', en: 'Environment', de: 'Umwelt' };
const topicLabel = {
  'sell-cattle': { pl: 'Sprzedaję bydło', en: 'I want to sell cattle', de: 'Ich möchte Rinder verkaufen' },
  transport: { pl: 'Transport', en: 'Transport', de: 'Transport' },
};
const department = {
  'sell-cattle': { pl: 'Własny dział skupu żywca', en: 'Own livestock purchasing department', de: 'Eigene Viehankaufsabteilung' },
  transport: { pl: 'Dział transportu', en: 'Transport department', de: 'Transportabteilung' },
};
const docsLabel = { pl: 'Dokumenty certyfikatów', en: 'Certificate documents', de: 'Zertifikatsdokumente' };
const cuttingPlant = { pl: 'Zakład rozbioru, Lisków', en: 'Cutting plant, Lisków', de: 'Zerlegebetrieb, Lisków' };
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** The markup from `id="…"` to the given end tag (or to the end of the page). */
const block = (html, id, end) => {
  const from = html.indexOf(`id="${id}"`);
  assert.ok(from >= 0, `#${id} exists`);
  const rest = html.slice(from);
  const to = rest.indexOf(end, 1);
  return to > 0 ? rest.slice(0, to) : rest;
};
const databases = [
  ['https://directory.brcgs.com/', 'directory.brcgs.com'],
  ['https://login.ifs-certification.com/?lang=en', 'login.ifs-certification.com'],
];
const pages = {
  pl: { certificates: '/certyfikaty', plants: '/zaklady', products: '/produkty' },
  en: { certificates: '/en/certificates', plants: '/en/plants', products: '/en/products' },
  de: { certificates: '/de/zertifikate', plants: '/de/standorte', products: '/de/produkte' },
};
// Occurrences by page: two plants without a published certificate (SH, SH II); on Produkty the
// two groups from the slaughter plant in Linne (Ćwierci, Podroby).
const expected = { certificates: 2, plants: 2, products: 2 };
const placeOf = { pl: ['Zakład uboju, Linne', 'Zakład uboju II, Wydrzyn', 'Zakład rozbioru, Lisków'], en: ['Linne', 'Wydrzyn', 'Lisków'], de: ['Linne', 'Wydrzyn', 'Lisków'] };

const get = async (path) => {
  const res = await fetch(base + path, { redirect: 'manual' });
  assert.equal(res.status, 200, `${path}: HTTP 200`);
  // The rendered markup only: the RSC payload in <script> tags repeats the text for hydration.
  return (await res.text()).replace(/<script[\s\S]*?<\/script>/g, '').replace(/<!--.*?-->/g, '');
};
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ').trim();

for (const [locale, list] of Object.entries(pages)) {
  test(`${locale}: every "not published" sentence is followed by the quality contact link`, async () => {
    const link = `href="${contact[locale]}?temat=quality#pomoc"`;
    for (const [name, path] of Object.entries(list)) {
      const html = await get(path);
      const parts = html.split(sentence[locale]);
      assert.equal(parts.length - 1, expected[name], `${path}: occurrences of the sentence`);
      for (const after of parts.slice(1)) {
        // The link must come before the next block of the page (next card, row or list item).
        const near = after.slice(0, 600);
        assert.ok(near.includes(link), `${path}: no quality contact link right after the sentence`);
        const a = near.slice(near.indexOf(link)).match(/^[^>]*>([\s\S]*?)<\/a>/);
        assert.equal(text(a?.[1] ?? ''), label[locale], `${path}: link label`);
      }
    }
  });

  test(`${locale}: the link opens the quality topic with every plant's quality department`, async () => {
    const html = await get(`${contact[locale]}?temat=quality`);
    const expanded = [...html.matchAll(/<button[^>]*aria-expanded="true"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => text(m[1]));
    assert.equal(expanded.length, 1, 'one topic is open');
    const panel = html.match(/class="router__result"[\s\S]*?<\/ul>/)?.[0] ?? '';
    const panelText = text(panel);
    for (const place of placeOf[locale]) assert.ok(panelText.includes(place), `quality topic lists ${place}`);
    assert.ok((panel.match(/href="tel:/g) ?? []).length >= 3, 'phone numbers of the quality departments');
    assert.ok(html.includes('id="pomoc"'), 'the #pomoc anchor exists');
  });

  test(`${locale}: Certyfikaty ends with the quality contact and the quality system (UXA-05)`, async () => {
    const html = await get(list.certificates);
    const archive = html.split('id="archiwum"')[1] ?? '';
    const row = archive.slice(archive.indexOf('class="archive"')).match(/<p class="link-row">([\s\S]*?)<\/p>/)?.[1] ?? '';
    const links = [...row.matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [m[1], text(m[2])]);
    assert.deepEqual(
      links,
      [
        [`${contact[locale]}?temat=quality#pomoc`, label[locale]],
        [`${quality[locale]}#system-jakosci`, system[locale]],
      ],
      'after the archive: the quality contact, then the quality system',
    );
    // One quality link per plant without a published certificate, plus this row; nothing else.
    const qualityLinks = html.split(`href="${contact[locale]}?temat=quality#pomoc"`).length - 1;
    assert.equal(qualityLinks, expected.certificates + 1, 'quality contact links on Certyfikaty');
    assert.ok((await get(quality[locale])).includes('id="system-jakosci"'), 'the quality system section exists on Jakość');
  });

  test(`${locale}: the verification note needs a sign-in and links the official databases (UXA-08)`, async () => {
    const html = await get(list.certificates);
    const note = html.match(/<div class="note cert-verify">([\s\S]*?)<\/ul>\s*<\/div>/)?.[1] ?? '';
    assert.ok(text(note).startsWith(verifyText[locale]), 'the note says verification needs a sign-in (BRCGS: free Directory Lite)');
    const links = [...note.matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/g)].map(([, attrs, inner]) => ({
      href: attrs.match(/href="([^"]*)"/)?.[1],
      target: attrs.match(/target="([^"]*)"/)?.[1],
      rel: attrs.match(/rel="([^"]*)"/)?.[1] ?? '',
      name: text(inner),
    }));
    assert.deepEqual(links.map((l) => l.href), databases.map(([url]) => url), 'the two official addresses, in this order');
    links.forEach((l, i) => {
      assert.equal(l.target, '_blank', `${l.href}: opens in a new tab`);
      assert.match(l.rel, /noopener/, `${l.href}: rel noopener`);
      assert.match(l.rel, /noreferrer/, `${l.href}: rel noreferrer`);
      assert.ok(l.name.includes(`(${databases[i][1]})`), `${l.href}: the visible label names the external site`);
      assert.ok(l.name.endsWith(`(${newTab[locale]})`), `${l.href}: screen readers hear that it opens a new tab`);
    });
    // Nothing published that GAP-03 still has to confirm.
    for (const code of ['1906989', '26277']) assert.ok(!text(html).includes(code), `identifier ${code} is not published`);
  });

  test(`${locale}: the cutting plant's certificates lead to its documents; Jakość to the quality department (UXA-05 stage 2)`, async () => {
    const target = `${list.certificates}#zaklad-rozbioru`;
    const docsLinks = (html) => [...html.matchAll(new RegExp(`<a[^>]*href="${escape(target)}"[^>]*>([\\s\\S]*?)<\\/a>`, 'g'))].map((m) => text(m[1]));
    // The target is the cutting plant's section on Certyfikaty.
    assert.match(block(await get(list.certificates), 'zaklad-rozbioru', '</h3>'), /Lisków/, '#zaklad-rozbioru is the cutting plant in Lisków');
    // Produkty: Elementy and Mięsa drobne (Lisków) once each; Ćwierci and Podroby (Linne) keep UXA-03 only.
    const products = await get(list.products);
    for (const id of ['elementy', 'miesa-drobne']) {
      const links = docsLinks(block(products, id, '<article'));
      assert.equal(links.length, 1, `${id}: one documents link`);
      assert.ok(links[0].startsWith(docsLabel[locale]) && links[0].includes(cuttingPlant[locale]), `${id}: label "${links[0]}"`);
    }
    for (const id of ['cwierci', 'podroby']) assert.equal(docsLinks(block(products, id, '<article')).length, 0, `${id}: no documents link`);
    assert.equal(docsLinks(products).length, 2, 'Produkty: two documents links in total');
    // Zakłady: only the cutting plant's card.
    const plants = await get(list.plants);
    assert.equal(docsLinks(block(plants, 'zaklad-rozbioru', '</article>')).length, 1, 'cutting plant card: one documents link');
    assert.equal(docsLinks(plants).length, 1, 'Zakłady: no documents link for other companies');
    // Jakość: the quality contact once, in the certificates section.
    const qualityPage = await get(quality[locale]);
    const qualityLink = `href="${contact[locale]}?temat=quality#pomoc"`;
    assert.equal(block(qualityPage, 'certyfikaty', '</section>').split(qualityLink).length - 1, 1, 'Jakość: quality link in the certificates section');
    assert.equal(qualityPage.split(qualityLink).length - 1, 1, 'Jakość: no other quality link');
  });

  test(`${locale}: Sprzedaż i eksport offers the products after the enquiry (UXA-05 stage 3)`, async () => {
    const html = await get(sales[locale]);
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    const links = [...block(main, 'team-h', '</section>').matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/g)]
      .map(([, attrs, inner]) => ({ href: attrs.match(/href="([^"]*)"/)?.[1] ?? '', cls: attrs.match(/class="([^"]*)"/)?.[1] ?? '', name: text(inner) }))
      .filter((l) => !/^(tel|mailto):/.test(l.href));
    assert.deepEqual(links.map((l) => l.href), [enquiry[locale], list.products], 'sales section: the enquiry, then the products');
    assert.match(links[0].cls, /btn--primary/, 'the enquiry stays the primary CTA');
    assert.match(links[1].cls, /btn--ghost-light/, 'the products link is the secondary button');
    assert.equal(links[1].name, productsLabel[locale], 'the products link says where it goes');
    // One way to the products in the page content (header and footer have their own).
    assert.equal(main.split(`href="${list.products}"`).length - 1, 1, 'one products link in <main>');
    // Produkty continues the path: an enquiry with the product ticked.
    assert.ok((await get(list.products)).includes(`href="${enquiry[locale]}?produkt=`), 'Produkty leads on to the enquiry');
  });

  test(`${locale}: Zakłady leads from departments to their contact topics and from the sales company to its page (UXA-05 stage 4)`, async () => {
    const plants = await get(list.plants);
    const linksTo = (html, target) => [...html.matchAll(new RegExp(`<a[^>]*href="${escape(target)}"[^>]*>([\\s\\S]*?)<\\/a>`, 'g'))].map((m) => text(m[1]));
    const target = { 'sell-cattle': `${contact[locale]}?temat=sell-cattle#pomoc`, transport: `${contact[locale]}?temat=transport#pomoc` };
    // [livestock purchasing, transport, sales page] links per company card.
    const perCard = { 'zaklad-uboju': [1, 0, 0], 'zaklad-uboju-2': [1, 0, 0], 'zaklad-rozbioru': [0, 1, 0], sprzedaz: [0, 0, 1], centrala: [0, 0, 0] };
    for (const [id, [cattle, transport, salesPage]] of Object.entries(perCard)) {
      const card = block(plants, id, '</article>');
      assert.equal(linksTo(card, target['sell-cattle']).length, cattle, `${id}: livestock purchasing links`);
      assert.equal(linksTo(card, target.transport).length, transport, `${id}: transport links`);
      assert.equal(linksTo(card, sales[locale]).length, salesPage, `${id}: Sprzedaż i eksport links`);
    }
    assert.equal(linksTo(block(plants, 'sprzedaz', '</article>'), sales[locale])[0], salesLabel[locale], 'sales company: link label');
    // Each topic link sits in the list item that names the department and carries the router's label.
    for (const topic of ['sell-cattle', 'transport']) {
      const items = [...plants.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => m[1]).filter((li) => li.includes(`href="${target[topic]}"`));
      assert.ok(items.length > 0, `${topic}: link present`);
      for (const li of items) {
        assert.ok(text(li).startsWith(department[topic][locale]), `${topic}: next to "${department[topic][locale]}"`);
        assert.deepEqual(linksTo(li, target[topic]), [topicLabel[topic][locale]], `${topic}: router label`);
      }
    }
    // The offal and UPPZ route stays as it is until the client decides (UXA-04).
    assert.ok(!plants.includes('temat=offal-uppz'), 'no offal/UPPZ link on Zakłady');
    // The topics open with the departments' own contacts (contacts.ts): both plants for livestock
    // purchasing, the cutting plant's transport department for transport.
    for (const [topic, mustContain] of [['sell-cattle', ['Linne', 'Wydrzyn', 'tel:+48632896351', 'tel:+48632896363']], ['transport', ['tel:+48627635519']]]) {
      const html = await get(`${contact[locale]}?temat=${topic}`);
      const expanded = [...html.matchAll(/<button[^>]*aria-expanded="true"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => text(m[1]));
      assert.deepEqual(expanded, [topicLabel[topic][locale]], `${topic}: that topic is open`);
      const panel = html.match(/class="router__result"[\s\S]*?<\/ul>/)?.[0] ?? '';
      for (const s of mustContain) assert.ok(panel.includes(s), `${topic}: the topic lists ${s}`);
    }
  });

  test(`${locale}: Biogazownia ends with a link back to Środowisko on Jakość (UXA-05 stage 5)`, async () => {
    const html = await get(biogasPage[locale]);
    const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
    const target = `${quality[locale]}#srodowisko`;
    const links = [...main.matchAll(new RegExp(`<a[^>]*href="${escape(target)}"[^>]*>([\\s\\S]*?)<\\/a>`, 'g'))].map((m) => text(m[1]));
    assert.deepEqual(links, [envLabel[locale]], 'one link to Środowisko, labelled with the section title');
    // After the EU disclosure (below the irregularities notice), marked in the page language.
    const at = main.indexOf(`href="${target}"`);
    assert.ok(at > main.indexOf('notice notice--plain'), 'after the project content');
    assert.match(main.slice(main.lastIndexOf('<div', at), at), new RegExp(`lang="${locale}"`), 'the link is in the page language');
    assert.ok((await get(quality[locale])).includes('id="srodowisko"'), 'Jakość has the Środowisko section');
    // The disclosure keeps both EU logos and its links, and names no company (GAP-07).
    assert.equal((main.match(/class="eu-logos"[\s\S]*?<\/div>/)?.[0].match(/<img/g) ?? []).length, 2, 'both EU logos');
    assert.ok(main.includes('href="https://nieprawidlowosci.mfipr.gov.pl/') && main.includes('href="mailto:naduzycia.POIS@mfipr.gov.pl"'), 'irregularities links');
    assert.ok(!text(main).includes('MCKEEN-BEEF'), 'no company named (GAP-07)');
  });
}
