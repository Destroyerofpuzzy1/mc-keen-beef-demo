import type { RouteKey } from '@/i18n/routes';

/** Routes that appear in navigation (the form result page `sent` never does). */
export type NavKey = Exclude<RouteKey, 'sent'>;

/**
 * Primary navigation. Labels come from the dictionary `nav`; the desktop bar uses the
 * shorter `navShort` label where one exists (sales → "Eksport"). Order follows a B2B buyer:
 * products, quality, certificates, sales/export, then company, careers, contact.
 */
export const mainNav: NavKey[] = ['products', 'quality', 'certificates', 'sales', 'plants', 'about', 'careers', 'contact'];

export const footerNav: NavKey[] = ['products', 'quality', 'certificates', 'plants', 'about', 'sales', 'careers', 'contact', 'enquiry'];

export const legalNav: NavKey[] = ['privacy', 'tax', 'biogas'];
