import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { entityById } from '@/content/entities';
import { certificateScans, certificateTitle, standardName, type Certificate } from '@/content/certificates';
import { Icon } from '@/components/ui/Icon';
import { formatDate, formatScore } from './format';

/**
 * Current certificate as a "label": the result is the dominant element, followed by
 * validity, audit type and the plant it applies to. Used on Home (compact) and
 * Certyfikaty / Jakość (full).
 */
export function CertificateLabel({ cert, locale, compact = false }: { cert: Certificate; locale: Locale; compact?: boolean }) {
  const d = getDictionary(locale);
  const e = entityById(cert.entity);
  const headline = cert.score ? formatScore(cert.score, locale) : cert.result;
  const sub = cert.standard === 'brcgs' ? `${d.cert.grade}` : cert.result;

  return (
    <article className={`cert-label${compact ? ' cert-label--compact' : ''}`} aria-labelledby={`cert-${cert.id}`}>
      <header className="cert-label__head">
        <p className="cert-label__status">
          <Icon name="check" size={16} /> {d.cert.current}
        </p>
        <h3 id={`cert-${cert.id}`} className="cert-label__std">
          {t(standardName[cert.standard], locale)}
          <span className="cert-label__ver">
            {cert.standard === 'brcgs' ? cert.version : `${d.cert.version} ${cert.version}`}
          </span>
        </h3>
      </header>
      <p className="cert-label__result">
        <span className="cert-label__big tnum">{headline}</span>
        <span className="cert-label__sub">{sub}</span>
      </p>
      <dl className="cert-label__data">
        <div>
          <dt>{d.cert.validity}</dt>
          <dd className="tnum">
            {d.common.validUntil} {formatDate(cert.expiresOn, locale)}
          </dd>
        </div>
        {cert.audit ? (
          <div>
            <dt>{d.cert.audit}</dt>
            <dd>
              {d.cert[cert.audit]}
              {cert.auditDate ? <span className="tnum">, {cert.auditDate}</span> : null}
            </dd>
          </div>
        ) : null}
        <div>
          <dt>{d.cert.validFor}</dt>
          <dd>
            {t(e.place, locale)}
            <br />
            <span className="muted">{e.legalName}</span>
          </dd>
        </div>
        {!compact ? (
          <>
            <div>
              <dt>{d.cert.body}</dt>
              <dd>{cert.body}</dd>
            </div>
            <div>
              <dt>{d.cert.registration}</dt>
              <dd className="tnum">{cert.registration}</dd>
            </div>
            {cert.scope ? (
              <div className="cert-label__scope">
                <dt>{d.cert.scope}</dt>
                <dd>
                  <q lang="en">{cert.scope}</q>
                  <span className="cert-label__quote">{d.cert.scopeQuote}</span>
                </dd>
              </div>
            ) : null}
          </>
        ) : null}
      </dl>
      <CertificateFiles cert={cert} locale={locale} />
    </article>
  );
}

/**
 * Language controls for a certificate: PL / EN / DE open the authentic scan in the on-site
 * viewer (CertificateViewer). The href is the scan image itself (no-JS and new-tab fallback);
 * the PDFs stay published as archive files but are no longer the visitor's path.
 */
export function CertificateFiles({ cert, locale }: { cert: Certificate; locale: Locale }) {
  const d = getDictionary(locale);
  const scans = certificateScans(cert);
  if (!scans.length) return null;
  const title = certificateTitle(cert, locale);
  return (
    <div className="cert-files">
      <span className="cert-files__label">
        <Icon name="doc" size={18} />
        {d.cert.document}
      </span>
      <ul className="cert-files__langs plain">
        {scans.map((s) => (
          <li key={s.lang}>
            <a
              href={s.src}
              className={`cert-files__lang${s.lang === locale ? ' is-local' : ''}`}
              hrefLang={s.lang}
              data-cert-view={cert.id}
              data-cert-lang={s.lang}
              aria-label={`${title}, ${d.cert.langVersion[s.lang]}`}
            >
              {s.lang.toUpperCase()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Clickable scan thumbnail that opens the viewer in the page language. */
export function CertificateThumb({ cert, locale, sizes }: { cert: Certificate; locale: Locale; sizes: string }) {
  const d = getDictionary(locale);
  const scans = certificateScans(cert);
  const scan = scans.find((s) => s.lang === locale) ?? scans[0];
  if (!scan) return null;
  return (
    <a className="cert-thumb" href={scan.src} hrefLang={scan.lang} data-cert-view={cert.id} data-cert-lang={scan.lang}>
      <Image src={scan.src} alt="" width={scan.width} height={scan.height} sizes={sizes} quality={70} />
      <span className="cert-thumb__hint">
        <Icon name="zoom" size={18} />
        <span className="visually-hidden">
          {d.cert.enlarge}: {certificateTitle(cert, locale)}
        </span>
      </span>
    </a>
  );
}
