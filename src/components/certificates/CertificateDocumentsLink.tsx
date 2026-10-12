import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { href } from '@/i18n/routes';
import { entityById, type EntityId } from '@/content/entities';

/**
 * Next step after a plant's published current certificates (UXA-05 stage 2): that plant's section on
 * Certyfikaty, with the certificates, previews and original PDFs. The section's id there is the
 * plant's anchor (`#zaklad-rozbioru` for the cutting plant in Lisków). Use it only where the plant's
 * current certificates are listed; plants without a published one get QualityContactLink (UXA-03).
 */
export function CertificateDocumentsLink({ locale, entity }: { locale: Locale; entity: EntityId }) {
  const d = getDictionary(locale);
  const e = entityById(entity);
  return (
    <Link href={`${href(locale, 'certificates')}#${e.anchor}`} className="arrow-link">
      {d.cert.documentsLink}
      <span className="visually-hidden">: {t(e.place, locale)}</span>
    </Link>
  );
}
