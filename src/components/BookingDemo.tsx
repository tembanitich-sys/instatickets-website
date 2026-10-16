"use client";

import { useState } from "react";
import { bookDemo as t } from "@content/site";
import { Select, TextInput } from "./forms/fields";

type Selected = { time: string; operator: string };

/** A simulated booking flow with sample trips. No network calls and no real data. */
export function BookingDemo({ channels }: { channels: React.ReactNode }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState("1");
  const [error, setError] = useState("");
  const [searched, setSearched] = useState<{ from: string; to: string } | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);

  const towns = [{ value: "", label: t.choose }, ...t.towns.map((x) => ({ value: x, label: x }))];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSelected(null);
    if (!from || !to || from === to) {
      setError(t.sameTown);
      setSearched(null);
      return;
    }
    setError("");
    setSearched({ from, to });
  }

  return (
    <div>
      <div role="tablist" aria-label="Ticket type" className="flex flex-wrap gap-2">
        {t.tabs.map((tab) => (
          <span
            key={tab.key}
            role="tab"
            aria-selected={tab.enabled}
            aria-disabled={!tab.enabled}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              tab.enabled ? "bg-navy text-white" : "bg-mist text-muted"
            }`}
          >
            {tab.label}
            {!tab.enabled && <span className="ml-2 text-xs">{t.tabSoon}</span>}
          </span>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div>
          <label htmlFor="bk-from" className="mb-1.5 block text-sm font-bold text-navy">{t.from}</label>
          <Select id="bk-from" value={from} onChange={(e) => setFrom(e.target.value)} options={towns} />
        </div>
        <div>
          <label htmlFor="bk-to" className="mb-1.5 block text-sm font-bold text-navy">{t.to}</label>
          <Select id="bk-to" value={to} onChange={(e) => setTo(e.target.value)} options={towns} />
        </div>
        <div>
          <label htmlFor="bk-date" className="mb-1.5 block text-sm font-bold text-navy">{t.date}</label>
          <TextInput id="bk-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="bk-pax" className="mb-1.5 block text-sm font-bold text-navy">{t.passengers}</label>
          <Select
            id="bk-pax"
            value={pax}
            onChange={(e) => setPax(e.target.value)}
            options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-red px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-red-dark"
        >
          {t.search}
        </button>
        {error && (
          <p role="alert" className="text-sm font-semibold text-red-dark sm:col-span-2 lg:col-span-5">
            {error}
          </p>
        )}
      </form>

      {searched && !selected && (
        <section aria-live="polite" className="mt-8">
          <h2 className="text-2xl font-extrabold text-navy">{t.resultsHeading(searched.from, searched.to)}</h2>
          <ul className="mt-4 grid gap-4">
            {t.times.map((time, i) => (
              <li key={time} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-2xl font-extrabold tabular-nums text-navy">{time}</p>
                  <p className="text-sm text-muted">
                    {t.operator} {t.operatorNames[i]}
                    {date ? `, ${date}` : ""}
                  </p>
                </div>
                <p className="text-sm font-semibold text-muted">{t.fare}</p>
                <button
                  type="button"
                  onClick={() => setSelected({ time, operator: t.operatorNames[i] })}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-navy px-6 py-2 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  {t.select}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {searched && selected && (
        <section aria-live="polite" className="mt-8 rounded-2xl bg-mist p-6">
          <h2 className="text-2xl font-extrabold text-navy">{t.selected}</h2>
          <p className="mt-2 text-muted">
            {searched.from} to {searched.to}, {selected.time}, {t.operator} {selected.operator}, {pax}{" "}
            {Number(pax) === 1 ? "passenger" : "passengers"}
          </p>
          <p className="mt-4 font-semibold text-navy">{t.next}</p>
          <div className="mt-4">{channels}</div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mt-6 inline-flex min-h-11 items-center font-bold text-navy underline"
          >
            {t.back}
          </button>
        </section>
      )}
    </div>
  );
}
