import { validateCv } from '@/lib/files/cv';
import { guardFormRequest, respond } from '@/lib/forms/pipeline';
import { getMailer, recipientFor } from '@/lib/mail';
import { careersEmail } from '@/lib/mail/templates';
import { logEvent } from '@/lib/security/log';
import { careersSchema, fieldErrors, formDataToObject } from '@/lib/validation/forms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Job application with optional CV (PDF/DOC/DOCX ≤ 5 MB). The file is validated
 * and attached in memory only; it is never written to disk or /public.
 */
export async function POST(req: Request) {
  const guard = await guardFormRequest(req, {
    form: 'careers',
    maxBytes: 6 * 1024 * 1024,
    // Uploads are expensive: fail closed if the persistent limiter is down.
    limit: { limit: 3, windowSec: 600, onBackendError: 'deny' },
  });
  if (!guard.ok) return guard.response;
  const { fd, locale, id } = guard;

  try {
    const parsed = careersSchema.safeParse(formDataToObject(fd));
    const cv = await validateCv(fd.get('cv'));
    const errors = parsed.success ? {} : fieldErrors(parsed.error);
    if (!cv.ok) {
      errors.cv = 'file';
      logEvent('warn', 'form.careers.file-rejected', { id, reason: cv.reason });
    }
    if (!parsed.success || !cv.ok) return respond(req, 'careers', locale, 'invalid', { errors, id });

    const mailer = getMailer();
    const to = recipientFor('careers');
    if (!mailer || !to) {
      logEvent('error', 'form.careers.unconfigured', { id, mailer: Boolean(mailer), recipient: Boolean(to) });
      return respond(req, 'careers', locale, 'unavailable', { id });
    }

    const file = cv.file;
    const mail = careersEmail(parsed.data, id, Boolean(file));
    await mailer.send({
      to,
      replyTo: parsed.data.email || undefined,
      ...mail,
      attachments: file ? [{ filename: file.filename, content: file.content, contentType: file.contentType }] : undefined,
    });
    logEvent('info', 'form.careers.sent', {
      id,
      provider: mailer.name,
      hasCv: Boolean(file),
      sizeBucketKb: file ? Math.ceil(file.size / 256_000) * 250 : 0,
    });
    return respond(req, 'careers', locale, 'ok', { id });
  } catch (err) {
    logEvent('error', 'form.careers.failed', { id, message: (err as Error).message });
    return respond(req, 'careers', locale, 'error', { id });
  }
}

export function GET() {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
}
