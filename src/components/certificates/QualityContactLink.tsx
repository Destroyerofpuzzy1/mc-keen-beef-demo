import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { href } from '@/i18n/routes';

/**
 * Next step after "A current certificate for this plant is not published" (UXA-03), at the end of
 * Certyfikaty and in the certificates section of Jakość (UXA-05): the contact router's quality/audit
 * topic. It lists the quality department
 * of every plant by plant name, so the visitor picks the right one; there is no per-plant routing
 * to a person. The sentence itself says neither that the plant holds a certificate nor that it does not.
 */
export function QualityContactLink({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <Link href={`${href(locale, 'contact')}?temat=quality#pomoc`} className="arrow-link">
      {d.cert.askQuality}
    </Link>
  );
}
