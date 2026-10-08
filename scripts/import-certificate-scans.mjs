#!/usr/bin/env node
/**
 * Certificate scans for the on-site viewer: one WEBP per certificate PDF.
 *
 *   node scripts/import-certificate-scans.mjs     (standalone; also called by import-source-assets.mjs)
 *
 * Source per PDF, authentic only:
 *   1. ../source-assets/images/certificates-rendered/<pdf>.png  (150 dpi render of the PDF,
 *      scripts/render-certificate-scans.py, only where the preview below is too small), else
 *   2. ../source-assets/images/certificates/<pdf>-preview.webp  (existing 1240 px preview).
 * Output: public/photos/certificates/<pdf>.webp (max 1240 px wide, never upscaled) and
 * `certificateScans` in src/content/generated/assets.json, keyed by the public PDF path.
 * No OCR, no retouching: resize + WEBP encode only.
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.resolve(SITE, '..', 'source-assets');
const PUB = path.join(SITE, 'public');
const MANIFEST = path.join(SITE, 'src', 'content', 'generated', 'assets.json');
const MAX_WIDTH = 1240;

const exists = async (p) => {
  try {
    return (await stat(p)).isFile();
  } catch {
    return false;
  }
};

export async function importCertificateScans(manifest) {
  const outDir = path.join(PUB, 'photos', 'certificates');
  await mkdir(outDir, { recursive: true });
  const scans = {};
  const base = path.join(SRC, 'pdfs', 'certificates');
  for (const site of (await readdir(base)).sort()) {
    for (const file of (await readdir(path.join(base, site))).sort()) {
      if (!file.toLowerCase().endsWith('.pdf')) continue;
      const stem = file.slice(0, -4);
      const rendered = path.join(SRC, 'images', 'certificates-rendered', `${stem}.png`);
      const preview = path.join(SRC, 'images', 'certificates', `${stem}-preview.webp`);
      const input = (await exists(rendered)) ? rendered : preview;
      if (!(await exists(input))) throw new Error(`no scan for ${site}/${file}`);
      const meta = await sharp(input).metadata();
      const width = Math.min(meta.width, MAX_WIDTH);
      const height = Math.round((meta.height * width) / meta.width);
      const rel = `photos/certificates/${stem}.webp`;
      await sharp(input).removeAlpha().resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 6 }).toFile(path.join(PUB, rel));
      scans[`/documents/certificates/${site}/${file}`] = { src: `/${rel}`, width, height };
    }
  }
  manifest.certificateScans = scans;
  return Object.keys(scans).length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const n = await importCertificateScans(manifest);
  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`certificate scans: ${n}`);
}
