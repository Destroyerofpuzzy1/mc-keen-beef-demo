import type { L } from '@/i18n/config';
import assets from './generated/assets.json';

/**
 * Semantic image registry. Pages ask for what a picture shows (media.truck,
 * media.carcassInspection), never for a file path. All files live in
 * public/photos/<category>/ and are produced by scripts/import-source-assets.mjs,
 * which also records their intrinsic size. `position` is the intentional crop focus.
 */
export interface MediaItem {
  src: string;
  width: number;
  height: number;
  alt: L;
  position?: string;
}

type Key = keyof typeof assets.images;
const item = (key: Key, alt: L, position?: string): MediaItem => ({ ...assets.images[key], alt, position });

export const media = {
  // Hero / origin
  heroHerd: item(
    'hero-cattle-herd',
    { pl: 'Stado bydła na pastwisku o wschodzie słońca', en: 'Herd of cattle on pasture at sunrise', de: 'Rinderherde auf der Weide bei Sonnenaufgang' },
    '58% 62%',
  ),
  herefordPasture: item(
    'hereford-pasture',
    { pl: 'Bydło rasy hereford na pastwisku', en: 'Hereford cattle on pasture', de: 'Hereford-Rinder auf der Weide' },
    'center 55%',
  ),
  herefordBull: item(
    'hereford-bull',
    { pl: 'Hodowca przy byku rasy hereford', en: 'Farmer with a Hereford bull', de: 'Landwirt mit einem Hereford-Bullen' },
    '30% center',
  ),
  feedingCattle: item(
    'hand-feeding-cattle',
    { pl: 'Karmienie bydła ziarnem z ręki', en: 'Hand-feeding cattle with grain', de: 'Rinder werden von Hand mit Getreide gefüttert' },
    '45% 70%',
  ),
  mistyRiverside: item(
    'misty-riverside',
    { pl: 'Bydło na pastwisku nad rzeką o poranku', en: 'Cattle grazing by a river in the morning', de: 'Rinder am Flussufer am Morgen' },
    'center 60%',
  ),
  vetFarmer: item(
    'vet-farmer-herd',
    { pl: 'Kontrola stada na pastwisku', en: 'Herd inspection on pasture', de: 'Kontrolle der Herde auf der Weide' },
  ),
  // Quality / control / certification
  carcassInspection: item(
    'carcass-inspection',
    { pl: 'Kontrola tuszy z kartą kontrolną', en: 'Carcass inspection with a checklist', de: 'Schlachtkörperkontrolle mit Prüfliste' },
    '60% center',
  ),
  // Production
  butcherCutting: item(
    'butcher-cutting',
    { pl: 'Rozbiór wołowiny w rękawicy ochronnej', en: 'Beef cutting with a protective glove', de: 'Rindfleischzerlegung mit Schutzhandschuh' },
    '72% center',
  ),
  // Logistics / cold chain
  truck: item(
    'truck-highway',
    { pl: 'Ciężarówka chłodnia McKeen-Beef na autostradzie', en: 'McKeen-Beef refrigerated truck on a motorway', de: 'McKeen-Beef-Kühl-Lkw auf der Autobahn' },
    '40% 70%',
  ),
  truckTrailer: item(
    'truck-trailer',
    { pl: 'Naczepa chłodnia z logo McKeen-Beef', en: 'Refrigerated trailer with the McKeen-Beef logo', de: 'Kühlauflieger mit McKeen-Beef-Logo' },
    '50% 70%',
  ),
  // Company / export
  staffBeef: item(
    'staff-beef-uniform',
    { pl: 'Pracownicy oglądają zapakowany element wołowy', en: 'Staff inspecting a packed beef cut', de: 'Mitarbeitende begutachten ein verpacktes Rindfleischteilstück' },
    'center 35%',
  ),
  // Products. Illustrative only (shown with "Zdjęcie poglądowe"); no own product photography yet (C-61).
  // The legacy "ćwierci" (tied roast) and "elementy" (sliced cooked steak) photos are no longer used:
  // they suggested restaurant dishes instead of B2B products (audit P1-02).
  rawTbone: item('raw-tbone-paper', {
    pl: 'Surowy element wołowy z kością na papierze',
    en: 'Raw bone-in beef cut on butcher paper',
    de: 'Rohes Rindfleischteilstück mit Knochen auf Metzgerpapier',
  }),
  productMiesaDrobne: item('product-miesa-drobne', { pl: 'Mięso wołowe w kawałkach na desce', en: 'Diced beef on a board', de: 'Rindfleischstücke auf einem Brett' }),
  productPodroby: item('product-podroby', { pl: 'Wątroba wołowa', en: 'Beef liver', de: 'Rinderleber' }),
} satisfies Record<string, MediaItem>;

export type MediaKey = keyof typeof media;

type ProductKey = 'cwierci' | 'elementy' | 'miesa-drobne' | 'podroby' | 'uppz';

/**
 * Photo per product group. `null`: no authentic photo exists, the group is shown with the
 * brand beef-cuts line art instead (ProductVisual). Never substitute a misleading photo.
 */
export const productMedia: Record<ProductKey, MediaKey | null> = {
  cwierci: null,
  elementy: 'rawTbone',
  'miesa-drobne': 'productMiesaDrobne',
  podroby: 'productPodroby',
  uppz: 'carcassInspection',
};

/** Bull half of the brand beef-cuts line art (scripts/import-source-assets.mjs). */
export const lineArtBull = '/assets/brand/beef-cuts-bull.svg';

/** Legacy category icons (from the old "Grupy produktowe" graphic), used as CSS masks. */
export const icons = assets.icons;
export const productIcon: Record<ProductKey, keyof typeof assets.icons> = {
  cwierci: 'cow',
  elementy: 'bull',
  'miesa-drobne': 'steak',
  podroby: 'liver',
  uppz: 'liver',
};

/** Ambient cattle loop (re-encoded legacy video) with its poster. */
export const video = { ...assets.video!, poster: assets.images['cattle-grazing-poster'] };

/**
 * Home hero loop: the supplied `home_bottom.mp4` (same footage as the ambient loop). Desktop and
 * tablet get the original H.264 stream unchanged (remuxed only: no re-encoding loss); phones get
 * a centred 1:1 crop at the source's full height (CRF 22). The poster is frame 0 at 1920 px, so the
 * first video frame lands exactly on it; a smaller poster would be upscaled and the browser would
 * then count the video frame as the larger, later LCP element. Kept in public/video/, outside the
 * folders rewritten by the import script; file names carry a content hash because /video/* is
 * cached for seven days (see docs/asset-map.md).
 */
export const heroVideo = {
  desktop: { src: '/video/home-hero-1920.429f8fc6.mp4', width: 1920, height: 800 },
  mobile: { src: '/video/home-hero-800.c0ff7c32.mp4', width: 800, height: 800 },
  poster: {
    src: '/video/home-hero-poster.b0958c38.webp',
    width: 1920,
    height: 800,
    alt: { pl: 'Stado bydła na pastwisku', en: 'Herd of cattle grazing on pasture', de: 'Rinderherde auf der Weide' },
  } satisfies MediaItem,
};

