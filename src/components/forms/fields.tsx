'use client';

import { createContext, useContext, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

/**
 * DOM ids are scoped per form instance (prefix from `useId()` in useFormSubmit), so the
 * enquiry and careers dialogs can both be mounted without duplicate ids or labels that
 * point at a hidden control in the other form.
 */
export const FieldScope = createContext('f');
export const fieldDomId = (prefix: string, name: string) => `${prefix}-${name}`;

export function useFieldIds(name: string) {
  const id = fieldDomId(useContext(FieldScope), name);
  return { id, hint: `${id}-hint`, err: `${id}-err` };
}

/** Every field has a real <label>; hints and errors are tied with aria-describedby. */
interface Base {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  requiredLabel: string;
  optionalLabel: string;
}

function Label({ name, label, required, requiredLabel, optionalLabel }: Base) {
  const { id } = useFieldIds(name);
  return (
    <label className="field__label" htmlFor={id}>
      {label}{' '}
      <span className="field__req">{required ? <span aria-hidden="true">*</span> : `(${optionalLabel})`}</span>
      {required ? <span className="visually-hidden"> ({requiredLabel})</span> : null}
    </label>
  );
}

function Describe({ name, hint, error }: Pick<Base, 'name' | 'hint' | 'error'>) {
  const i = useFieldIds(name);
  return (
    <>
      {hint ? (
        <p className="field__hint" id={i.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={i.err}>
          {error}
        </p>
      ) : null}
    </>
  );
}

const describedBy = (i: ReturnType<typeof useFieldIds>, b: Pick<Base, 'hint' | 'error'>) =>
  [b.hint ? i.hint : null, b.error ? i.err : null].filter(Boolean).join(' ') || undefined;

export function TextField(props: Base & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>) {
  const { name, label, hint, error, required, requiredLabel, optionalLabel, ...rest } = props;
  const i = useFieldIds(name);
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <Label {...{ name, label, required, requiredLabel, optionalLabel }} />
      <input
        id={i.id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(i, { hint, error })}
        className="field__input"
        {...rest}
      />
      <Describe {...{ name, hint, error }} />
    </div>
  );
}

export function TextArea(props: Base & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>) {
  const { name, label, hint, error, required, requiredLabel, optionalLabel, ...rest } = props;
  const i = useFieldIds(name);
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <Label {...{ name, label, required, requiredLabel, optionalLabel }} />
      <textarea
        id={i.id}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(i, { hint, error })}
        className="field__input field__input--area"
        {...rest}
      />
      <Describe {...{ name, hint, error }} />
    </div>
  );
}

export function ChoiceGroup({
  name,
  legend,
  type,
  options,
  defaultValue,
  error,
  required,
  requiredLabel,
  optionalLabel,
}: {
  name: string;
  legend: string;
  type: 'checkbox' | 'radio';
  options: { value: string; label: string }[];
  defaultValue?: string[];
  error?: string;
  required?: boolean;
  requiredLabel: string;
  optionalLabel: string;
}) {
  const { id, err: errId } = useFieldIds(name);
  return (
    <fieldset className={`field field--group${error ? ' has-error' : ''}`} aria-describedby={error ? errId : undefined} id={id} tabIndex={-1}>
      <legend className="field__label">
        {legend} <span className="field__req">{required ? <span aria-hidden="true">*</span> : `(${optionalLabel})`}</span>
        {required ? <span className="visually-hidden"> ({requiredLabel})</span> : null}
      </legend>
      <div className="choices">
        {options.map((o) => (
          <label key={o.value} className="choice">
            <input type={type} name={name} value={o.value} defaultChecked={defaultValue?.includes(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="field__error" id={errId}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function Consent({ name, label, error, link }: { name: string; label: string; error?: string; link: ReactNode }) {
  const { id, err: errId } = useFieldIds(name);
  return (
    <div className={`field field--consent${error ? ' has-error' : ''}`}>
      <label className="choice choice--consent" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          name={name}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
        />
        <span>
          {label} {link}
        </span>
      </label>
      {error ? (
        <p className="field__error" id={errId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Honeypot: hidden from people and assistive tech, attractive to naive bots. */
export function Honeypot({ label }: { label: string }) {
  return (
    <div className="hp" aria-hidden="true">
      <label>
        {label}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
