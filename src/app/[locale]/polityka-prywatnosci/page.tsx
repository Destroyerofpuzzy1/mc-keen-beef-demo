import type { Metadata } from 'next';
import { Fragment, type ReactNode } from 'react';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { pageMetadata } from '@/lib/seo';
import { entityById } from '@/content/entities';
import { privacyIntro, privacySections, privacyTranslationApproved, type PrivacyBlock } from '@/content/privacy';
import { privacyDrafts } from '@/content/privacy-drafts';
import { PageHeader } from '@/components/layout/PageHeader';

export async function generateMetadata({ params }: PageProps<'/[locale]/polityka-prywatnosci'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'privacy', { title: d.privacy.title, description: d.privacy.description });
}

/** Turns e-mail addresses inside verbatim legal text into mailto links. */
function linkify(text: string): ReactNode {
  const parts = text.split(/([\w.+-]+@[\w-]+\.[\w.-]+)/g);
  return parts.map((p, i) =>
    /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(p) ? (
      <a key={i} href={`mailto:${p}`}>
        {p}
      </a>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

function Blocks({ blocks }: { blocks: PrivacyBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.type === 'p' ? (
          <p key={i}>{linkify(b.text)}</p>
        ) : (
          <ul key={i}>
            {b.items.map((it) => (
              <li key={it}>{linkify(it)}</li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

export default async function PrivacyPage({ params }: PageProps<'/[locale]/polityka-prywatnosci'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const p = d.privacy;
  // EN/DE translations exist as unapproved drafts; until approved the Polish text is shown.
  const translated = locale !== 'pl' && privacyTranslationApproved[locale];
  const legal = translated ? privacyDrafts[locale] : { intro: privacyIntro, sections: privacySections };
  const legalLang = translated ? locale : 'pl';

  return (
    <>
      <PageHeader locale={locale} routeKey="privacy" title={p.title} lead={p.lead}>
        {p.legalNote ? <p className="note">{p.legalNote}</p> : null}
      </PageHeader>

      <section className="section section--paper2" id="cookies" aria-labelledby="web-h">
        <div className="container prose">
          <h2 id="web-h" className="h-section">
            {p.websiteTitle}
          </h2>
          <p className="tag-line">
            <span className="tag">{d.common.pending}</span> {p.websiteDraft}
          </p>
          <ul className="ticks">
            {p.website.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" aria-labelledby="rodo-h">
        <div className="container prose">
          <h2 id="rodo-h" className="h-section">
            {p.sectionsTitle}
          </h2>
          <div lang={legalLang}>
          <Blocks blocks={legal.intro} />
          {legal.sections.map((s) => {
            const e = entityById(s.entity);
            return (
              <section key={s.entity} className="legal-section" id={`rodo-${s.entity}`}>
                <h3 className="legal-section__title">
                  {t(e.role, legalLang)}: {e.legalName}
                </h3>
                {s.items.map((item) => (
                  <details key={item.title} className="legal-item">
                    <summary>{item.title}</summary>
                    <div className="legal-item__body">
                      <Blocks blocks={item.blocks} />
                    </div>
                  </details>
                ))}
              </section>
            );
          })}
          </div>
        </div>
      </section>
    </>
  );
}
