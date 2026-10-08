import type { ReactNode } from 'react';

/**
 * Progressive disclosure for secondary data on phones (P2-03): a native <details> that is
 * collapsed below 56rem and always expanded on wider screens. Nothing is removed: content
 * stays in the HTML (find-in-page and no-JS work), only the mobile default is folded.
 * Desktop expansion uses ::details-content; browsers without it keep a working toggle.
 *
 * `heading` renders the title as a real heading on desktop and inside the summary on phones.
 */
export function MobileFold({
  summary,
  heading,
  className = '',
  children,
}: {
  summary: ReactNode;
  heading?: { level: 2 | 3; className?: string; id?: string };
  className?: string;
  children: ReactNode;
}) {
  const H = heading ? (`h${heading.level}` as const) : null;
  return (
    <details className={`mfold ${className}`.trim()}>
      <summary className="mfold__sum">
        {H ? <H className={heading?.className}>{summary}</H> : <span>{summary}</span>}
      </summary>
      {H ? (
        <H className={`mfold__title ${heading?.className ?? ''}`.trim()} id={heading?.id}>
          {summary}
        </H>
      ) : null}
      {children}
    </details>
  );
}
