'use client';

import Link from 'next/link';
import { Fragment, useId, useRef, useState, type CSSProperties } from 'react';
import { Icon } from '@/components/ui/Icon';

export interface RouterContact {
  id: string;
  place: string;
  department: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface RouterOption {
  tag: string;
  label: string;
  hint: string;
  contacts: RouterContact[];
  /** `enquiry: true` opens the offer modal (the href stays the no-JS fallback). */
  cta?: { href: string; label: string; enquiry?: boolean };
}

const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`;

/**
 * "W czym możemy pomóc?" — purpose-first routing to verified departments.
 * Disclosure pattern: each topic is a button (aria-expanded) and the answer panel is rendered
 * directly after the selected button in the DOM. On phones the answer therefore opens right
 * under the chosen topic; from 56rem CSS places all answers in the right-hand column.
 * Without JavaScript the initial answer is shown and the full directory below lists every contact.
 */
export function ContactRouter({
  options,
  title,
  lead,
  initialTag,
}: {
  options: RouterOption[];
  title: string;
  lead: string;
  initialTag?: string;
}) {
  const [active, setActive] = useState<string>(
    initialTag && options.some((o) => o.tag === initialTag) ? initialTag : (options[0]?.tag ?? ''),
  );
  const baseId = useId();
  const headingId = `${baseId}-h`;
  const panelRef = useRef<HTMLDivElement>(null);

  const select = (tag: string) => {
    setActive(tag);
    // Keep the answer in view (mainly on phones, where it opens below the topic).
    requestAnimationFrame(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      panelRef.current?.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    });
  };

  return (
    <section className="router" id="pomoc" aria-labelledby={headingId}>
      <h2 id={headingId} className="h-section">
        {title}
      </h2>
      <p className="lead">{lead}</p>
      <div className="router__grid" style={{ '--router-n': options.length } as CSSProperties}>
        {options.map((o, i) => {
          const open = o.tag === active;
          const btnId = `${baseId}-b${i}`;
          const panelId = `${baseId}-p${i}`;
          return (
            <Fragment key={o.tag}>
              <button
                id={btnId}
                type="button"
                className="router__option"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                style={{ '--router-row': i + 1 } as CSSProperties}
                onClick={() => select(o.tag)}
              >
                <span>{o.label}</span>
                <Icon name="chevron" size={18} className="router__chev" />
              </button>
              {open ? (
                <div ref={panelRef} id={panelId} className="router__result" role="region" aria-labelledby={btnId}>
                  <p className="router__hint">{o.hint}</p>
                  {o.cta ? (
                    <p>
                      <Link className="btn btn--primary" href={o.cta.href} data-enquiry={o.cta.enquiry ? '' : undefined}>
                        {o.cta.label}
                      </Link>
                    </p>
                  ) : null}
                  <ul className="router__contacts plain">
                    {o.contacts.map((c) => (
                      <li key={c.id} className="person">
                        <p className="person__dept">{c.department}</p>
                        {c.name ? <p className="person__name">{c.name}</p> : null}
                        <p className="person__place">{c.place}</p>
                        <p className="person__links">
                          {c.phone ? (
                            <a className="clink" href={tel(c.phone)}>
                              <Icon name="phone" size={18} />
                              <span className="tnum">{c.phone}</span>
                            </a>
                          ) : null}
                          {c.email ? (
                            <a className="clink" href={`mailto:${c.email}`}>
                              <Icon name="mail" size={18} />
                              <span className="clink__email">{c.email}</span>
                            </a>
                          ) : null}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
