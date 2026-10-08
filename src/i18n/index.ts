import 'server-only';
import { notFound } from 'next/navigation';
import { hasLocale, type L, type Locale } from './config';
import de from './dictionaries/de';
import en from './dictionaries/en';
import pl, { type Dictionary } from './dictionaries/pl';

const dictionaries: Record<Locale, Dictionary> = { pl, en, de };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

/** Resolve a localised content value. */
export const t = <T,>(value: L<T>, locale: Locale): T => value[locale];

/** Validate the [locale] param or 404. */
export async function resolveLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  return locale;
}

export type { Dictionary };
