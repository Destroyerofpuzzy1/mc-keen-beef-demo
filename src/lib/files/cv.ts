import 'server-only';

/**
 * CV upload validation (docs/security.md §3). Extension, declared MIME type and
 * file signature must all agree. Files are kept in memory only.
 */
export const CV_MAX_BYTES = 5 * 1024 * 1024;

type Kind = 'pdf' | 'doc' | 'docx';

const MIME: Record<Kind, string[]> = {
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};
const CONTENT_TYPE: Record<Kind, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export interface ValidCv {
  filename: string;
  contentType: string;
  content: Buffer;
  size: number;
}

export type CvResult = { ok: true; file: ValidCv | null } | { ok: false; reason: string };

const startsWith = (buf: Buffer, bytes: number[]) => bytes.every((b, i) => buf[i] === b);

function sniff(buf: Buffer): Kind | null {
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf'; // %PDF-
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return 'doc'; // OLE2
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04])) {
    // ZIP: require the OOXML content-types part and a word/ entry. The central
    // directory at the end of the archive lists every entry name.
    const head = buf.subarray(0, Math.min(buf.length, 64 * 1024)).toString('latin1');
    const tail = buf.subarray(Math.max(0, buf.length - 64 * 1024)).toString('latin1');
    const names = head + tail;
    if (names.includes('[Content_Types].xml') && names.includes('word/document.xml')) return 'docx';
  }
  return null;
}

/** ASCII-only, path-free filename with the validated extension. */
export function sanitizeFilename(original: string, kind: Kind): string {
  const base = original.split(/[\\/]/).pop() ?? 'cv';
  const stem = base
    .replace(/\.[^.]*$/, '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80);
  return `${stem || 'cv'}.${kind}`;
}

export async function validateCv(value: FormDataEntryValue | null): Promise<CvResult> {
  if (value === null || typeof value === 'string') return { ok: true, file: null };
  const file = value as File;
  if (file.size === 0 && !file.name) return { ok: true, file: null };
  if (file.size === 0) return { ok: false, reason: 'empty' };
  if (file.size > CV_MAX_BYTES) return { ok: false, reason: 'too-large' };

  const ext = (file.name.split('.').pop() ?? '').toLowerCase() as Kind;
  if (!(ext in MIME)) return { ok: false, reason: 'extension' };

  const declared = (file.type || 'application/octet-stream').toLowerCase();
  if (!MIME[ext].includes(declared) && declared !== 'application/octet-stream') return { ok: false, reason: 'mime' };

  const content = Buffer.from(await file.arrayBuffer());
  if (content.length !== file.size || content.length > CV_MAX_BYTES) return { ok: false, reason: 'size-mismatch' };
  const kind = sniff(content);
  if (kind !== ext) return { ok: false, reason: 'signature' };

  return {
    ok: true,
    file: { filename: sanitizeFilename(file.name, kind), contentType: CONTENT_TYPE[kind], content, size: content.length },
  };
}
