import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Source_Sans_3 } from 'next/font/google';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { hasLocale, htmlLang, locales } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { href } from '@/i18n/routes';
import { env } from '@/lib/env';
import { organizationJsonLd } from '@/lib/seo';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { JsonLd } from '@/components/ui/JsonLd';
import { Reveal } from '@/components/ui/Reveal';
import { BackToTop } from '@/components/ui/BackToTop';
import { EnquiryDialog } from '@/components/forms/EnquiryDialog';
import { CertificateViewer } from '@/components/certificates/CertificateViewer';
import { certificateViewerData } from '@/components/certificates/viewerData';
import { enquiryAside, enquiryFormProps } from '@/components/forms/formProps';
import { formContext } from '@/lib/forms/context';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/pages.css';
import '@/styles/sections.css';
import '@/styles/art.css';
import '@/styles/craft.css';

const barlow = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});
const source = Source_Sans_3({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-source',
  display: 'swap',
});

/**
 * Home intro gate, run before the first paint (first element of <body>, per-request CSP nonce).
 * Marks <html> `intro-seen` unless this is the session's first page view and a home page, so the
 * CSS intro plays once per tab session, also across language switches and reloads (both full
 * page loads). After 1.6 s the class is set anyway: returning home by client-side navigation never
 * replays it. Without JavaScript nothing is marked and the intro simply plays on each home load.
 */
const introScript = `(function(){var d=document.documentElement,k="mb-intro";try{var s=sessionStorage;if(s.getItem(k)||${JSON.stringify(locales.map((l) => href(l, 'home')))}.indexOf(location.pathname)<0)d.classList.add("intro-seen");s.setItem(k,"1")}catch(e){}setTimeout(function(){d.classList.add("intro-seen")},1600)})()`;

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return {
    metadataBase: new URL(env.siteUrl),
    title: { default: d.meta.siteName, template: `%s | ${d.meta.siteName}` },
    description: d.meta.defaultDescription,
    applicationName: d.meta.siteName,
    formatDetection: { telephone: false, email: false, address: false },
  };
}

// Zoom stays enabled (legacy site disabled it).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2b0000',
};

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const d = getDictionary(locale);
  const { nonce, turnstileSiteKey, startedAt } = await formContext();
  // Set by src/proxy.ts: the query of this request, for the language links rendered on the server.
  const search = (await headers()).get('x-search') ?? '';

  return (
    // The intro gate adds a class before hydration.
    <html lang={htmlLang[locale]} className={`${barlow.variable} ${source.variable}`} suppressHydrationWarning>
      <body>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: introScript }} />
        <a className="skip-link" href="#main">
          {d.a11y.skip}
        </a>
        <SiteHeader locale={locale} search={search} />
        <main id="main" tabIndex={-1}>
          {children}
          <BackToTop label={d.a11y.toTop} />
        </main>
        <SiteFooter locale={locale} />
        <EnquiryDialog
          {...enquiryFormProps(locale)}
          title={d.enquiry.title}
          closeLabel={d.a11y.closeMenu}
          aside={enquiryAside(locale)}
          nonce={nonce}
          turnstileSiteKey={turnstileSiteKey}
          serverStartedAt={startedAt}
        />
        <CertificateViewer
          certificates={certificateViewerData(locale)}
          labels={{ dialog: d.cert.viewer, close: d.a11y.close, langGroup: d.cert.langGroup, loading: d.cert.loading, zoomIn: d.cert.zoomIn, zoomOut: d.cert.zoomOut, langVersion: d.cert.langVersion }}
        />
        <Reveal />
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
