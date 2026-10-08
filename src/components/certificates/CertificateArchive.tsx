import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { entityById } from '@/content/entities';
import { archivedCertificates, standardName, type Certificate } from '@/content/certificates';
import { CertificateFiles } from './CertificateStatus';
import { formatDate, formatScore } from './format';

/**
 * Archive of expired certificates, grouped by plant and year, in a data table.
 * Native <details> keeps it collapsible without JavaScript.
 */
export function CertificateArchive({ locale, today }: { locale: Locale; today: string }) {
  const d = getDictionary(locale);
  const all = archivedCertificates(today);
  const byEntity = new Map<Certificate['entity'], Certificate[]>();
  for (const c of all) byEntity.set(c.entity, [...(byEntity.get(c.entity) ?? []), c]);

  return (
    <div className="archive">
      <p className="archive__intro">{d.cert.archiveIntro}</p>
      {[...byEntity.entries()].map(([entityId, certs]) => {
        const e = entityById(entityId);
        return (
          <details key={entityId} className="archive__group">
            <summary>
              <span className="archive__site">
                {t(e.place, locale)}
              </span>
              <span className="archive__entity">{e.legalName}</span>
              <span className="archive__count tnum">{certs.length}</span>
            </summary>
            <div className="table-wrap" role="region" aria-label={`${d.certificates.archiveTitle}: ${t(e.role, locale)}`} tabIndex={0}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">{d.cert.archive}</th>
                    <th scope="col">Standard</th>
                    <th scope="col">{d.cert.score}</th>
                    <th scope="col">{d.cert.validity}</th>
                    <th scope="col">{d.cert.files}</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map((c) => (
                    <tr key={c.id}>
                      <th scope="row" className="tnum">
                        {c.year}
                      </th>
                      <td>
                        {t(standardName[c.standard], locale)}
                        {c.version ? <span className="muted"> {c.standard === 'brcgs' ? c.version : `v${c.version}`}</span> : null}
                      </td>
                      <td className="tnum">
                        {c.score ? `${c.result}, ${formatScore(c.score, locale)}` : (c.result ?? '–')}
                      </td>
                      <td className="tnum">
                        <span className="badge badge--archive">{d.cert.expired}</span> {formatDate(c.expiresOn, locale)}
                      </td>
                      <td>
                        <CertificateFiles cert={c} locale={locale} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        );
      })}
    </div>
  );
}
