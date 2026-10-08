import type { Locale } from '@/i18n/config';
import { t } from '@/i18n';
import { entityById } from '@/content/entities';
import { certificates, certificateScans, certificateTitle } from '@/content/certificates';
import type { ViewerCertificate } from './CertificateViewer';

/** Everything the client viewer needs: title, plant and the scan of each language version. */
export function certificateViewerData(locale: Locale): ViewerCertificate[] {
  return certificates
    .map((c) => ({
      id: c.id,
      title: certificateTitle(c, locale),
      subtitle: `${t(entityById(c.entity).place, locale)} · ${entityById(c.entity).legalName}`,
      scans: certificateScans(c),
    }))
    .filter((c) => c.scans.length > 0);
}
