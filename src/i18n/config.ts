export const locales = ['pl', 'en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pl';

/**
 * PL is the source language. EN and DE are written from the PL source but have
 * not been reviewed by a professional translator yet (docs/client-confirmations.md C-50).
 * Draft locales show a notice, are `noindex` and are left out of sitemap/hreflang.
 * Switch a locale to 'approved' once the translation has been signed off.
 */
export const translationStatus: Record<Locale, 'source' | 'approved' | 'draft'> = {
  pl: 'source',
  en: 'draft',
  de: 'draft',
};

export const isIndexable = (locale: Locale) => translationStatus[locale] !== 'draft';

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export const htmlLang: Record<Locale, string> = { pl: 'pl', en: 'en', de: 'de' };
export const intlLocale: Record<Locale, string> = { pl: 'pl-PL', en: 'en-GB', de: 'de-DE' };
export const ogLocale: Record<Locale, string> = { pl: 'pl_PL', en: 'en_GB', de: 'de_DE' };

/** Localised value. */
export type L<T = string> = Record<Locale, T>;
