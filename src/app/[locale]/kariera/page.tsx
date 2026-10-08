import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale, intlLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { jobPostingJsonLd, pageMetadata } from '@/lib/seo';
import { formContext } from '@/lib/forms/context';
import { media } from '@/content/media';
import { jobs } from '@/content/jobs';
import { entityById } from '@/content/entities';
import { recruitment, telHref } from '@/content/contacts';
import { PageHeader } from '@/components/layout/PageHeader';
import { CareersApply } from '@/components/forms/CareersApply';
import { careersFallback } from '@/components/forms/formProps';
import { Icon } from '@/components/ui/Icon';
import { JsonLd } from '@/components/ui/JsonLd';
import { MailLink } from '@/components/ui/Contact';
import { Photo } from '@/components/ui/Photo';

export async function generateMetadata({ params }: PageProps<'/[locale]/kariera'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'careers', { title: d.careers.title, description: d.careers.description });
}

export default async function CareersPage({ params }: PageProps<'/[locale]/kariera'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const c = d.careers;
  const ctx = await formContext();
  const num = new Intl.NumberFormat(intlLocale[locale]);

  return (
    <>
      <PageHeader locale={locale} routeKey="careers" title={c.title} lead={c.lead} />

      <section className="section" id="oferty" aria-labelledby="jobs-h">
        <div className="container">
          <h2 id="jobs-h" className="h-section">
            {c.openTitle}
          </h2>
          {jobs.map((job) => {
            const e = entityById(job.entity);
            return (
              <article key={job.id} className="job" aria-labelledby={`job-${job.id}`}>
                <Photo item={media.butcherCutting} locale={locale} ratio="4 / 3" className="job__photo" sizes="(min-width: 64rem) 40vw, 100vw" priority />
                <div className="job__body">
                  <p className="job__company">
                    {e.legalName}, {t(job.location, locale)}
                  </p>
                  <h3 id={`job-${job.id}`} className="job__title">
                    {t(job.title, locale)}
                  </h3>
                  <p>{t(job.description, locale)}</p>
                  <dl className="job__pay">
                    {job.pay.map((p) => (
                      <div key={p.label.pl}>
                        <dt>{t(p.label, locale)}</dt>
                        <dd>
                          <span className="job__amount tnum">
                            {num.format(p.min)}–{num.format(p.max)}
                          </span>{' '}
                          <span className="muted">{t(job.payUnit, locale)}</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <dl className="legal-data job__facts">
                    <div>
                      <dt>{c.contract}</dt>
                      <dd>
                        {t(job.contract, locale)}. {t(job.employmentType, locale)}
                      </dd>
                    </div>
                    <div>
                      <dt>{c.schedule}</dt>
                      <dd>{t(job.schedule, locale)}</dd>
                    </div>
                    <div>
                      <dt>{c.benefits}</dt>
                      <dd>{job.benefits.map((b) => t(b, locale)).join(', ')}</dd>
                    </div>
                    <div>
                      <dt>{c.location}</dt>
                      <dd>
                        {e.registeredAddress.street}, {e.registeredAddress.postalCode} {e.registeredAddress.city}
                      </dd>
                    </div>
                  </dl>
                  {c.languageNote ? <p className="note">{c.languageNote}</p> : null}
                  <div className="job__actions">
                    <a className="btn btn--primary btn--lg" href={telHref(recruitment.phone)}>
                      <Icon name="phone" size={18} />
                      {d.common.call}: <span className="tnum">{recruitment.phoneDisplay}</span>
                    </a>
                    <a className="btn btn--line btn--lg btn--arrow" href="#aplikuj" data-careers="">
                      {d.forms.careers.openCta}
                    </a>
                  </div>
                </div>
                {(() => {
                  const posting = jobPostingJsonLd(job, locale, e);
                  return posting ? <JsonLd data={posting} /> : null;
                })()}
              </article>
            );
          })}
        </div>
      </section>

      <section className="section section--paper2" id="aplikuj" aria-labelledby="apply-h">
        <div className="container">
          <CareersApply
            title={c.applyTitle}
            lead={c.applyLead}
            ctaLabel={d.forms.careers.openCta}
            closeLabel={d.a11y.closeMenu}
            aside={
              <>
                <h3 className="aside-box__title">{d.common.call}</h3>
                <a className="clink clink--big" href={telHref(recruitment.phone)}>
                  <Icon name="phone" size={20} />
                  <span className="tnum">{recruitment.phoneDisplay}</span>
                </a>
                <MailLink email={recruitment.email} />
              </>
            }
            locale={locale}
            messages={d.forms}
            positions={[...jobs.map((j) => ({ value: j.id, label: t(j.title, locale) })), { value: 'inne', label: d.forms.careers.positionOther }]}
            startedAt={ctx.startedAt}
            privacyHref={href(locale, 'privacy')}
            fallback={careersFallback()}
            nonce={ctx.nonce}
            turnstileSiteKey={ctx.turnstileSiteKey}
          />
        </div>
      </section>
    </>
  );
}
