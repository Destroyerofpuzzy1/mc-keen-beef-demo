import Link from 'next/link';
import { headers } from 'next/headers';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { href } from '@/i18n/routes';
import { mainNav } from '@/content/navigation';
import { Horns } from '@/components/ui/Icon';

/** Localised 404 inside the site layout. */
export default async function NotFound() {
  // Set by src/proxy.ts for every page request.
  const seg = (await headers()).get('x-locale') ?? 'pl';
  const locale: Locale = hasLocale(seg) ? seg : 'pl';
  const d = getDictionary(locale);
  return (
    <section className="section">
      <div className="container nf">
        <Horns className="nf__horns" />
        <p className="nf__code tnum">404</p>
        <h1 className="page-head__title">{d.notFound.title}</h1>
        <p className="lead">{d.notFound.text}</p>
        <ul className="nf__links plain">
          <li>
            <Link href={href(locale, 'home')} className="btn btn--primary">
              {d.nav.home}
            </Link>
          </li>
          {mainNav.map((k) => (
            <li key={k}>
              <Link href={href(locale, k)} className="btn btn--line">
                {d.nav[k]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
