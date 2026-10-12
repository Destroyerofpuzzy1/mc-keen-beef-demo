import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { entityById } from '@/content/entities';
import { archivedCertificates, standardName, type Certificate } from '@/content/certificates';
import { CertificateFiles } from './CertificateStatus';
import { formatDate, formatScore } from './format';

/**
 * Archive of expired certificates, grouped by plant and year, in a data table.
 * Native <details> keeps it collapsible without JavaScript.
 *
 * Phones (UXA-07): the same table is laid out as one compact entry per certificate
 * (components.css), so the preview and PDF buttons are always in view; no second markup.
 * The explicit table roles keep the table semantics when CSS changes the display of its parts.
 * The field labels are visible only in that layout and hidden from assistive technology,
 * which reads the column headers instead.
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
              <table className="data-table" role="table">
                <thead role="rowgroup">
                  <tr role="row">
                    <th scope="col" role="columnheader">{d.cert.archive}</th>
                    <th scope="col" role="columnheader">Standard</th>
                    <th scope="col" role="columnheader">{d.cert.score}</th>
                    <th scope="col" role="columnheader">{d.cert.validity}</th>
                    <th scope="col" role="columnheader">{d.cert.files}</th>
                  </tr>
                </thead>
                <tbody role="rowgroup">
                  {certs.map((c) => (
                    <tr key={c.id} role="row">
                      <th scope="row" role="rowheader" className="tnum">
                        {c.year}
                      </th>
                      <td role="cell">
                        {t(standardName[c.standard], locale)}
                        {c.version ? <span className="muted"> {c.standard === 'brcgs' ? c.version : `v${c.version}`}</span> : null}
                      </td>
                      <td role="cell" className={c.result ? 'tnum' : 'tnum archive__none'}>
                        <span className="archive__label" aria-hidden="true">
                          {d.cert.score}
                        </span>
                        {c.score ? `${c.result}, ${formatScore(c.score, locale)}` : (c.result ?? '–')}
                      </td>
                      <td role="cell" className="tnum">
                        <span className="archive__label" aria-hidden="true">
                          {d.cert.validity}
                        </span>
                        <span className="badge badge--archive">{d.cert.expired}</span> {formatDate(c.expiresOn, locale)}
                      </td>
                      <td role="cell">
                        <CertificateFiles cert={c} locale={locale} pdf context={t(e.place, locale)} />
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
