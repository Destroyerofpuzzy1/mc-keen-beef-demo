import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary, t } from '@/i18n';
import { addressNote, countryName, type Entity } from '@/content/entities';
import { Icon } from '@/components/ui/Icon';
import { MailLink, PhoneLink } from '@/components/ui/Contact';
import { MobileFold } from '@/components/ui/MobileFold';

/**
 * Legal and registration data of one company, rendered from content/entities.ts.
 * `fold`: addresses stay visible, registration numbers fold on phones (MobileFold).
 */
export function EntityLegal({ entity: e, locale, fold = false }: { entity: Entity; locale: Locale; fold?: boolean }) {
  const d = getDictionary(locale);
  const reg = e.registeredAddress;
  const ids = <EntityIds entity={e} locale={locale} />;
  return (
    <>
      <dl className="legal-data">
      <div>
        <dt>{d.common.registered}</dt>
        <dd>
          {reg.street}, {reg.postalCode} {reg.city}
          {reg.country !== 'PL' ? `, ${t(countryName[reg.country], locale)}` : null}
          <AddressNote note={addressNote(reg)} locale={locale} />
        </dd>
      </div>
      {e.productionAddress ? (
        <div>
          <dt>{d.common.productionSite}</dt>
          <dd>
            {e.productionAddress.street}, {e.productionAddress.postalCode} {e.productionAddress.city}
            <AddressNote note={addressNote(e.productionAddress)} locale={locale} />
          </dd>
        </div>
      ) : null}
      </dl>
      {fold ? (
        <MobileFold className="legal-fold" summary={d.common.registrationData}>
          {ids}
        </MobileFold>
      ) : (
        ids
      )}
    </>
  );
}

function AddressNote({ note, locale }: { note: ReturnType<typeof addressNote>; locale: Locale }) {
  return note ? <span className="addr-note">{t(note, locale)}</span> : null;
}

function EntityIds({ entity: e, locale }: { entity: Entity; locale: Locale }) {
  const d = getDictionary(locale);
  return (
    <dl className="legal-data legal-data--ids">
      <div>
        <dt>{e.taxId.label}</dt>
        <dd className="tnum">{e.taxId.value}</dd>
      </div>
      {e.regon ? (
        <div>
          <dt>REGON</dt>
          <dd className="tnum">{e.regon}</dd>
        </div>
      ) : null}
      {e.krs ? (
        <div>
          <dt>KRS</dt>
          <dd className="tnum">{e.krs}</dd>
        </div>
      ) : null}
      {e.vetNumber ? (
        <div>
          <dt>
            <abbr title={d.common.vet}>{d.common.vetShort}</abbr>
          </dt>
          <dd className="tnum">{e.vetNumber}</dd>
        </div>
      ) : null}
      {e.bdo ? (
        <div>
          <dt>BDO</dt>
          <dd className="tnum">{e.bdo}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function EntityCard({ entity: e, locale, children, headingLevel = 3 }: { entity: Entity; locale: Locale; children?: ReactNode; headingLevel?: 2 | 3 }) {
  const d = getDictionary(locale);
  const H = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="entity" id={e.anchor} aria-labelledby={`${e.anchor}-h`}>
      <header className="entity__head">
        <p className="entity__role">{t(e.role, locale)}</p>
        <H id={`${e.anchor}-h`} className="entity__name">
          {e.legalName}
        </H>
      </header>
      {children}
      <EntityLegal entity={e} locale={locale} fold />
      <div className="entity__links">
        {e.office.phone ? <PhoneLink phone={e.office.phone} /> : null}
        {e.office.email ? <MailLink email={e.office.email} /> : null}
        <a className="clink" href={e.mapUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="pin" size={18} />
          <span>
            {d.common.map}
            <span className="visually-hidden"> ({d.a11y.external})</span>
          </span>
        </a>
      </div>
    </article>
  );
}
