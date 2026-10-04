"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { ui } from "@content/site";
import { brand } from "../Brand";
import { COUNTRY_CALLING_CODES } from "@/lib/countries.generated";

const controlClass =
  "block min-h-11 w-full rounded-lg border border-line bg-white px-3 py-2 text-base text-ink shadow-sm placeholder:text-muted/70 focus:border-navy aria-[invalid=true]:border-red-dark aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-dark";

/** aria attributes that tie an input to its error message. */
export const errProps = (id: string, error?: string) =>
  error ? ({ "aria-invalid": true, "aria-describedby": `${id}-error` } as const) : {};

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-semibold text-red-dark">
      {error}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  optional,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold text-navy">
        {brand(label)}
        {required && (
          <span aria-hidden className="text-red">
            {" "}
            *
          </span>
        )}
        {optional && <span className="ml-1 font-medium text-muted">{ui.optional}</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      <FieldError id={htmlFor} error={error} />
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
  defaultChecked,
  children,
  ...aria
}: {
  name: string;
  value?: string;
  required?: boolean;
  id: string;
  defaultChecked?: boolean;
  children: ReactNode;
} & Pick<ComponentProps<"input">, "aria-invalid" | "aria-describedby">) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-ink">
      {/* Consent boxes are never pre-ticked (brief Section 7). */}
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        required={required}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-5 shrink-0 accent-navy"
        {...aria}
      />
      <span>{typeof children === "string" ? brand(children) : children}</span>
    </label>
  );
}

export function CheckboxGroup({
  legend,
  name,
  options,
  optional,
  defaultValues = [],
  error,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  optional?: boolean;
  defaultValues?: string[];
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold text-navy">
        {brand(legend)}
        {optional && <span className="ml-1 font-medium text-muted">{ui.optional}</span>}
      </legend>
      <div className="flex flex-wrap gap-x-6">
        {options.map((o) => (
          <Checkbox
            key={o.value}
            id={`${name}-${o.value}`}
            name={name}
            value={o.value}
            defaultChecked={defaultValues.includes(o.value)}
            {...errProps(name, error)}
          >
            {o.label}
          </Checkbox>
        ))}
      </div>
      <FieldError id={name} error={error} />
    </fieldset>
  );
}

export function RadioGroup({
  legend,
  name,
  options,
  defaultValue,
  error,
}: {
  legend: string;
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold text-navy">{brand(legend)}</legend>
      <div className="flex flex-wrap gap-x-6">
        {options.map((o) => (
          <label key={o.value} htmlFor={`${name}-${o.value}`} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              id={`${name}-${o.value}`}
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={defaultValue === o.value}
              className="size-5 accent-navy"
              {...errProps(name, error)}
            />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError id={name} error={error} />
    </fieldset>
  );
}

/** Privacy acknowledgement: required, links to /privacy, never pre-ticked. */
export function PrivacyCheckbox({
  id,
  prefix,
  link,
  suffix,
  defaultChecked,
  error,
}: {
  id: string;
  prefix: string;
  link: string;
  suffix: string;
  defaultChecked?: boolean;
  error?: string;
}) {
  return (
    <div>
      <Checkbox id={id} name="privacyAccepted" required defaultChecked={defaultChecked} {...errProps("privacyAccepted", error)}>
        {brand(prefix)}{" "}
        <Link href="/privacy" className="font-semibold text-navy underline">
          {link}
        </Link>
        {suffix}
      </Checkbox>
      <FieldError id="privacyAccepted" error={error} />
    </div>
  );
}

// Country code selector. Options read "ZW (+263)": ISO code plus dialling code. The list is
// generated ahead of time (scripts/generate-countries.mjs) so the phone-number library is not
// sent to the browser; validation happens on the server.
const DEFAULT_COUNTRY = "ZW";
const countryOptions = COUNTRY_CALLING_CODES.map(([iso, code]) => ({ value: iso, label: `${iso} (+${code})` }));

/** Mobile number with a country code selector defaulting to +263 (Zimbabwe). */
export function PhoneField({
  id,
  name,
  label,
  required,
  optional,
  error,
  defaultCountry = DEFAULT_COUNTRY,
  defaultNational = "",
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  defaultCountry?: string;
  defaultNational?: string;
}) {
  return (
    <Field label={label} htmlFor={id} required={required} optional={optional} error={error}>
      <div className="flex gap-2">
        <Select
          aria-label="Country code"
          name={`${name}Country`}
          defaultValue={defaultCountry}
          options={countryOptions}
          className="!w-32 shrink-0"
          {...errProps(id, error)}
        />
        <TextInput
          id={id}
          name={`${name}National`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          placeholder="77 123 4567"
          defaultValue={defaultNational}
          {...errProps(id, error)}
        />
      </div>
    </Field>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-red px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-red-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto"
    >
      {children}
    </button>
  );
}

/** Form-level message (rate limit, security check, save failure, "fix the fields"). */
export function FormBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-dark bg-red-50 px-4 py-3 text-sm font-semibold text-red-dark">
      {message}
    </p>
  );
}

/** Replaces the form after a successful submission; takes focus so it is announced. */
export function SuccessPanel({ heading, body }: { heading: string; body: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="rounded-2xl bg-mist p-6 outline-none">
      <p className="text-2xl font-extrabold tracking-tight text-navy">{brand(heading)}</p>
      <p className="mt-3 leading-relaxed text-ink">{brand(body)}</p>
    </div>
  );
}
