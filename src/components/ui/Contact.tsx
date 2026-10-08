import { telHref } from '@/content/contacts';
import { Icon } from './Icon';

/** Phone and e-mail links with consistent formatting and 44px targets. */
export function PhoneLink({ phone, label, className = 'clink' }: { phone: string; label?: string; className?: string }) {
  return (
    <a className={className} href={telHref(phone)}>
      <Icon name="phone" size={18} />
      <span>
        {label ? <span className="visually-hidden">{label}: </span> : null}
        <span className="tnum">{phone}</span>
      </span>
    </a>
  );
}

export function MailLink({ email, label, className = 'clink' }: { email: string; label?: string; className?: string }) {
  return (
    <a className={className} href={`mailto:${email}`}>
      <Icon name="mail" size={18} />
      <span>
        {label ? <span className="visually-hidden">{label}: </span> : null}
        <span className="clink__email">{email}</span>
      </span>
    </a>
  );
}
