import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { href } from '@/i18n/routes';
import { addressNote, entities } from '@/content/entities';
import { company } from '@/content/company';
import { footerNav, legalNav } from '@/content/navigation';
import { salesContacts } from '@/content/contacts';
import { MailLink, PhoneLink } from '@/components/ui/Contact';
import { Horns } from '@/components/ui/Icon';
import { MobileFold } from '@/components/ui/MobileFold';
import { BrandPatch } from '@/components/brand/BrandMarks';

export function SiteFooter({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Europe/Warsaw' }).format(new Date());
  const office = entities.find((e) => e.id === 'gmbh')!.office.email!;

  return (
    <footer className="site-foot">
      <div className="container">
        <div className="site-foot__top">
          <div className="site-foot__brand">
            <Image src="/assets/brand/logo.svg" alt="McKeen-Beef" width={204} height={43} unoptimized className="site-foot__logo" />
            <p>{d.footer.tagline}</p>
            <BrandPatch id="footer" motif="cattle" bottom="LISKÓW · 2009" className="site-foot__patch" />
          </div>
          <div className="site-foot__sales">
            <h2 className="site-foot__h">{d.common.salesDept}</h2>
            <ul className="plain">
              {salesContacts.map((c) => (
                <li key={c.id}>
                  <span className="site-foot__name">{c.name}</span>
                  <PhoneLink phone={c.phone!} />
                </li>
              ))}
              <li>
                <MailLink email={office} />
              </li>
            </ul>
            <Link href={href(locale, 'enquiry')} className="btn btn--primary" data-enquiry="">
              {d.nav.enquiry}
            </Link>
          </div>
          <nav className="site-foot__nav" aria-label={d.a11y.footerNav}>
            <h2 className="site-foot__h">{d.footer.pages}</h2>
            <ul className="plain">
              {footerNav.map((k) => (
                <li key={k}>
                  <Link href={href(locale, k)}>{d.nav[k]}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <MobileFold className="site-foot__group" summary={d.footer.group} heading={{ level: 2, className: 'site-foot__h' }}>
          <ul className="site-foot__entities plain">
            {entities.map((e) => (
              <li key={e.id}>
                <p className="site-foot__role">{t(e.role, locale)}</p>
                <p className="site-foot__legal">{e.legalName}</p>
                <p>
                  {(e.productionAddress ?? e.registeredAddress).street}, {(e.productionAddress ?? e.registeredAddress).postalCode}{' '}
                  {(e.productionAddress ?? e.registeredAddress).city}
                </p>
                {(() => {
                  const note = addressNote(e.productionAddress ?? e.registeredAddress);
                  return note ? <p className="addr-note">{t(note, locale)}</p> : null;
                })()}
                <p className="tnum">
                  {e.taxId.label} {e.taxId.value}
                </p>
                {e.vetNumber ? (
                  <p className="tnum">
                    {d.common.vetShort} {e.vetNumber}
                  </p>
                ) : null}
                {e.office.phone ? <PhoneLink phone={e.office.phone} /> : null}
              </li>
            ))}
          </ul>
        </MobileFold>

        <div className="site-foot__bottom">
          <ul className="site-foot__legal-nav plain">
            {legalNav.map((k) => (
              <li key={k}>
                <Link href={href(locale, k)}>{d.nav[k]}</Link>
              </li>
            ))}
            <li>
              <Link href={href(locale, 'privacy', 'cookies')}>{d.nav.cookies}</Link>
            </li>
            <li>
              <a href={company.facebook} rel="noopener noreferrer" target="_blank">
                Facebook<span className="visually-hidden"> ({d.a11y.external})</span>
              </a>
            </li>
          </ul>
          {d.draftNotice ? (
            <p className="site-foot__draft" lang={locale}>
              {d.draftNotice}
            </p>
          ) : null}
          <p className="site-foot__copy">
            <Horns className="site-foot__horns" /> © {year} MCKEEN-BEEF. {d.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
