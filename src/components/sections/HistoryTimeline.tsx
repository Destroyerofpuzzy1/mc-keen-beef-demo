import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { history } from '@/content/history';

/** Vertical timeline; capacity figures are always labelled as historical. */
export function HistoryTimeline({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <ol className="timeline">
      {history.map((m) => (
        <li key={m.year} className="timeline__item">
          <p className="timeline__year tnum">{m.year}</p>
          <div className="timeline__body">
            <h3 className="timeline__title">{t(m.title, locale)}</h3>
            <p>{t(m.text, locale)}</p>
            {m.figure ? (
              <p className="timeline__figure">
                <span className="timeline__value tnum">{m.figure.value}</span>
                <span className="timeline__unit">
                  {t(m.figure.unit, locale)}
                  <span className="tag">{d.common.historical}</span>
                </span>
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
