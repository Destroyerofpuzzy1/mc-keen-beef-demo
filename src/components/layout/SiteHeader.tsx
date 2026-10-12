import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { href } from '@/i18n/routes';
import { mainNav } from '@/content/navigation';
import { primarySalesPhone } from '@/content/contacts';
import { LanguageSwitch } from '@/components/navigation/LanguageSwitch';
import { MobileMenu } from '@/components/navigation/MobileMenu';
import { DrumNav } from '@/components/navigation/DrumNav';
import { PhoneLink } from '@/components/ui/Contact';

/**
 * One sticky, crafted bar: embroidered wordmark, the desktop page selector with all nine pages,
 * language switch and CTA; the traditional mobile menu below 76rem. The sales phone lives in the
 * sales band, the offer modal and the mobile menu.
 */
export function SiteHeader({ locale, search }: { locale: Locale; search: string }) {
  const d = getDictionary(locale);
  const items = mainNav.map((k) => ({ href: href(locale, k), label: d.nav[k] }));
  const short = d.navShort as Partial<Record<string, string>>;
  const barItems = ['home' as const, ...mainNav].map((k) => ({ href: href(locale, k), label: short[k] ?? d.nav[k] }));
  const cta = { href: href(locale, 'enquiry'), label: d.nav.enquiry };

  return (
    <header className="site-head">
      <div className="container container--wide site-head__row">
        {/* The wordmark is drawn as embroidery (thread texture masked by logo.svg); the link carries the name. */}
        <Link href={href(locale, 'home')} className="site-head__logo" aria-label="McKeen-Beef">
          <span className="site-head__embroidery" aria-hidden="true" />
        </Link>
        <DrumNav items={barItems} label={d.a11y.mainNav} labels={d.drum} />
        <div className="site-head__end">
          <LanguageSwitch locale={locale} label={d.a11y.language} serverSearch={search} />
          <Link href={cta.href} className="btn btn--primary btn--arrow site-head__cta" data-enquiry="">
            {cta.label}
          </Link>
          <MobileMenu
            items={items}
            cta={cta}
            labels={{ open: d.a11y.openMenu, close: d.a11y.closeMenu, nav: d.a11y.mainNav }}
            footer={
              <div className="mmenu__meta">
                <LanguageSwitch locale={locale} label={d.a11y.language} serverSearch={search} />
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
