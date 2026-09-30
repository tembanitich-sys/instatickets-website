import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";
import { ui } from "@content/site";

const controlClass =
  "block min-h-11 w-full rounded-lg border border-line bg-white px-3 py-2 text-base text-ink shadow-sm placeholder:text-muted/70 focus:border-navy";

export function Field({
  label,
  htmlFor,
  optional,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold text-navy">
        {label}
        {required && (
          <span aria-hidden className="text-red">
            {" "}
            *
          </span>
        )}
        {optional && <span className="ml-1 font-medium text-muted">{optional}</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: ComponentProps<"textarea">) {
  return <textarea rows={4} {...props} className={`${controlClass} ${props.className ?? ""}`} />;
}

export function Select({
  options,
  ...props
}: ComponentProps<"select"> & { options: readonly { value: string; label: string }[] }) {
  return (
    <select {...props} className={`${controlClass} ${props.className ?? ""}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  name,
  value,
  required,
  id,
  children,
}: {
  name: string;
  value?: string;
  required?: boolean;
  id: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-ink">
      {/* Consent boxes are never pre-ticked (brief Section 7). */}
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        required={required}
        className="mt-0.5 size-5 shrink-0 accent-navy"
      />
      <span>{children}</span>
    </label>
  );
}

export function CheckboxGroup({
  legend,
  name,
  options,
  optional,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  optional?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold text-navy">
        {legend}
        {optional && <span className="ml-1 font-medium text-muted">{ui.optional}</span>}
      </legend>
      <div className="flex flex-wrap gap-x-6">
        {options.map((o) => (
          <Checkbox key={o.value} id={`${name}-${o.value}`} name={name} value={o.value}>
            {o.label}
          </Checkbox>
        ))}
      </div>
    </fieldset>
  );
}

export function RadioGroup({
  legend,
  name,
  options,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold text-navy">{legend}</legend>
      <div className="flex flex-wrap gap-x-6">
        {options.map((o) => (
          <label key={o.value} htmlFor={`${name}-${o.value}`} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input id={`${name}-${o.value}`} type="radio" name={name} value={o.value} className="size-5 accent-navy" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Privacy acknowledgement: required, links to /privacy, never pre-ticked. */
export function PrivacyCheckbox({
  id,
  prefix,
  link,
  suffix,
}: {
  id: string;
  prefix: string;
  link: string;
  suffix: string;
}) {
  return (
    <Checkbox id={id} name="privacyAccepted" required>
      {prefix}{" "}
      <Link href="/privacy" className="font-semibold text-navy underline">
        {link}
      </Link>
      {suffix}
    </Checkbox>
  );
}

// Country code selector. Options read "ZW (+263)": ISO code plus dialling code, which is
// identical on server and client (no Intl display names, so no hydration differences).
const DEFAULT_COUNTRY = "ZW";
const countryOptions = [...getCountries()]
  .sort((a, b) => (a === DEFAULT_COUNTRY ? -1 : b === DEFAULT_COUNTRY ? 1 : a.localeCompare(b)))
  .map((c) => ({ value: c, label: `${c} (+${getCountryCallingCode(c)})` }));

/** Mobile number with a country code selector defaulting to +263 (Zimbabwe). */
export function PhoneField({
  id,
  name,
  label,
  required,
  optional,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  optional?: string;
}) {
  return (
    <Field label={label} htmlFor={id} required={required} optional={optional}>
      <div className="flex gap-2">
        <Select
          aria-label="Country code"
          name={`${name}Country`}
          defaultValue={DEFAULT_COUNTRY}
          options={countryOptions}
          className="!w-32 shrink-0"
        />
        <TextInput
          id={id}
          name={`${name}National`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          placeholder="77 123 4567"
        />
      </div>
    </Field>
  );
}

/**
 * Phase 1 only: forms are laid out but not yet wired to the server, so the
 * submit button is disabled. Phase 3 replaces this with a real submit button.
 */
export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled
      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red px-6 py-3 text-sm font-bold tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {children}
    </button>
  );
}
