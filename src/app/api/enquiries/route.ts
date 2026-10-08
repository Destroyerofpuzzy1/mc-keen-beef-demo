import { guardFormRequest, respond } from '@/lib/forms/pipeline';
import { getMailer, recipientFor } from '@/lib/mail';
import { enquiryEmail } from '@/lib/mail/templates';
import { logEvent } from '@/lib/security/log';
import { enquirySchema, fieldErrors, formDataToObject } from '@/lib/validation/forms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** B2B offer enquiry. See docs/architecture.md §8 and docs/security.md §2. */
export async function POST(req: Request) {
  const guard = await guardFormRequest(req, {
    form: 'enquiry',
    maxBytes: 64 * 1024,
    // A lost sales lead costs more than a little spam: fail open if Redis is down.
    limit: { limit: 5, windowSec: 600, onBackendError: 'allow' },
  });
  if (!guard.ok) return guard.response;
  const { fd, locale, id } = guard;

  try {
    const parsed = enquirySchema.safeParse(formDataToObject(fd, ['products']));
    if (!parsed.success) return respond(req, 'enquiry', locale, 'invalid', { errors: fieldErrors(parsed.error), id });

    const mailer = getMailer();
    const to = recipientFor('enquiry');
    if (!mailer || !to) {
      logEvent('error', 'form.enquiry.unconfigured', { id, mailer: Boolean(mailer), recipient: Boolean(to) });
      return respond(req, 'enquiry', locale, 'unavailable', { id });
    }

    const mail = enquiryEmail(parsed.data, id);
    await mailer.send({ to, replyTo: parsed.data.email, ...mail });
    logEvent('info', 'form.enquiry.sent', { id, provider: mailer.name, products: parsed.data.products.length });
    return respond(req, 'enquiry', locale, 'ok', { id });
  } catch (err) {
    logEvent('error', 'form.enquiry.failed', { id, message: (err as Error).message });
    return respond(req, 'enquiry', locale, 'error', { id });
  }
}

export function GET() {
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
}
