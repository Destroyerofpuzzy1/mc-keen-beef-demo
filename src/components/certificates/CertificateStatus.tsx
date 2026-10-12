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
export function CertificateLabel({
  cert,
  locale,
  compact = false,
  pdf = false,
}: {
  cert: Certificate;
  locale: Locale;
  compact?: boolean;
  /** Also link the original PDFs (Certyfikaty page). */
  pdf?: boolean;
}) {
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
      <CertificateFiles cert={cert} locale={locale} pdf={pdf} />
    </article>
  );
}

/**
 * Language controls for a certificate: PL / EN / DE open the authentic scan in the on-site
 * viewer (CertificateViewer). The href is the scan image itself (no-JS and new-tab fallback).
 * With `pdf` (Certyfikaty page: current certificates and archive) a second row links the
 * original PDF of every language version as plain links the browser opens or downloads.
 * `context` (archive: the plant) is added to every link name, so equal titles of different
 * plants, e.g. "IFS Food 2023" of Lisków and of Linne, stay distinct in a list of links (UXA-07).
 */
export function CertificateFiles({
  cert,
  locale,
  pdf = false,
  context,
}: {
  cert: Certificate;
  locale: Locale;
  pdf?: boolean;
  context?: string;
}) {
  const d = getDictionary(locale);
  const scans = certificateScans(cert);
  const title = context ? `${certificateTitle(cert, locale)} (${context})` : certificateTitle(cert, locale);
  const preview = scans.length ? (
    <div className="cert-files">
      <span className="cert-files__label">
        <Icon name={pdf ? 'zoom' : 'doc'} size={18} />
        {pdf ? <span className="cert-files__text">{d.cert.preview}</span> : d.cert.document}
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
              aria-label={
                pdf
                  ? `${title}, ${d.cert.preview} ${s.lang.toUpperCase()} (${d.cert.langVersion[s.lang]})`
                  : `${title}, ${d.cert.langVersion[s.lang]}`
              }
            >
              {s.lang.toUpperCase()}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
  if (!pdf) return preview;
  return (
    <div className="cert-docs">
      {preview}
      <div className="cert-files cert-files--pdf">
        <span className="cert-files__label">
          <Icon name="download" size={18} />
          <span className="cert-files__text">{d.cert.originalPdf}</span>
        </span>
        <ul className="cert-files__langs plain">
          {cert.files.map((f) => (
            <li key={f.lang}>
              <a
                href={f.path}
                type="application/pdf"
                className={`cert-files__lang${f.lang === locale ? ' is-local' : ''}`}
                hrefLang={f.lang}
                aria-label={`${title}, ${d.cert.originalPdf} ${f.lang.toUpperCase()} (${d.cert.langVersion[f.lang]})`}
              >
                {f.lang.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
      </div>
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
