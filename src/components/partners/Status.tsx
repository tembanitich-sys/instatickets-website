import type { ReactNode } from "react";

const tone = {
  good: "border-green-700 bg-green-50 text-green-900",
  warn: "border-amber-600 bg-amber-50 text-amber-900",
  bad: "border-red-dark bg-red-50 text-red-dark",
  info: "border-navy bg-white text-navy",
};

export function StatusPanel({
  title,
  facts,
  note,
  kind = "info",
  children,
}: {
  title: string;
  facts: [string, string][];
  note?: string | null;
  kind?: keyof typeof tone;
  children?: ReactNode;
}) {
  return (
    <section className={`rounded-3xl border-2 p-5 sm:p-7 ${tone[kind]}`}>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
      <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt className="font-semibold opacity-80">{k}</dt>
            <dd className="font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="mt-4 whitespace-pre-line leading-relaxed">{note}</p>}
      {children}
    </section>
  );
}

export function FileLinks({ files, base }: { files: { id: string; label: string; fileName: string }[]; base: string }) {
  if (!files.length) return null;
  return (
    <ul className="space-y-2">
      {files.map((f) => (
        <li key={f.id} className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-semibold text-ink">{f.label}</span>
          <a href={`${base}/${f.id}`} className="text-sm font-semibold text-navy underline">
            Download {f.fileName}
          </a>
        </li>
      ))}
    </ul>
  );
}
