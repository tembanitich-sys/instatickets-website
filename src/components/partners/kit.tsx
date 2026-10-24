"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/*
 * A tiny form kit for the partner portal: one state object for the whole form, fields bound
 * to it by a dotted path ("contacts.finance.name"), and errors shown next to the field whose
 * path they carry.
 */

type Data = Record<string, unknown>;

export function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

export function setAt<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const isIndex = /^\d+$/.test(head);
  const base: unknown = obj ?? (isIndex ? [] : {});
  const copy: Record<string, unknown> | unknown[] = Array.isArray(base) ? [...base] : { ...(base as Record<string, unknown>) };
  const current = (copy as Record<string, unknown>)[head];
  (copy as Record<string, unknown>)[head] = rest.length ? setAt(current, rest.join("."), value) : value;
  return copy as T;
}

type FormCtx = {
  data: Data;
  set: (path: string, value: unknown) => void;
  errors: Record<string, string>;
  disabled: boolean;
};
const Ctx = createContext<FormCtx | null>(null);
export const useFormKit = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Field outside FormKit.");
  return ctx;
};

export function useFormState(initial: Data) {
  const [data, setData] = useState<Data>(initial);
  return { data, setData, set: (path: string, value: unknown) => setData((d) => setAt(d, path, value)) };
}

export function FormKit({ value, children }: { value: FormCtx; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

const control =
  "block min-h-11 w-full rounded-lg border border-line bg-white px-3 py-2 text-base text-ink shadow-sm focus:border-navy disabled:bg-mist disabled:text-muted aria-[invalid=true]:border-red-dark aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-red-dark";

const idFor = (path: string) => `f-${path.replace(/[^\w]/g, "-")}`;

function Label({ path, label, required, hint }: { path: string; label: string; required?: boolean; hint?: string }) {
  return (
    <>
      <label htmlFor={idFor(path)} className="mb-1.5 block text-sm font-bold text-navy">
        {label}
        {required && (
          <span aria-hidden className="text-red">
            {" "}
            *
          </span>
        )}
      </label>
      {hint && <p className="-mt-1 mb-1.5 text-sm text-muted">{hint}</p>}
    </>
  );
}

export function FieldError({ path }: { path: string }) {
  const { errors } = useFormKit();
  const error = errors[path];
  if (!error) return null;
  return (
    <p id={`${idFor(path)}-error`} className="mt-1 text-sm font-semibold text-red-dark">
      {error}
    </p>
  );
}

const errAttrs = (errors: Record<string, string>, path: string) =>
  errors[path] ? { "aria-invalid": true as const, "aria-describedby": `${idFor(path)}-error` } : {};

export function TextField({
  path,
  label,
  required,
  hint,
  type = "text",
  readOnly,
  multiline,
  inputMode,
  placeholder,
}: {
  path: string;
  label: string;
  required?: boolean;
  hint?: string;
  type?: "text" | "email" | "tel" | "date" | "month" | "time" | "url";
  readOnly?: boolean;
  multiline?: boolean;
  inputMode?: "numeric" | "decimal" | "tel" | "email";
  placeholder?: string;
}) {
  const { data, set, errors, disabled } = useFormKit();
  const value = (getAt(data, path) as string | undefined) ?? "";
  const common = {
    id: idFor(path),
    value,
    disabled: disabled || readOnly,
    placeholder,
    ...errAttrs(errors, path),
  };
  return (
    <div>
      <Label path={path} label={label} required={required} hint={hint} />
      {multiline ? (
        <textarea rows={3} className={control} {...common} onChange={(e) => set(path, e.target.value)} />
      ) : (
        <input type={type} inputMode={inputMode} className={control} {...common} onChange={(e) => set(path, e.target.value)} />
      )}
      <FieldError path={path} />
    </div>
  );
}

export function SelectField({
  path,
  label,
  options,
  required,
}: {
  path: string;
  label: string;
  options: readonly { value: string; label: string }[];
  required?: boolean;
}) {
  const { data, set, errors, disabled } = useFormKit();
  return (
    <div>
      <Label path={path} label={label} required={required} />
      <select
        id={idFor(path)}
        className={control}
        value={(getAt(data, path) as string) ?? ""}
        disabled={disabled}
        onChange={(e) => set(path, e.target.value)}
        {...errAttrs(errors, path)}
      >
        <option value="">Choose…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError path={path} />
    </div>
  );
}

export function RadioField({
  path,
  label,
  options,
}: {
  path: string;
  label: string;
  options: readonly { value: string; label: string }[];
}) {
  const { data, set, disabled } = useFormKit();
  const value = getAt(data, path);
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold text-navy">
        {label}
        <span aria-hidden className="text-red">
          {" "}
          *
        </span>
      </legend>
      <div className="flex flex-wrap gap-x-6">
        {options.map((o) => (
          <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="radio"
              name={idFor(path)}
              checked={value === o.value}
              disabled={disabled}
              onChange={() => set(path, o.value)}
              className="size-5 accent-navy"
            />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError path={path} />
    </fieldset>
  );
}

export function CheckField({ path, label }: { path: string; label: string }) {
  const { data, set, disabled } = useFormKit();
  return (
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={getAt(data, path) === true}
          disabled={disabled}
          onChange={(e) => set(path, e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-navy"
        />
        <span>{label}</span>
      </label>
      <FieldError path={path} />
    </div>
  );
}

/** Several values from a fixed list, stored as an array. */
export function MultiCheckField({
  path,
  label,
  options,
}: {
  path: string;
  label: string;
  options: readonly { value: string; label: string }[];
}) {
  const { data, set, disabled } = useFormKit();
  const values = (getAt(data, path) as string[] | undefined) ?? [];
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-bold text-navy">
        {label}
        <span aria-hidden className="text-red">
          {" "}
          *
        </span>
      </legend>
      <div className="flex flex-wrap gap-x-6">
        {options.map((o) => (
          <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={values.includes(o.value)}
              disabled={disabled}
              onChange={(e) =>
                set(path, e.target.checked ? [...values, o.value] : values.filter((v) => v !== o.value))
              }
              className="size-5 accent-navy"
            />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError path={path} />
    </fieldset>
  );
}

export function Card({ title, intro, children, id }: { title: string; intro?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-extrabold tracking-tight text-navy">{title}</h2>
      {intro && <p className="mt-1 text-sm leading-relaxed text-muted">{intro}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export const Grid = ({ children }: { children: ReactNode }) => <div className="grid gap-5 sm:grid-cols-2">{children}</div>;

export function ProblemList({ heading, problems }: { heading: string; problems: { path: string; message: string }[] }) {
  if (!problems.length) return null;
  return (
    <div role="alert" className="rounded-2xl border border-red-dark bg-red-50 p-4 text-sm text-red-dark">
      <p className="font-bold">{heading}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {problems.slice(0, 40).map((p) => (
          <li key={p.path + p.message}>{p.message}</li>
        ))}
      </ul>
      {problems.length > 40 && <p className="mt-2">…and {problems.length - 40} more.</p>}
    </div>
  );
}

export function SmallButton({
  children,
  onClick,
  disabled,
  tone = "navy",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "navy" | "red" | "plain";
}) {
  const tones = {
    navy: "border-2 border-navy text-navy hover:bg-mist",
    red: "bg-red text-white hover:bg-red-dark",
    plain: "text-navy underline",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-bold tracking-wide disabled:cursor-wait disabled:opacity-60 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
