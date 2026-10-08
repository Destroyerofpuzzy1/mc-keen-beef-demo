import { intlLocale, type Locale } from '@/i18n/config';

/** "2027-04-27" → "27.04.2027" (PL/DE) or "27/04/2027" (EN-GB). */
export function formatDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(intlLocale[locale], { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y!, m! - 1, d!)),
  );
}

/** IFS score as printed ("98,60") → locale number with percent sign. */
export function formatScore(score: string, locale: Locale): string {
  const n = Number(score.replace(',', '.'));
  return new Intl.NumberFormat(intlLocale[locale], { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + '%';
}
