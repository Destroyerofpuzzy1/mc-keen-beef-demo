import type { Metadata } from 'next';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/pages.css';
import '@/styles/sections.css';
import '@/styles/art.css';
import '@/styles/craft.css';

export const metadata: Metadata = {
  title: '404 | McKeen Beef',
  robots: { index: false },
};

/**
 * 404 for URLs that never reach a locale route (e.g. a missing file under /assets).
 * Page URLs are handled by app/[locale]/not-found.tsx with the full site layout.
 */
export default function GlobalNotFound() {
  return (
    <html lang="pl">
      <body>
        <main className="section">
          <div className="container nf">
            <p className="nf__code">404</p>
            <h1 className="page-head__title">Nie znaleźliśmy tej strony</h1>
            <p className="lead">
              {/* Deliberately a plain <a>: global-not-found renders outside the app router and
                  its layouts, so a full document load of the localized home is the correct
                  navigation here (next/link would have no router to hand over to). */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="link-strong">
                Strona główna McKeen Beef
              </a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
