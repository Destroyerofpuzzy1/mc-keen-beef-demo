'use client';

import { useState, type ReactNode } from 'react';

/**
 * Filters the server-rendered directory by company. Children are sections with
 * `data-entity`; CSS hides the ones that do not match `data-filter`.
 */
export function DirectoryFilter({
  options,
  label,
  allLabel,
  children,
}: {
  options: { id: string; label: string }[];
  label: string;
  allLabel: string;
  children: ReactNode;
}) {
  const [filter, setFilter] = useState('all');
  const all = [{ id: 'all', label: allLabel }, ...options];
  return (
    <div className="dir">
      <div className="dir__filter" role="group" aria-label={label}>
        <span className="dir__filter-label" aria-hidden="true">
          {label}
        </span>
        {all.map((o) => (
          <button key={o.id} type="button" className="chip" aria-pressed={filter === o.id} onClick={() => setFilter(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
      <div className="dir__list" data-filter={filter}>
        {children}
      </div>
    </div>
  );
}
