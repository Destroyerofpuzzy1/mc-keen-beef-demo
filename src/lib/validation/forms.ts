import 'server-only';
import { z } from 'zod';
import { enquiryProductOptions } from '@/content/products';
import { jobPositionOptions } from '@/content/jobs';

/**
 * Server-side schemas: the trust boundary for both forms. Error messages are
 * codes translated on the client (dictionary forms.fieldErrors).
 */
export type FieldErrorCode = 'required' | 'email' | 'phone' | 'tooLong' | 'products' | 'consent' | 'file';

// Strip control characters (keep \n and \t in multi-line fields) and normalise.
const clean = (v: unknown, multiline = false) =>
  typeof v === 'string'
    ? v
        .normalize('NFC')
        .replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, '')
        .replace(/\r\n?/g, '\n')
        .trim()
    : v;

const text = (max: number, required: boolean, multiline = false) => {
  const base = z.preprocess((v) => clean(v, multiline), z.string({ error: 'required' }).max(max, { error: 'tooLong' }));
  return required
    ? base.pipe(z.string().min(1, { error: 'required' }))
    : z.preprocess((v) => (v === null || v === undefined ? '' : v), base);
};

const email = (required: boolean) =>
  z.preprocess(
    (v) => clean(v),
    required
      ? z.string({ error: 'required' }).min(1, { error: 'required' }).max(200, { error: 'tooLong' }).pipe(z.email({ error: 'email' }))
      : z.union([z.literal(''), z.string().max(200, { error: 'tooLong' }).pipe(z.email({ error: 'email' }))]),
  );

const phoneRe = /^\+?[0-9 ()\-./]{6,25}$/;
const phone = (required: boolean) =>
  z.preprocess(
    (v) => clean(v ?? ''),
    required
      ? z.string().min(1, { error: 'required' }).regex(phoneRe, { error: 'phone' })
      : z.union([z.literal(''), z.string().regex(phoneRe, { error: 'phone' })]),
  );

const consent = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.literal(true, { error: 'consent' }));

export const enquiryTopics = ['products', 'sales', 'cooperation', 'other'] as const;

export const enquirySchema = z
  .object({
    person: text(120, true),
    company: text(160, true),
    email: email(true),
    phone: phone(false),
    country: text(80, true),
    topic: z.enum(enquiryTopics, { error: 'required' }),
    vat: text(40, false),
    products: z.array(z.enum(enquiryProductOptions), { error: 'products' }).max(enquiryProductOptions.length),
    productForm: z.enum(['chilled', 'frozen', 'unknown', '']).default(''),
    volume: text(500, false, true),
    message: text(3000, false, true),
    consent,
    locale: z.enum(['pl', 'en', 'de']).default('pl'),
  })
  // Product groups are required only for product enquiries.
  .refine((v) => v.topic !== 'products' || v.products.length > 0, { path: ['products'], message: 'products' });
export type Enquiry = z.infer<typeof enquirySchema>;

export const careersSchema = z.object({
  name: text(120, true),
  phone: phone(true),
  email: email(false),
  position: z.enum(jobPositionOptions, { error: 'required' }),
  message: text(2000, false, true),
  consent,
  locale: z.enum(['pl', 'en', 'de']).default('pl'),
});
export type CareersApplication = z.infer<typeof careersSchema>;

/** Flattens Zod issues to { field: code } (first issue per field). */
export function fieldErrors(error: z.ZodError): Record<string, FieldErrorCode> {
  const out: Record<string, FieldErrorCode> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    if (out[field]) continue;
    const code = issue.message as FieldErrorCode;
    out[field] = (['required', 'email', 'phone', 'tooLong', 'products', 'consent', 'file'] as const).includes(code) ? code : 'required';
  }
  return out;
}

/** Converts FormData into a plain object; repeated keys become arrays. */
export function formDataToObject(fd: FormData, arrayKeys: string[] = []): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    const values = fd.getAll(key).filter((v): v is string => typeof v === 'string');
    obj[key] = arrayKeys.includes(key) ? values : values[0];
  }
  for (const k of arrayKeys) if (!(k in obj)) obj[k] = [];
  return obj;
}
