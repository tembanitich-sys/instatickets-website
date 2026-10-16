"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { findAgent as t } from "@content/site";
import type { Outlet, OutletKind } from "@content/locations";
import { Select, TextInput } from "./forms/fields";

const PROVINCES = [
  "Bulawayo",
  "Harare",
  "Manicaland",
  "Mashonaland Central",
  "Mashonaland East",
  "Mashonaland West",
  "Masvingo",
  "Matabeleland North",
  "Matabeleland South",
  "Midlands",
];

const norm = (v: string) => v.toLowerCase().trim();

/** Search and filter over a list of outlets given by the page. No network calls. */
export function AgentLocator({
  outlets,
  showUnconfirmed,
  kinds,
}: {
  outlets: Outlet[];
  showUnconfirmed: boolean;
  /** The outlet types that may be named publicly, with their labels. */
  kinds: { value: OutletKind; label: string }[];
}) {
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [kind, setKind] = useState("");

  const results = useMemo(() => {
    const needle = norm(q);
    return outlets.filter(
      (o) =>
        (!province || o.province === province) &&
        (!kind || o.kind === kind) &&
        (!needle || norm(`${o.name} ${o.town} ${o.address ?? ""}`).includes(needle)),
    );
  }, [outlets, q, province, kind]);

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-3" role="search">
        <div>
          <label htmlFor="loc-q" className="mb-1.5 block text-sm font-bold text-navy">
            {t.search}
          </label>
          <TextInput
            id="loc-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.searchHint}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="loc-province" className="mb-1.5 block text-sm font-bold text-navy">
            {t.province}
          </label>
          <Select
            id="loc-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            options={[{ value: "", label: t.all }, ...PROVINCES.map((p) => ({ value: p, label: p }))]}
          />
        </div>
        {kinds.length > 1 && (
          <div>
            <label htmlFor="loc-kind" className="mb-1.5 block text-sm font-bold text-navy">
              {t.type}
            </label>
            <Select
              id="loc-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              options={[{ value: "", label: t.allTypes }, ...kinds]}
            />
          </div>
        )}
      </form>

      <p role="status" aria-live="polite" className="mt-6 text-sm font-bold text-navy">
        {t.results(results.length)}
      </p>

      {results.length === 0 ? (
        <p className="mt-4 rounded-xl bg-mist p-5 text-muted">{outlets.length === 0 ? t.noneYet : t.empty}</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {results.map((o) => {
            const label = kinds.find((k) => k.value === o.kind)?.label ?? "";
            const query = encodeURIComponent([o.name, o.address, o.town, "Zimbabwe"].filter(Boolean).join(", "));
            return (
              <li key={o.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
                <span className="text-xs font-extrabold uppercase tracking-widest text-red">{label}</span>
                <h3 className="mt-1 text-lg font-extrabold text-navy">{o.name}</h3>
                <p className="mt-1 flex items-start gap-2 text-muted">
                  <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                  <span>{[...new Set([o.address, o.town, o.province].filter(Boolean))].join(", ")}</span>
                </p>
                {showUnconfirmed && !o.confirmed && (
                  <span className="mt-2 w-fit rounded bg-yellow-200 px-2 py-0.5 text-xs font-extrabold text-ink">
                    {t.unconfirmed}
                  </span>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${query}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center font-bold text-navy underline"
                >
                  {t.directions}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
