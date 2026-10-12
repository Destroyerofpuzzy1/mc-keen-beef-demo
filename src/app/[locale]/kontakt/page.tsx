import type { Metadata } from 'next';
import { getDictionary, resolveLocale, t } from '@/i18n';
import { hasLocale } from '@/i18n/config';
import { href } from '@/i18n/routes';
import { pageMetadata } from '@/lib/seo';
import { contacts, contactsFor, recruitment, type RoutingTag } from '@/content/contacts';
import { entities, entityById, type EntityId } from '@/content/entities';
import { media } from '@/content/media';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContactRouter, type RouterContact, type RouterOption } from '@/components/contacts/ContactRouter';
import { DirectoryFilter } from '@/components/contacts/DirectoryFilter';
import { EntityCard } from '@/components/contacts/EntityCard';
import { MailLink, PhoneLink } from '@/components/ui/Contact';
import { Photo } from '@/components/ui/Photo';
import { MobileFold } from '@/components/ui/MobileFold';
import { BrandPatch } from '@/components/brand/BrandMarks';

export async function generateMetadata({ params }: PageProps<'/[locale]/kontakt'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const d = getDictionary(locale);
  return pageMetadata(locale, 'contact', { title: d.contact.title, description: d.contact.description });
}

const ROUTES: RoutingTag[] = ['buy-beef', 'offal-uppz', 'sell-cattle', 'quality', 'transport', 'supply', 'jobs', 'accounting', 'general'];
const ORDER: EntityId[] = ['gmbh', 'centrala', 'sh', 'sh2', 'cp'];

export default async function ContactPage({ params, searchParams }: PageProps<'/[locale]/kontakt'>) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale);
  const c = d.contact;
  const sp = await searchParams;
  const initialTag = typeof sp.temat === 'string' ? sp.temat : undefined;

  const toRouter = (list: typeof contacts): RouterContact[] =>
    list.map((x) => ({
      id: x.id,
      place: t(entityById(x.entity).place, locale),
      department: t(x.department, locale),
      name: x.name,
      phone: x.phone,
      email: x.email,
    }));

  const options: RouterOption[] = ROUTES.map((tag) => {
    const base = { tag, label: c.routes[tag], hint: c.routeHints[tag] };
    if (tag === 'buy-beef') return { ...base, contacts: toRouter(contactsFor(tag)), cta: { href: href(locale, 'enquiry'), label: c.enquiryCta, enquiry: true } };
    if (tag === 'jobs')
      return {
        ...base,
        contacts: [{ id: 'jobs', place: t(entityById('cp').place, locale), department: d.nav.careers, phone: recruitment.phone, email: recruitment.email }],
        cta: { href: href(locale, 'careers'), label: c.careersCta },
      };
    if (tag === 'general') return { ...base, contacts: toRouter(contacts.filter((x) => x.id === 'c-office')) };
    return { ...base, contacts: toRouter(contactsFor(tag)) };
  });

  return (
    <>
      <PageHeader
        locale={locale}
        routeKey="contact"
        title={c.title}
        motif={<BrandPatch id="contact" motif="handshake" bottom={d.nav.contact.toUpperCase()} />}
      />

      <section className="section section--tight">
        <div className="container">
          <ContactRouter options={options} title={c.routerTitle} lead={c.routerLead} initialTag={initialTag} />
        </div>
      </section>

      <section className="wide-photo wide-photo--slim wide-photo--no-phone">
        <Photo item={media.mistyRiverside} locale={locale} ratio="21 / 6" sizes="100vw" decorative className="photo--natural" />
      </section>

      <section className="section" id="dzialy" aria-labelledby="dir-h">
        <div className="container">
          <h2 id="dir-h" className="h-section">
            {c.directoryTitle}
          </h2>
          <DirectoryFilter
            label={c.filterLabel}
            allLabel={c.filterAll}
            options={ORDER.map((id) => ({ id, label: t(entityById(id).place, locale) }))}
          >
            {ORDER.map((id) => {
              const e = entities.find((x) => x.id === id)!;
              const people = contacts.filter((x) => x.entity === id);
              return (
                <section key={id} className="dir-entity" data-entity={id}>
                  <EntityCard entity={e} locale={locale} />
                  <MobileFold className="people-fold" summary={`${c.peopleSummary} (${people.length})`}>
                  <ul className="people plain">
                    {people.map((p) => (
                      <li key={p.id} className="person">
                        <p className="person__dept">{t(p.department, locale)}</p>
                        {p.name ? <p className="person__name">{p.name}</p> : null}
                        <p className="person__links">
                          {p.phone ? <PhoneLink phone={p.phone} /> : null}
                          {p.email ? <MailLink email={p.email} /> : null}
                        </p>
                      </li>
                    ))}
                  </ul>
                  </MobileFold>
                </section>
              );
            })}
          </DirectoryFilter>
        </div>
      </section>
    </>
  );
}
