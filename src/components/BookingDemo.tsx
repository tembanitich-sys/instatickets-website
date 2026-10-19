"use client";

import { useState } from "react";
import { bookDemo as t } from "@content/site";
import {
  allTowns,
  companyList,
  findCompany,
  matchCompanies,
  useLastCompany,
  saveLastCompany,
  tripsFor,
  type DemoCompany,
  type DemoTrip,
} from "@/lib/demoTrips";
import { QrPlaceholder } from "./QrPlaceholder";
import { brand } from "./Brand";
import { Select, TextInput } from "./forms/fields";

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Pax = { name: string; id: string };

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-red px-6 py-3 text-sm font-bold tracking-wide text-white transition-colors hover:bg-red-dark";
const btnGhost =
  "inline-flex min-h-11 items-center justify-center rounded-full border-2 border-navy px-6 py-2 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white";
const label = "mb-1.5 block text-sm font-bold text-navy";

/**
 * A simulated booking flow with sample trips, following the customer wireframe: search, trip,
 * seats, passenger details, review and pay, ticket. No network calls and no real data.
 */
export function BookingDemo({ channels, initialCompany }: { channels: React.ReactNode; initialCompany?: string }) {
  const opened = findCompany(initialCompany);
  const [step, setStep] = useState<Step>(opened ? 1 : 0);
  const [company, setCompany] = useState<DemoCompany | null>(opened ?? null);
  const [fromLink, setFromLink] = useState(Boolean(opened));
  const [query, setQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [sort, setSort] = useState<"time" | "fare">("time");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState("1");
  const [trip, setTrip] = useState<DemoTrip | null>(null);
  const [seats, setSeats] = useState<number[]>([]);
  const [people, setPeople] = useState<Pax[]>([]);
  const [kin, setKin] = useState("");
  const [mobile, setMobile] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const n = Number(pax);
  const lastSlug = useLastCompany();

  const townList = company ? [...company.towns].sort((a, b) => a.localeCompare(b)) : allTowns();
  const towns = [{ value: "", label: t.choose }, ...townList.map((x) => ({ value: x, label: x }))];
  const results = from && to ? tripsFor(from, to, company ?? undefined, sort) : [];

  function chooseCompany(c: DemoCompany) {
    saveLastCompany(c.slug);
    setCompany(c);
    setFromLink(false);
    setFrom("");
    setTo("");
    go(1);
  }

  function chooseRoute() {
    setCompany(null);
    setFromLink(false);
    setFrom("");
    setTo("");
    go(1);
  }
  const go = (to: Step) => {
    setError("");
    setStep(to);
  };

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to || from === to) return setError(company ? t.storefront.sameTown : t.sameTown);
    setTrip(null);
    setSeats([]);
    go(2);
  }

  function toggleSeat(seat: number) {
    setError("");
    setSeats((cur) => (cur.includes(seat) ? cur.filter((x) => x !== seat) : cur.length < n ? [...cur, seat] : cur));
  }

  function seatsNext() {
    if (seats.length !== n) return setError(t.seatsNeeded);
    setPeople(Array.from({ length: n }, (_, i) => people[i] ?? { name: "", id: "" }));
    go(4);
  }

  function peopleNext(e: React.FormEvent) {
    e.preventDefault();
    if (people.some((p) => !p.name.trim() || !p.id.trim())) return setError(t.needAll);
    if (mobile.replace(/\D/g, "").length < 9) return setError(t.needMobile);
    go(5);
  }

  function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) return setError(t.needAccept);
    if (!/^\d{4}$/.test(pin)) return setError(t.needPin);
    setPin("");
    go(6);
  }

  function restart() {
    setTrip(null);
    setSeats([]);
    setPeople([]);
    setAccepted(false);
    setPin("");
    setCompany(null);
    setFrom("");
    setTo("");
    go(0);
  }

  const err = error ? (
    <p role="alert" className="mt-4 text-sm font-semibold text-red-dark">
      {error}
    </p>
  ) : null;

  return (
    <div>
      <div role="tablist" aria-label="Ticket type" className="flex flex-wrap gap-2">
        {t.tabs.map((tab) => (
          <span
            key={tab.key}
            role="tab"
            aria-selected={tab.enabled}
            aria-disabled={!tab.enabled}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab.enabled ? "bg-navy text-white" : "bg-mist text-muted"}`}
          >
            {tab.label}
            {!tab.enabled && <span className="ml-2 text-xs">{t.tabSoon}</span>}
          </span>
        ))}
      </div>

      <ol aria-label="Progress" className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
        {t.stepLabels.map((l, i) => (
          <li key={l} aria-current={i === step ? "step" : undefined} className={i === step ? "text-red-dark" : i < step ? "text-navy" : "text-muted"}>
            {i + 1}. {l}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="mt-6">
          <h2 className="text-2xl font-extrabold text-navy">{t.start.heading}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-navy bg-white p-5 shadow-sm">
              <h3 className="text-lg font-extrabold tracking-wide text-navy">{t.start.company.title}</h3>
              <p className="mt-1 text-muted">{t.start.company.body}</p>
              <label htmlFor="bk-company" className={`${label} mt-4`}>{t.companyPick.label}</label>
              <TextInput
                id="bk-company"
                autoComplete="off"
                placeholder={t.companyPick.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query.trim() && (
                <div aria-live="polite" className="mt-3">
                  {matchCompanies(query).length === 0 ? (
                    <p className="text-sm font-semibold text-muted">{t.companyPick.noMatch}</p>
                  ) : (
                    <ul aria-label={t.companyPick.matches} className="grid gap-2">
                      {matchCompanies(query).map((c) => (
                        <li key={c.slug}>
                          <CompanyButton c={c} onPick={chooseCompany} last={false} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <button
                type="button"
                aria-expanded={showList}
                onClick={() => setShowList((v) => !v)}
                className={`${btnGhost} mt-4`}
              >
                {showList ? t.companyPick.hideList : t.companyPick.viewList}
              </button>
              {showList && (
                <div className="mt-3">
                  <p className="text-sm font-bold text-navy">{t.companyPick.listHeading}</p>
                  <ul className="mt-2 grid gap-2">
                    {companyList(lastSlug).map((c) => (
                      <li key={c.slug}>
                        <CompanyButton c={c} onPick={chooseCompany} last={c.slug === lastSlug} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h3 className="text-lg font-extrabold tracking-wide text-navy">{t.start.route.title}</h3>
              <p className="mt-1 flex-1 text-muted">{t.start.route.body}</p>
              <button type="button" onClick={chooseRoute} className={`${btnPrimary} mt-4 self-start`}>
                {t.start.route.title}
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 1 && company && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="px-5 py-4 text-white" style={{ backgroundColor: company.color }}>
            {fromLink && <p className="text-xs font-bold opacity-90">{t.storefront.opened(company.name)}</p>}
            <h2 className="text-2xl font-extrabold">{company.name}</h2>
            <p className="mt-1 text-sm opacity-90">{t.storefront.serves}: {company.towns.join(", ")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 px-5 py-4">
            <QrPlaceholder caption={t.storefront.qr} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-muted">{t.storefront.link}</p>
              <p className="break-all text-sm font-semibold text-navy">/book?company={company.slug}</p>
            </div>
            <button type="button" onClick={() => go(0)} className="ml-auto inline-flex min-h-11 items-center font-bold text-navy underline">
              {t.storefront.start}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={search} className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div>
            <label htmlFor="bk-from" className={label}>{t.from}</label>
            <Select id="bk-from" value={from} onChange={(e) => setFrom(e.target.value)} options={towns} />
          </div>
          <div>
            <label htmlFor="bk-to" className={label}>{t.to}</label>
            <Select id="bk-to" value={to} onChange={(e) => setTo(e.target.value)} options={towns} />
          </div>
          <div>
            <label htmlFor="bk-date" className={label}>{t.date}</label>
            <TextInput id="bk-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label htmlFor="bk-pax" className={label}>{t.passengers}</label>
            <Select
              id="bk-pax"
              value={pax}
              onChange={(e) => setPax(e.target.value)}
              options={[1, 2, 3, 4, 5, 6].map((x) => ({ value: String(x), label: String(x) }))}
            />
          </div>
          <button type="submit" className={btnPrimary}>{t.search}</button>
          {error && (
            <p role="alert" className="text-sm font-semibold text-red-dark sm:col-span-2 lg:col-span-5">{error}</p>
          )}
        </form>
      )}

      {step === 2 && (
        <section aria-live="polite" className="mt-8">
          <h2 className="text-2xl font-extrabold text-navy">{t.resultsHeading(from, to)}</h2>
          {!company && <p className="mt-1 text-sm text-muted">{t.routeNote}</p>}
          <div role="group" aria-label={t.sortLabel} className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-navy">{t.sortLabel}</span>
            {(["time", "fare"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={sort === k}
                onClick={() => setSort(k)}
                className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold ${sort === k ? "bg-navy text-white" : "border-2 border-navy text-navy"}`}
              >
                {k === "time" ? t.sortTime : t.sortFare}
              </button>
            ))}
          </div>
          {results.length === 0 ? (
            <p className="mt-4 font-semibold text-muted">{company ? t.storefront.noTrips : t.noRouteTrips}</p>
          ) : (
            <ul className="mt-4 grid gap-4">
              {results.map((r) => (
                <li key={`${r.company.slug}-${r.time}`} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-2xl font-extrabold tabular-nums text-navy">{r.time}</p>
                    <p className="text-sm text-muted">
                      {!company && <span className="font-semibold">{r.company.name}</span>}
                      {!company && date ? ", " : ""}
                      {date}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-muted">
                    {t.fareLabel} {t.currency}{r.fare}
                  </p>
                  <button
                    type="button"
                    disabled={r.full}
                    onClick={() => {
                      setTrip(r);
                      go(3);
                    }}
                    className={`${btnGhost} disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:hover:bg-transparent`}
                  >
                    {r.full ? t.full : t.select}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted">{t.fareNote}</p>
          <button type="button" onClick={() => go(1)} className="mt-4 inline-flex min-h-11 items-center font-bold text-navy underline">
            {t.back}
          </button>
        </section>
      )}

      {step === 3 && (
        <section aria-live="polite" className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold text-navy">{t.seatsHeading}</h2>
          <p className="mt-1 text-muted">{t.seatsHint(n)}</p>
          <ul className="mt-5 grid max-w-md grid-cols-4 gap-3">
            {Array.from({ length: t.seatCount }, (_, i) => i + 1).map((seat) => {
              const taken = (t.seatTakenList as readonly number[]).includes(seat);
              const chosen = seats.includes(seat);
              return (
                <li key={seat}>
                  <button
                    type="button"
                    disabled={taken}
                    aria-pressed={chosen}
                    aria-label={`${t.seatLabel(seat)}, ${taken ? t.seatTaken : chosen ? t.seatChosen : t.seatFree}`}
                    onClick={() => toggleSeat(seat)}
                    className={`min-h-11 w-full rounded-lg border-2 text-sm font-bold ${
                      taken
                        ? "border-line bg-mist text-muted line-through"
                        : chosen
                          ? "border-red bg-red text-white"
                          : "border-navy text-navy hover:bg-navy hover:text-white"
                    }`}
                  >
                    {seat}
                  </button>
                </li>
              );
            })}
          </ul>
          {err}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => go(2)} className={btnGhost}>{t.back2}</button>
            <button type="button" onClick={seatsNext} className={btnPrimary}>{t.next}</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <form onSubmit={peopleNext} className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold text-navy">{t.passengersHeading}</h2>
          <p className="mt-1 text-muted">{t.passengersHint}</p>
          <div className="mt-5 grid gap-6">
            {people.map((p, i) => (
              <fieldset key={i} className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-2 font-bold text-navy">
                  {t.passengerTitle(i + 1)} · {t.seatLabel(seats[i])}
                </legend>
                <div>
                  <label htmlFor={`bk-n${i}`} className={label}>{t.fullName}</label>
                  <TextInput
                    id={`bk-n${i}`}
                    value={p.name}
                    onChange={(e) => setPeople((c) => c.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                  />
                </div>
                <div>
                  <label htmlFor={`bk-i${i}`} className={label}>{t.idNumber}</label>
                  <TextInput
                    id={`bk-i${i}`}
                    value={p.id}
                    onChange={(e) => setPeople((c) => c.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)))}
                  />
                </div>
              </fieldset>
            ))}
            <div>
              <label htmlFor="bk-kin" className={label}>{t.nextOfKin}</label>
              <TextInput id="bk-kin" value={kin} onChange={(e) => setKin(e.target.value)} />
              <p className="mt-1 text-sm text-muted">{t.nextOfKinHint}</p>
            </div>
            <div>
              <label htmlFor="bk-mobile" className={label}>{t.mobile}</label>
              <TextInput id="bk-mobile" type="tel" inputMode="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              <p className="mt-1 text-sm text-muted">{t.signInHint}</p>
            </div>
          </div>
          {err}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => go(3)} className={btnGhost}>{t.back2}</button>
            <button type="submit" className={btnPrimary}>{t.next}</button>
          </div>
        </form>
      )}

      {step === 5 && trip && (
        <form onSubmit={pay} className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold text-navy">{t.reviewHeading}</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr]">
            <dt className="font-bold text-navy">{t.summaryTrip}</dt>
            <dd>{from} to {to}, {trip.time}{date ? `, ${date}` : ""}, {trip.company.name}</dd>
            <dt className="font-bold text-navy">{t.summarySeats}</dt>
            <dd>{seats.join(", ")}</dd>
            <dt className="font-bold text-navy">{t.summaryPassengers}</dt>
            <dd>{people.map((p) => p.name).join(", ")}</dd>
            <dt className="font-bold text-navy">{t.summaryFare}</dt>
            <dd>{t.currency}{trip.fare * seats.length} ({seats.length} x {t.currency}{trip.fare})</dd>
          </dl>
          <p className="mt-4 text-sm text-muted">{t.refundNote}</p>
          <label className="mt-4 flex items-start gap-3 text-sm font-semibold text-navy">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 size-5" />
            {t.accept}
          </label>
          <div className="mt-5 max-w-xs">
            <label htmlFor="bk-pin" className={label}>{t.payWith} {t.pin}</label>
            <TextInput id="bk-pin" type="password" inputMode="numeric" autoComplete="off" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value)} />
            <p className="mt-1 text-sm text-muted">{t.pinHint}</p>
          </div>
          {err}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => go(4)} className={btnGhost}>{t.back2}</button>
            <button type="submit" className={btnPrimary}>{t.pay}</button>
          </div>
        </form>
      )}

      {step === 6 && trip && (
        <section aria-live="polite" className="mt-8 rounded-2xl bg-mist p-6">
          <h2 className="text-2xl font-extrabold text-navy">{t.doneHeading}</h2>
          <p className="mt-2 text-muted">
            {from} to {to}, {trip.time}, {t.summarySeats.toLowerCase()} {seats.join(", ")}. {t.reference}: {t.referenceSample}
          </p>
          <p className="mt-3 text-muted">{t.doneBody}</p>
          <p className="mt-3 font-semibold text-navy">{brand(t.refundPromise)}</p>
          <p className="mt-6 font-semibold text-navy">{t.otherWays}</p>
          <div className="mt-3">{channels}</div>
          <button type="button" onClick={restart} className={`${btnGhost} mt-6`}>{t.bookAgain}</button>
        </section>
      )}
    </div>
  );
}

function CompanyButton({ c, onPick, last }: { c: DemoCompany; onPick: (c: DemoCompany) => void; last: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onPick(c)}
      className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-white px-4 py-2 text-left font-bold text-navy hover:border-navy"
    >
      <span aria-hidden className="size-4 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
      <span className="flex-1">{c.name}</span>
      {last && <span className="rounded-full bg-mist px-2 py-0.5 text-xs">{t.companyPick.lastUsed}</span>}
      <span className="text-xs tracking-wide text-red-dark">{t.companyPick.open}</span>
    </button>
  );
}
