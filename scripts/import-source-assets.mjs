#!/usr/bin/env node
/**
 * Imports the approved, public-facing assets from ../source-assets into the
 * Next.js project. Everything not listed here stays private (research files,
 * scraped HTML, page archives, rejected stock imagery).
 *
 *   npm run assets
 *
 * Outputs
 *   public/assets/brand/*, public/assets/images/*, public/assets/video/*
 *   public/documents/certificates/<site>/*.pdf
 *   public/documents/legal/*.pdf
 *   src/content/generated/assets.json   (intrinsic sizes for next/image)
 *
 * See docs/asset-map.md for the reasoning behind every entry.
 */
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { importCertificateScans } from './import-certificate-scans.mjs';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(SITE, '..', 'source-assets');
const PUB = path.join(SITE, 'public');
const OUT_ASSETS = path.join(PUB, 'assets');
const OUT_DOCS = path.join(PUB, 'documents');
const MANIFEST = path.join(SITE, 'src', 'content', 'generated', 'assets.json');

/** Copied byte for byte. */
const COPY = [
  ['brand/mckeen-beef-logo-red.svg', 'assets/brand/logo.svg'],
  ['brand/beef-cuts-bull-and-cow-line-art.svg', 'assets/brand/beef-cuts-line-art.svg'],
  ['brand/eu-funding/fundusze-europejskie-infrastruktura-srodowisko.jpg', 'assets/brand/eu/fundusze-europejskie-is.jpg'],
  ['brand/eu-funding/unia-europejska-fundusz-spojnosci.jpg', 'assets/brand/eu/ue-fundusz-spojnosci.jpg'],
  ['documents/tax-strategy/strategia-podatkowa-2023-mckeen-beef-sh.pdf', 'documents/legal/strategia-podatkowa-2023-mckeen-beef-sh.pdf'],
  ['documents/tax-strategy/strategia-podatkowa-2023-mckeen-beef-cp.pdf', 'documents/legal/strategia-podatkowa-2023-mckeen-beef-cp.pdf'],
];

/**
 * Photographs → public/photos/<category>/<name>.webp. `key` is the manifest key used
 * by src/content/media.ts. Crops are explicit pixel boxes chosen per image:
 * the legacy header photos carry a transparent curve in the bottom-right corner
 * (x > ~1146, y > ~586 at the right edge), so every box below stays inside the
 * opaque area while keeping as much of the photograph as possible. Nothing is upscaled.
 */
const IMAGES = [
  // Hero: herd at sunrise. 1680×1015 keeps the tree and the whole herd, no curve.
  { key: 'hero-cattle-herd', from: 'images/hero/cattle-herd-golden-sunrise-hero.webp', to: 'hero/cattle-herd-sunrise', extract: { left: 0, top: 0, width: 1680, height: 1015 } },
  // Cattle / origin
  { key: 'hereford-pasture', from: 'images/cattle/hereford-cattle-pasture-backlit.webp', to: 'cattle/hereford-pasture' },
  { key: 'hereford-bull', from: 'images/cattle/hereford-bull-head-hand-pat.webp', to: 'cattle/hereford-bull' },
  { key: 'hand-feeding-cattle', from: 'images/hero/hand-feeding-cattle-grain-hero.webp', to: 'cattle/hand-feeding', extract: { left: 0, top: 0, width: 1440, height: 860 } },
  { key: 'misty-riverside', from: 'images/hero/cattle-grazing-misty-riverside-hero.webp', to: 'cattle/misty-riverside', extract: { left: 0, top: 0, width: 1440, height: 860 } },
  { key: 'vet-farmer-herd', from: 'images/cattle/vet-and-farmer-inspecting-herd-small.webp', to: 'cattle/vet-farmer-herd' },
  { key: 'cattle-grazing-poster', from: 'images/cattle/red-cattle-grazing-video-poster.webp', to: 'cattle/grazing-poster', maxWidth: 1280 },
  // Quality / control: inspector with clipboard at a carcass, ≈5:4 (1080×860).
  { key: 'carcass-inspection', from: 'images/hero/carcass-inspection-clipboard-hero.webp', to: 'quality/carcass-inspection', extract: { left: 360, top: 0, width: 1080, height: 860 } },
  // Certification material from the legacy Jakość page (real IFS Food / BRCGS marks).
  // Not referenced by any page since the audit fixes (P1-02 / P2-04 / P2-05); kept for the record.
  { key: 'ifs-brcgs-banner', from: 'images/quality/ifs-brcgs-logos-beef-banner.webp', to: 'quality/ifs-brcgs-banner' },
  // Production
  { key: 'butcher-cutting', from: 'images/production/butcher-cutting-beef-mesh-glove.webp', to: 'production/butcher-cutting', flatten: '#ffffff' },
  // Logistics: full road scene + close crop of the refrigerated trailer (cold chain).
  { key: 'truck-highway', from: 'images/logistics/mckeen-beef-branded-truck-highway.webp', to: 'logistics/truck-highway' },
  { key: 'truck-trailer', from: 'images/logistics/mckeen-beef-branded-truck-highway.webp', to: 'logistics/truck-trailer', extract: { left: 0, top: 0, width: 1130, height: 847 } },
  // Company / export
  { key: 'staff-beef-uniform', from: 'images/company/staff-presenting-beef-branded-uniform.webp', to: 'company/staff-beef' },
  // Not referenced by any page since the audit fixes (P1-02 / P2-04 / P2-05); kept for the record.
  { key: 'europe-map', from: 'images/company/europe-map-sepia-locations.webp', to: 'company/europe-map' },
  // Products. Category photos are the photo areas of the legacy "Grupy produktowe"
  // graphic (630–660 px wide; never shown wider than that).
  { key: 'raw-tbone-paper', from: 'images/products/raw-t-bone-steak-butcher-paper-cutout.webp', to: 'products/raw-tbone-paper', keepAlpha: true },
  // Not referenced by any page since the audit fixes (P1-02 / P2-04 / P2-05); kept for the record.
  { key: 'product-elementy', from: 'images/products/product-groups-panel-pl.webp', to: 'products/elementy', extract: { left: 330, top: 92, width: 630, height: 233 } },
  // Not referenced by any page since the audit fixes (P1-02 / P2-04 / P2-05); kept for the record.
  { key: 'product-cwierci', from: 'images/products/product-groups-panel-pl.webp', to: 'products/cwierci', extract: { left: 300, top: 488, width: 660, height: 232 } },
  { key: 'product-miesa-drobne', from: 'images/products/product-groups-panel-pl.webp', to: 'products/miesa-drobne', extract: { left: 300, top: 885, width: 660, height: 235 } },
  { key: 'product-podroby', from: 'images/products/product-groups-panel-pl.webp', to: 'products/podroby', extract: { left: 300, top: 1285, width: 660, height: 232 } },
  // Certificate scans: all certificates, see import-certificate-scans.mjs.
];

/** Line icons embedded (as 512 px PNGs) in the legacy icon sprite, by sprite order. */
const ICONS = { cow: 0, truck: 4, handshake: 3, bull: 5, steak: 6, liver: 7, globe: 13 };

const VIDEO = { from: 'video/red-cattle-grazing-pasture-loop.mp4', to: 'assets/video/cattle-grazing.mp4' };

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function fileExists(p) {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
}

/** Returns the number of fully opaque rows from the top. */
async function opaqueTopRows(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + 3] !== 255) return y;
    }
  }
  return height;
}

async function processImage(entry, manifest) {
  const input = path.join(SRC, entry.from);
  let pipeline = sharp(input);
  const meta = await pipeline.metadata();
  let { width, height } = meta;

  if (entry.crop === 'opaque-top') {
    const rows = await opaqueTopRows(input);
    if (rows < 100) throw new Error(`opaque-top crop failed for ${entry.from}`);
    pipeline = pipeline.extract({ left: 0, top: 0, width, height: rows });
    height = rows;
  }
  if (entry.extract) {
    pipeline = pipeline.extract(entry.extract);
    ({ width, height } = entry.extract);
  }
  if (entry.flatten) pipeline = pipeline.flatten({ background: entry.flatten });
  else if (!entry.keepAlpha) pipeline = pipeline.removeAlpha();

  if (entry.maxWidth && width > entry.maxWidth) {
    height = Math.round((height * entry.maxWidth) / width);
    width = entry.maxWidth;
    pipeline = pipeline.resize({ width });
  }

  const rel = `photos/${entry.to}.webp`;
  const out = path.join(PUB, rel);
  await ensureDir(path.dirname(out));
  await pipeline.webp({ quality: 86, effort: 6, alphaQuality: 90 }).toFile(out);
  manifest.images[entry.key] = { src: `/${rel}`, width, height };
}

/**
 * Bull half of the legacy beef-cuts line art (same paths, cropped viewBox). Used as the
 * restrained graphic for "Ćwierci" while no authentic photo of beef quarters exists (C-61).
 */
async function buildLineArtBull() {
  const svg = await readFile(path.join(SRC, 'brand/beef-cuts-bull-and-cow-line-art.svg'), 'utf8');
  if (!svg.includes('viewBox="0 0 1836.8 383.26"')) throw new Error('unexpected line-art viewBox');
  await writeFile(path.join(OUT_ASSETS, 'brand/beef-cuts-bull.svg'), svg.replace('viewBox="0 0 1836.8 383.26"', 'viewBox="0 0 500 383.26"'));
}

/** Builds a standalone horns mark from the two vector paths in the legacy sprite. */
async function buildHorns() {
  const sprite = await readFile(path.join(SRC, 'brand/icons-sprite-incl-horns-mark.svg'), 'utf8');
  const paths = [...sprite.matchAll(/<path[^>]*?d="(M(?:799\.8|806\.2),149\.5[^"]+)"/g)].map((m) => m[1].replace(/\s+/g, ' ').trim());
  if (paths.length !== 2) throw new Error('horns paths not found in sprite');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="768 140 70 36" fill="currentColor">` +
    paths.map((d) => `<path d="${d}"/>`).join('') +
    `</svg>\n`;
  await writeFile(path.join(OUT_ASSETS, 'brand/horns.svg'), svg);
  // Red variant for favicons / contexts without currentColor.
  // Square viewBox so the mark sits centred in browser tabs.
  await writeFile(
    path.join(SITE, 'src/app/icon.svg'),
    svg.replace('viewBox="768 140 70 36"', 'viewBox="766 121 74 74"').replace('fill="currentColor"', 'fill="#C2000B"'),
  );
}

async function extractIcons(manifest) {
  const sprite = await readFile(path.join(SRC, 'brand/icons-sprite-incl-horns-mark.svg'), 'utf8');
  const pngs = [...sprite.matchAll(/xlink:href="data:image\/png;base64,([^"]+)"/g)].map((m) => Buffer.from(m[1].replace(/\s+/g, ''), 'base64'));
  await ensureDir(path.join(PUB, 'photos/icons'));
  for (const [name, index] of Object.entries(ICONS)) {
    const rel = `photos/icons/${name}.png`;
    // Black line art on transparency: usable as a CSS mask in any colour.
    await sharp(pngs[index]).resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(PUB, rel));
    manifest.icons[name] = `/${rel}`;
  }
}

async function buildOgImage(manifest) {
  const input = path.join(PUB, 'photos/hero/cattle-herd-sunrise.webp');
  const rel = 'photos/og-default.jpg';
  await sharp(input).resize(1200, 630, { fit: 'cover', position: 'centre' }).jpeg({ quality: 82 }).toFile(path.join(PUB, rel));
  manifest.images['og-default'] = { src: `/${rel}`, width: 1200, height: 630 };
}

async function importCertificates(manifest) {
  const base = path.join(SRC, 'pdfs/certificates');
  for (const site of await readdir(base)) {
    const dir = path.join(base, site);
    const outDir = path.join(OUT_DOCS, 'certificates', site);
    await ensureDir(outDir);
    for (const file of await readdir(dir)) {
      if (!file.toLowerCase().endsWith('.pdf')) continue;
      const head = (await readFile(path.join(dir, file))).subarray(0, 5).toString('latin1');
      if (head !== '%PDF-') throw new Error(`not a PDF: ${site}/${file}`);
      await copyFile(path.join(dir, file), path.join(outDir, file));
      manifest.certificates.push(`/documents/certificates/${site}/${file}`);
    }
  }
}

function importVideo() {
  const input = path.join(SRC, VIDEO.from);
  const output = path.join(PUB, VIDEO.to);
  // Re-encode: 1280 wide, no audio, H.264, faststart. Falls back to a plain copy.
  const ff = spawnSync(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-i', input, '-an', '-vf', 'scale=1280:-2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output],
    { stdio: 'inherit', shell: false },
  );
  return ff.status === 0;
}

async function main() {
  if (!(await fileExists(path.join(SRC, 'brand/mckeen-beef-logo-red.svg')))) {
    throw new Error(`source-assets not found at ${SRC}`);
  }
  // Only the generated directories are cleaned; nothing else in public/ is touched.
  await rm(OUT_ASSETS, { recursive: true, force: true });
  await rm(OUT_DOCS, { recursive: true, force: true });
  await rm(path.join(PUB, 'photos'), { recursive: true, force: true });
  for (const d of ['assets/brand/eu', 'assets/video', 'documents/legal', 'photos/certificates']) {
    await ensureDir(path.join(PUB, d));
  }

  const manifest = { generatedAt: new Date().toISOString(), images: {}, icons: {}, certificates: [], video: null };

  for (const [from, to] of COPY) await copyFile(path.join(SRC, from), path.join(PUB, to));
  await buildHorns();
  await buildLineArtBull();
  for (const entry of IMAGES) await processImage(entry, manifest);
  await extractIcons(manifest);
  await buildOgImage(manifest);
  await importCertificates(manifest);
  await importCertificateScans(manifest);

  if (!importVideo()) {
    console.warn('ffmpeg unavailable or failed: copying original video');
    await copyFile(path.join(SRC, VIDEO.from), path.join(PUB, VIDEO.to));
  }
  manifest.video = { src: `/${VIDEO.to}`, poster: manifest.images['cattle-grazing-poster'].src };
  manifest.certificates.sort();

  await ensureDir(path.dirname(MANIFEST));
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`imported ${Object.keys(manifest.images).length} images, ${manifest.certificates.length} certificate PDFs, 1 video`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
