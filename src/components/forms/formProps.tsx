import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { href } from '@/i18n/routes';
import { enquiryProductLabel, enquiryProductOptions } from '@/content/products';
import { recruitment, salesContacts } from '@/content/contacts';
import { MailLink, PhoneLink } from '@/components/ui/Contact';

/** Server-side props shared by the enquiry modal and the enquiry page. */
export function enquiryFormProps(locale: Locale) {
  const d = getDictionary(locale);
  return {
    locale,
    messages: d.forms,
    productOptions: enquiryProductOptions.map((v) => ({ value: v, label: t(enquiryProductLabel[v], locale) })),
    privacyHref: href(locale, 'privacy'),
    fallback: (
      <ul className="plain fallback">
        {salesContacts.map((c) => (
          <li key={c.id}>
            {c.name}: <PhoneLink phone={c.phone!} /> <MailLink email={c.email!} />
          </li>
        ))}
      </ul>
    ),
  };
}

/** Sales phone panel shown inside the offer modal. */
export function enquiryAside(locale: Locale) {
  const d = getDictionary(locale);
  return (
    <div className="dlg-aside">
      <p className="dlg-aside__title">{d.forms.enquiry.phoneAside}</p>
      <p className="muted">{d.enquiry.asideText}</p>
      <ul className="plain stack-s">
        {salesContacts.map((c) => (
          <li key={c.id}>
            <p className="person__name">{c.name}</p>
            <PhoneLink phone={c.phone!} />
            <MailLink email={c.email!} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function careersFallback() {
  return (
    <ul className="plain fallback">
      <li>
        <PhoneLink phone={recruitment.phone} /> <MailLink email={recruitment.email} />
      </li>
    </ul>
  );
}
