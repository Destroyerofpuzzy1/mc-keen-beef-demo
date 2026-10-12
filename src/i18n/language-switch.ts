/**
 * Context that the language switch carries to the same page in another language (UXA-02).
 *
 * Only the listed parameters of the current page travel, and only when their value has the
 * expected form; everything else is dropped. The target path always comes from `href()`, never
 * from the address bar, so nothing here can send the link elsewhere (no open redirect). Values
 * are re-encoded by `URLSearchParams`.
 *
 * Self-contained (no imports), so `node --test` can import it directly.
 */
const KEEP: Partial<Record<string, Record<string, RegExp>>> = {
  // Contact router topic (`?temat=sell-cattle`), validated again by the page.
  contact: { temat: /^[a-z][a-z-]{0,31}$/ },
  // Product preselected in the offer form (`?produkt=elementy`), validated again by the page.
  enquiry: { produkt: /^[a-z][a-z-]{0,31}$/ },
  // Signed form result (lib/forms/result.ts); the result page verifies the signature.
  sent: {
    form: /^(?:enquiry|careers)$/,
    status: /^[A-Za-z]{1,16}$/,
    t: /^\d{1,12}$/,
    sig: /^[\w-]{22}$/,
  },
};

/** An element id in the same page: the ids are the same in every language. */
const ANCHOR = /^#[A-Za-z][\w-]{0,63}$/;
/** The contact page opens at the topic router when a topic is carried. */
const TOPIC_ANCHOR = '#pomoc';

/** Query string and anchor to append to `href(otherLocale, routeKey)`. */
export function languageSwitchSuffix(routeKey: string, search: string, hash: string): string {
  const rules = KEEP[routeKey];
  const kept = new URLSearchParams();
  if (rules) {
    const current = new URLSearchParams(search);
    for (const [name, pattern] of Object.entries(rules)) {
      const value = current.get(name);
      if (value !== null && pattern.test(value)) kept.set(name, value);
    }
  }
  const query = kept.toString();
  let anchor = ANCHOR.test(hash) ? hash : '';
  if (!anchor && routeKey === 'contact' && kept.has('temat')) anchor = TOPIC_ANCHOR;
  return (query ? `?${query}` : '') + anchor;
}
