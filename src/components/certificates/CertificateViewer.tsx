'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '@/components/ui/Icon';

export interface ViewerScan {
  lang: 'pl' | 'en' | 'de';
  src: string;
  width: number;
  height: number;
}

export interface ViewerCertificate {
  id: string;
  title: string;
  subtitle: string;
  scans: ViewerScan[];
}

interface Labels {
  dialog: string;
  close: string;
  langGroup: string;
  loading: string;
  zoomIn: string;
  zoomOut: string;
  langVersion: Record<ViewerScan['lang'], string>;
}

/**
 * On-site certificate viewer (one instance, rendered in the layout).
 * Any link with `data-cert-view="<certificate id>"` and `data-cert-lang` opens the authentic
 * scan of that language version as an image; the link's href (the scan image itself) is
 * the no-JS / modifier-click fallback. The original PDFs are separate plain links
 * (CertificateFiles with `pdf`) and are not intercepted.
 * Native <dialog>: focus stays inside, Escape closes, background is inert; scroll lock and
 * focus return to the trigger are handled explicitly. Only the selected scan is loaded.
 */
export function CertificateViewer({ certificates, labels }: { certificates: ViewerCertificate[]; labels: Labels }) {
  const ref = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<{ cert: ViewerCertificate; lang: ViewerScan['lang'] } | null>(null);
  const [loaded, setLoaded] = useState<string | null>(null);
  // Zoomed: the scan at its native width (1240 px), panned inside the stage only.
  const [zoom, setZoom] = useState(false);
  const byId = useRef(new Map(certificates.map((c) => [c.id, c])));

  const close = useCallback(() => ref.current?.close(), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest<HTMLElement>('[data-cert-view]');
      if (!a) return;
      const cert = byId.current.get(a.dataset.certView ?? '');
      if (!cert || !cert.scans.length) return; // unknown: let the href (scan image) work
      e.preventDefault();
      e.stopPropagation();
      const wanted = a.dataset.certLang as ViewerScan['lang'] | undefined;
      const lang = cert.scans.some((s) => s.lang === wanted) ? wanted! : cert.scans[0]!.lang;
      triggerRef.current = a;
      setState({ cert, lang });
      if (!ref.current?.open) ref.current?.showModal();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Scroll lock while open (html:has() covers it in CSS too) and focus return on any close path.
  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const onClose = () => {
      document.documentElement.classList.remove('is-viewing');
      setState(null);
      setLoaded(null);
      setZoom(false);
      const t = triggerRef.current;
      triggerRef.current = null;
      if (t && document.contains(t)) t.focus();
    };
    dlg.addEventListener('close', onClose);
    return () => dlg.removeEventListener('close', onClose);
  }, []);

  useEffect(() => {
    if (!state) return;
    document.documentElement.classList.add('is-viewing');
    stageRef.current?.scrollTo({ top: 0 });
  }, [state]);

  const scan = state ? (state.cert.scans.find((s) => s.lang === state.lang) ?? state.cert.scans[0]!) : null;

  const onLangKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!state || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    const langs = state.cert.scans.map((s) => s.lang);
    const i = langs.indexOf(state.lang);
    const next = langs[(i + (e.key === 'ArrowRight' ? 1 : langs.length - 1)) % langs.length]!;
    e.preventDefault();
    setState({ ...state, lang: next });
    requestAnimationFrame(() => e.currentTarget?.querySelector<HTMLButtonElement>(`[data-lang="${next}"]`)?.focus());
  };

  return (
    <dialog
      ref={ref}
      className="cview"
      aria-label={state ? `${labels.dialog}: ${state.cert.title}` : labels.dialog}
      onClick={(e) => {
        // Backdrop / empty area around the document closes; the document and controls do not.
        if (e.target === ref.current || e.target === stageRef.current) close();
      }}
    >
      {state && scan ? (
        <>
          <header className="cview__bar">
            <div className="cview__titles">
              <p className="cview__title">{state.cert.title}</p>
              <p className="cview__sub">{state.cert.subtitle}</p>
            </div>
            {state.cert.scans.length > 1 ? (
              <div className="cview__langs" role="group" aria-label={labels.langGroup} onKeyDown={onLangKeys}>
                {state.cert.scans.map((s) => (
                  <button
                    key={s.lang}
                    type="button"
                    data-lang={s.lang}
                    className="cview__lang"
                    aria-pressed={s.lang === state.lang}
                    aria-label={labels.langVersion[s.lang]}
                    onClick={() => setState({ ...state, lang: s.lang })}
                  >
                    {s.lang.toUpperCase()}
                  </button>
                ))}
              </div>
            ) : null}
            <button
              type="button"
              className="cview__tool"
              aria-pressed={zoom}
              onClick={() => setZoom((z) => !z)}
            >
              <Icon name={zoom ? 'zoomOut' : 'zoom'} size={20} />
              <span className="visually-hidden">{zoom ? labels.zoomOut : labels.zoomIn}</span>
            </button>
            <button type="button" className="cview__close" onClick={close} autoFocus>
              <Icon name="close" size={22} />
              <span className="visually-hidden">{labels.close}</span>
            </button>
          </header>
          <div ref={stageRef} className="cview__stage" data-zoom={zoom || undefined}>
            <figure
              className="cview__doc"
              style={{
                aspectRatio: `${scan.width} / ${scan.height}`,
                ['--native' as string]: `${scan.width}px`,
                ['--ar' as string]: scan.width / scan.height,
              }}
              onClick={() => setZoom((z) => !z)}
            >
              {/* Authentic scan at its own resolution; loaded only when selected. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={scan.src}
                src={scan.src}
                width={scan.width}
                height={scan.height}
                alt={`${state.cert.title}, ${state.cert.subtitle} (${labels.langVersion[scan.lang]})`}
                decoding="async"
                onLoad={() => setLoaded(scan.src)}
                data-loaded={loaded === scan.src || undefined}
              />
              {loaded !== scan.src ? (
                <span className="cview__loading" role="status">
                  {labels.loading}
                </span>
              ) : null}
            </figure>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
