import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { href } from '@/i18n/routes';
import { mainNav } from '@/content/navigation';
import { primarySalesPhone } from '@/content/contacts';
import { LanguageSwitch } from '@/components/navigation/LanguageSwitch';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { NavLinks } from '@/components/navigation/NavLinks';
import { PhoneLink } from '@/components/ui/Contact';

/**
 * One navigation bar with identical geometry in PL / EN / DE: eight equal nav columns
 * sized for the longest translation, fixed-width language switch and CTA.
 * The sales phone lives in the hero, the offer modal and the mobile menu.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const items = mainNav.map((k) => ({ href: href(locale, k), label: d.nav[k] }));
  const short = d.navShort as Partial<Record<string, string>>;
  const barItems = mainNav.map((k) => ({ href: href(locale, k), label: short[k] ?? d.nav[k] }));
  const cta = { href: href(locale, 'enquiry'), label: d.nav.enquiry };

  return (
    <header className="site-head">
      <div className="container container--wide site-head__row">
        <Link href={href(locale, 'home')} className="site-head__logo">
          <Image src="/assets/brand/logo.svg" alt="McKeen-Beef" width={204} height={43} priority unoptimized />
        </Link>
        <NavLinks items={barItems} label={d.a11y.mainNav} />
        <div className="site-head__end">
          <LanguageSwitch locale={locale} label={d.a11y.language} />
          <Link href={cta.href} className="btn btn--primary site-head__cta" data-enquiry="">
            {cta.label}
          </Link>
          <MobileMenu
            items={items}
            cta={cta}
            labels={{ open: d.a11y.openMenu, close: d.a11y.closeMenu, nav: d.a11y.mainNav }}
            footer={
              <div className="mmenu__meta">
                <LanguageSwitch locale={locale} label={d.a11y.language} />
                <p className="mmenu__sales">
                  <span>{d.common.salesDept}</span>
                  <PhoneLink phone={primarySalesPhone} />
                </p>
              </div>
            }
          />
        </div>
      </div>
    </header>
  );
}
