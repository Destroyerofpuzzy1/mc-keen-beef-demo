'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Desktop primary navigation with current-page state. */
export function NavLinks({ items, label }: { items: { href: string; label: string }[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav className="mainnav" aria-label={label}>
      <ul>
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
          return (
            <li key={it.href}>
              <Link href={it.href} aria-current={active ? 'page' : undefined}>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
