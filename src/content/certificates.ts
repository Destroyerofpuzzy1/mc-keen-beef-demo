import type { L, Locale } from '@/i18n/config';
import type { EntityId } from './entities';
import assets from './generated/assets.json';

/**
 * Every certificate published on the legacy site, with values read from the PDFs
 * (source-assets/pdfs/certificates). Status is NEVER stored: it is computed from
 * `expiresOn` at render time, so certificates move to the archive automatically.
 */
export type Standard = 'brcgs' | 'ifs-food' | 'eko';

export interface CertificateFile {
  lang: Locale;
  /** Public path (public/documents/certificates/...). */
  path: string;
  /** Path on the legacy server (under /html/), kept for 308 redirects. */
  legacy: string[];
}

export interface Certificate {
  id: string;
  entity: Extract<EntityId, 'sh' | 'cp'>;
  standard: Standard;
  /** Year as labelled on the legacy site (year of issue). */
  year: number;
  version?: string;
  /** BRCGS grade, or IFS level. */
  result?: string;
  /** IFS score in percent, as printed (e.g. "98,60"). */
  score?: string;
  audit?: 'announced' | 'unannounced';
  auditDate?: string;
  issuedOn?: string; // ISO date
  expiresOn: string; // ISO date (validity end)
  registration?: string;
  body: string;
  scope?: string; // English scope wording as printed on the EN certificate
  files: CertificateFile[];
}

const GQ = 'Global Quality Sp. z o.o.';
const EKO = 'Ekogwarancja PTRE Sp. z o.o.';
const CP_SCOPE_2019 = 'Cutting and packaging of chilled and frozen beef meat (vacuum and loose, plastic containers, cartons).';
const CP_SCOPE_2023 = 'Cutting, mincing and packaging of chilled and frozen beef in plastic packaging under vacuum and bulk in plastic containers and cartons.';
const CP_SCOPE_2024 = 'Cutting and packaging of chilled and frozen beef in vacuum and bulk plastic containers and cartons.';
const CP_SCOPE_2025 = 'Cutting and packaging of chilled and frozen beef in plastic packaging vacuum and bulk plastic containers and cartons.';
const SH_SCOPE = 'Beef slaughter and cutting of beef meat: beef quarters, beef elements, beef offals, chilled and frozen. Packing: loose, vacuum, plastic tray, cardboard.';

const base = '/documents/certificates';
const cpFiles = (year: number, std: 'brcgs' | 'ifs-food', legacy: (l: Locale) => string[]): CertificateFile[] =>
  (['pl', 'en', 'de'] as const).map((lang) => ({
    lang,
    path: `${base}/cutting-plant-cp/cutting-plant-cp-${year}-${std}-${lang}.pdf`,
    legacy: legacy(lang),
  }));
const shFiles = (year: number, langs: readonly Locale[], legacy: (l: Locale) => string[]): CertificateFile[] =>
  langs.map((lang) => ({
    lang,
    path: `${base}/slaughterhouse-sh/slaughterhouse-sh-${year}-ifs-food-${lang}.pdf`,
    legacy: legacy(lang),
  }));
const UP = (l: Locale) => l.toUpperCase();

export const certificates: Certificate[] = [
  // ── Zakład rozbioru, MCKEEN-BEEF CP, Lisków ─────────────────────────────
  {
    id: 'cp-2026-brcgs', entity: 'cp', standard: 'brcgs', year: 2026, version: 'Issue 9', result: 'AA+',
    audit: 'unannounced', auditDate: '27–30.01.2026', issuedOn: '2026-03-13', expiresOn: '2027-04-27',
    registration: 'BRC2402', body: GQ, scope: CP_SCOPE_2025,
    files: cpFiles(2026, 'brcgs', (l) => [`images/certyfikaty/CP/2026/BRC_2026_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2026-ifs', entity: 'cp', standard: 'ifs-food', year: 2026, version: '8', result: 'Higher Level', score: '98,60',
    audit: 'unannounced', auditDate: '27–30.01.2026', issuedOn: '2026-03-13', expiresOn: '2027-05-12',
    registration: 'IFS2239', body: GQ, scope: CP_SCOPE_2025,
    files: cpFiles(2026, 'ifs-food', (l) => [`images/certyfikaty/CP/2026/IFS_2026_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2025-brcgs', entity: 'cp', standard: 'brcgs', year: 2025, version: 'Issue 9', result: 'AA',
    audit: 'announced', auditDate: '25–28.02.2025', issuedOn: '2025-04-02', expiresOn: '2026-04-27',
    registration: 'BRC2079', body: GQ, scope: CP_SCOPE_2025,
    files: cpFiles(2025, 'brcgs', (l) => [`images/certyfikaty/CP/2025/BRC_2025_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2025-ifs', entity: 'cp', standard: 'ifs-food', year: 2025, version: '8', result: 'Higher Level', score: '97,66',
    audit: 'announced', auditDate: '25–28.02.2025', issuedOn: '2025-04-02', expiresOn: '2026-05-12',
    registration: 'IFS1873', body: GQ, scope: CP_SCOPE_2025,
    files: cpFiles(2025, 'ifs-food', (l) => [`images/certyfikaty/CP/2025/IFS_2025_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2024-brcgs', entity: 'cp', standard: 'brcgs', year: 2024, version: 'Issue 9', result: 'AA',
    audit: 'announced', auditDate: '05–08.03.2024', issuedOn: '2024-04-17', expiresOn: '2025-04-27',
    registration: 'BRC1787', body: GQ, scope: CP_SCOPE_2024,
    files: cpFiles(2024, 'brcgs', (l) => [`images/certyfikaty/CP/2024/BRC_2024_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2024-ifs', entity: 'cp', standard: 'ifs-food', year: 2024, version: '8', result: 'Higher Level', score: '98,83',
    audit: 'announced', auditDate: '05–08.03.2024', issuedOn: '2024-04-17', expiresOn: '2025-05-12',
    registration: 'IFS1556', body: GQ, scope: CP_SCOPE_2024,
    files: cpFiles(2024, 'ifs-food', (l) => [`images/certyfikaty/CP/2024/IFS_2024_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2023-brcgs', entity: 'cp', standard: 'brcgs', year: 2023, version: 'Issue 8', result: 'AA+',
    audit: 'unannounced', auditDate: '18–20.01.2023', issuedOn: '2023-03-01', expiresOn: '2024-04-27',
    registration: 'BRC1494', body: GQ, scope: CP_SCOPE_2023,
    files: cpFiles(2023, 'brcgs', (l) => [`images/certyfikaty/CP/2023/BRC_2023_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2023-ifs', entity: 'cp', standard: 'ifs-food', year: 2023, version: '7', result: 'Higher Level', score: '97,50',
    audit: 'unannounced', auditDate: '18–20.01.2023', issuedOn: '2023-03-01', expiresOn: '2024-05-12',
    registration: 'IFS1250', body: GQ, scope: CP_SCOPE_2023,
    files: cpFiles(2023, 'ifs-food', (l) => [`images/certyfikaty/CP/2023/IFS_2023_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2022-brcgs', entity: 'cp', standard: 'brcgs', year: 2022, version: 'Issue 8', result: 'A',
    audit: 'announced', auditDate: '22–24.02.2022', issuedOn: '2022-04-01', expiresOn: '2023-04-27',
    registration: 'BRC1275', body: GQ, scope: CP_SCOPE_2019,
    files: cpFiles(2022, 'brcgs', (l) => [`images/certyfikaty/CP/2022/BRC_2022_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2022-ifs', entity: 'cp', standard: 'ifs-food', year: 2022, version: '7', result: 'Higher Level', score: '95,77',
    auditDate: '22–24.02.2022', issuedOn: '2022-04-01', expiresOn: '2023-05-12',
    registration: 'IFS1037', body: GQ, scope: CP_SCOPE_2019,
    files: cpFiles(2022, 'ifs-food', (l) => [`images/certyfikaty/CP/2022/IFS_2022_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2022-eko', entity: 'cp', standard: 'eko', year: 2022, issuedOn: '2022-04-22', expiresOn: '2023-07-21',
    registration: 'PL-EKO-01-015040/2A', body: EKO,
    files: [{ lang: 'pl', path: `${base}/cutting-plant-cp/cutting-plant-cp-2022-ekogwarancja-pl.pdf`, legacy: ['images/certyfikaty/CP/2022/EKO2022_PL.pdf'] }],
  },
  {
    id: 'cp-2021-brcgs', entity: 'cp', standard: 'brcgs', year: 2021, version: 'Issue 8', result: 'A',
    audit: 'announced', auditDate: '09–11.03.2021', issuedOn: '2021-04-14', expiresOn: '2022-04-27',
    registration: 'BRC1063', body: GQ, scope: CP_SCOPE_2019,
    files: cpFiles(2021, 'brcgs', (l) => [`images/certyfikaty/CP/2021/BRC_2021_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2021-ifs', entity: 'cp', standard: 'ifs-food', year: 2021, version: '6.1', result: 'Higher Level',
    auditDate: '09–11.03.2021', issuedOn: '2021-04-14', expiresOn: '2022-05-12',
    registration: 'IFS0843', body: GQ, scope: CP_SCOPE_2019,
    files: cpFiles(2021, 'ifs-food', (l) => [`images/certyfikaty/CP/2021/IFS_2021_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2021-eko', entity: 'cp', standard: 'eko', year: 2021, issuedOn: '2021-04-26', expiresOn: '2022-07-25',
    registration: 'PL-EKO-01-015040', body: EKO,
    files: [{ lang: 'pl', path: `${base}/cutting-plant-cp/cutting-plant-cp-2021-ekogwarancja-pl.pdf`, legacy: ['images/certyfikaty/CP/2021/EKO2021_PL.pdf'] }],
  },
  {
    id: 'cp-2020-brcgs', entity: 'cp', standard: 'brcgs', year: 2020, version: 'Issue 8', result: 'A',
    audit: 'announced', auditDate: '16–18.03.2020', issuedOn: '2020-04-27', expiresOn: '2021-04-27',
    registration: 'BRC0863', body: GQ, scope: CP_SCOPE_2019,
    // The legacy page linked /CP/2019/BRC_2020_*.pdf (404); the file lived in /CP/2020/.
    files: cpFiles(2020, 'brcgs', (l) => [`images/certyfikaty/CP/2020/BRC_2020_${UP(l)}.pdf`, `images/certyfikaty/CP/2019/BRC_2020_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2020-ifs', entity: 'cp', standard: 'ifs-food', year: 2020, version: '6.1', result: 'Higher Level',
    auditDate: '16–18.03.2020', issuedOn: '2020-04-27', expiresOn: '2021-05-12',
    registration: 'IFS0660', body: GQ, scope: CP_SCOPE_2019,
    files: cpFiles(2020, 'ifs-food', (l) => [`images/certyfikaty/CP/2020/IFS_2020_${UP(l)}.pdf`]),
  },
  {
    id: 'cp-2019-brcgs', entity: 'cp', standard: 'brcgs', year: 2019, version: 'Issue 8', result: 'A',
    audit: 'announced', auditDate: '11–13.03.2019', issuedOn: '2019-04-18', expiresOn: '2020-04-27',
    registration: 'BRC0603', body: GQ, scope: CP_SCOPE_2019,
    files: cpFiles(2019, 'brcgs', (l) => [`images/certyfikaty/CP/2019/01_Certyfikaty_CP_BRC-2019-${l}.pdf`]),
  },
  {
    id: 'cp-2019-ifs', entity: 'cp', standard: 'ifs-food', year: 2019, version: '6.1', result: 'Higher Level',
    auditDate: '11–13.03.2019', issuedOn: '2019-04-18', expiresOn: '2020-04-24',
    registration: 'IFS0475', body: GQ, scope: CP_SCOPE_2019,
    files: cpFiles(2019, 'ifs-food', (l) => [`images/certyfikaty/CP/2019/02_Certyfikaty_CP_IFS-2019-${l}.pdf`]),
  },

  // ── Zakład uboju, MCKEEN-BEEF SH, Linne ──────────────────────────────────
  {
    id: 'sh-2023-ifs', entity: 'sh', standard: 'ifs-food', year: 2023, version: '7', result: 'Higher Level', score: '96,05',
    audit: 'unannounced', auditDate: '05–06.07.2023', issuedOn: '2023-08-16', expiresOn: '2024-09-21',
    registration: 'IFS1377', body: GQ, scope: SH_SCOPE,
    files: shFiles(2023, ['pl', 'en', 'de'], (l) => [`images/certyfikaty/SH/2023/IFS_2023_${UP(l)}.pdf`]),
  },
  {
    id: 'sh-2022-ifs', entity: 'sh', standard: 'ifs-food', year: 2022, version: '7', result: 'Higher Level', score: '95,52',
    auditDate: '17–18.06.2022', issuedOn: '2022-07-14', expiresOn: '2023-09-21',
    registration: 'IFS1109', body: GQ, scope: SH_SCOPE,
    files: shFiles(2022, ['pl', 'en', 'de'], (l) => [`images/certyfikaty/SH/2022/IFS_2022_${UP(l)}.pdf`]),
  },
  {
    id: 'sh-2021-eko', entity: 'sh', standard: 'eko', year: 2021, issuedOn: '2021-04-26', expiresOn: '2022-07-25',
    registration: 'PL-EKO-01-015047', body: EKO,
    files: (['pl', 'de'] as const).map((lang) => ({
      lang,
      path: `${base}/slaughterhouse-sh/slaughterhouse-sh-2021-ekogwarancja-${lang}.pdf`,
      legacy: [`images/certyfikaty/SH/2021/01_Certyfikaty_SH_EKO2021_${lang}.pdf`],
    })),
  },
  {
    id: 'sh-2019-ifs', entity: 'sh', standard: 'ifs-food', year: 2019, version: '6.1', result: 'Higher Level',
    auditDate: '15–16.07.2019', issuedOn: '2019-08-26', expiresOn: '2020-09-03',
    registration: 'IFS0559', body: GQ, scope: SH_SCOPE,
    files: shFiles(2019, ['pl', 'en', 'de'], (l) => [`images/certyfikaty/SH/2019/04_Certyfikaty_SH_IFS-2019-${l}.pdf`]),
  },
];

/** Authentic scan (WEBP image) of one certificate file, for the on-site viewer. */
export interface CertificateScan {
  lang: Locale;
  src: string;
  width: number;
  height: number;
}

const scanIndex = (assets as unknown as { certificateScans: Record<string, Omit<CertificateScan, 'lang'>> }).certificateScans;

/** Scans of all language versions of a certificate (scripts/import-certificate-scans.mjs). */
export function certificateScans(cert: Certificate): CertificateScan[] {
  return cert.files.flatMap((f) => {
    const s = scanIndex[f.path];
    return s ? [{ lang: f.lang, ...s }] : [];
  });
}

/** Display title of a certificate, e.g. "IFS Food 2026". */
export const certificateTitle = (cert: Certificate, locale: Locale) => `${standardName[cert.standard][locale]} ${cert.year}`;

export const standardName: Record<Standard, L> = {
  brcgs: { pl: 'BRCGS Food Safety', en: 'BRCGS Food Safety', de: 'BRCGS Food Safety' },
  'ifs-food': { pl: 'IFS Food', en: 'IFS Food', de: 'IFS Food' },
  eko: { pl: 'Rolnictwo ekologiczne (EKO)', en: 'Organic production (EKO)', de: 'Ökologische Produktion (EKO)' },
};

/** Today in Europe/Warsaw as YYYY-MM-DD; evaluated per request. */
export function todayIso(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(now);
}

export const isCurrent = (c: Certificate, today = todayIso()) => c.expiresOn >= today;

export const currentCertificates = (today = todayIso()) =>
  certificates.filter((c) => isCurrent(c, today)).sort((a, b) => a.standard.localeCompare(b.standard));

export const archivedCertificates = (today = todayIso()) =>
  certificates.filter((c) => !isCurrent(c, today)).sort((a, b) => b.year - a.year || a.standard.localeCompare(b.standard));

/** Sites for which no current certificate exists on the website (pending C-01, C-02). */
export const sitesWithoutCurrentCertificate = (today = todayIso()) => {
  const withCurrent = new Set(currentCertificates(today).map((c) => c.entity));
  return (['sh', 'sh2'] as const).filter((e) => !withCurrent.has(e as 'sh'));
};

