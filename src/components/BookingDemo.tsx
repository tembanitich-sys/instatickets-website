"use client";

import { useState } from "react";
import { bookDemo as t } from "@content/site";
import { brand } from "./Brand";
import { Select, TextInput } from "./forms/fields";

type Step = 0 | 1 | 2 | 3 | 4 | 5;
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
export function BookingDemo({ channels }: { channels: React.ReactNode }) {
  const [step, setStep] = useState<Step>(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState("1");
  const [trip, setTrip] = useState<{ time: string; operator: string } | null>(null);
  const [seats, setSeats] = useState<number[]>([]);
  const [people, setPeople] = useState<Pax[]>([]);
  const [kin, setKin] = useState("");
  const [mobile, setMobile] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const n = Number(pax);
  const towns = [{ value: "", label: t.choose }, ...t.towns.map((x) => ({ value: x, label: x }))];
  const go = (to: Step) => {
    setError("");
    setStep(to);
  };

  function search(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to || from === to) return setError(t.sameTown);
    setTrip(null);
    setSeats([]);
    go(1);
  }

  function toggleSeat(seat: number) {
    setError("");
    setSeats((cur) => (cur.includes(seat) ? cur.filter((x) => x !== seat) : cur.length < n ? [...cur, seat] : cur));
  }

  function seatsNext() {
    if (seats.length !== n) return setError(t.seatsNeeded);
    setPeople(Array.from({ length: n }, (_, i) => people[i] ?? { name: "", id: "" }));
    go(3);
  }

  function peopleNext(e: React.FormEvent) {
    e.preventDefault();
    if (people.some((p) => !p.name.trim() || !p.id.trim())) return setError(t.needAll);
    if (mobile.replace(/\D/g, "").length < 9) return setError(t.needMobile);
    go(4);
  }

  function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!accepted) return setError(t.needAccept);
    if (!/^\d{4}$/.test(pin)) return setError(t.needPin);
    setPin("");
    go(5);
  }

  function restart() {
    setTrip(null);
    setSeats([]);
    setPeople([]);
    setAccepted(false);
    setPin("");
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

      {step === 1 && (
        <section aria-live="polite" className="mt-8">
          <h2 className="text-2xl font-extrabold text-navy">{t.resultsHeading(from, to)}</h2>
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
                  onClick={() => {
                    setTrip({ time, operator: t.operatorNames[i] });
                    go(2);
                  }}
                  className={btnGhost}
                >
                  {t.select}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => go(0)} className="mt-6 inline-flex min-h-11 items-center font-bold text-navy underline">
            {t.back}
          </button>
        </section>
      )}

      {step === 2 && (
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
            <button type="button" onClick={() => go(1)} className={btnGhost}>{t.back2}</button>
            <button type="button" onClick={seatsNext} className={btnPrimary}>{t.next}</button>
          </div>
        </section>
      )}

      {step === 3 && (
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
            <button type="button" onClick={() => go(2)} className={btnGhost}>{t.back2}</button>
            <button type="submit" className={btnPrimary}>{t.next}</button>
          </div>
        </form>
      )}

      {step === 4 && trip && (
        <form onSubmit={pay} className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-extrabold text-navy">{t.reviewHeading}</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr]">
            <dt className="font-bold text-navy">{t.summaryTrip}</dt>
            <dd>{from} to {to}, {trip.time}{date ? `, ${date}` : ""}, {t.operator} {trip.operator}</dd>
            <dt className="font-bold text-navy">{t.summarySeats}</dt>
            <dd>{seats.join(", ")}</dd>
            <dt className="font-bold text-navy">{t.summaryPassengers}</dt>
            <dd>{people.map((p) => p.name).join(", ")}</dd>
            <dt className="font-bold text-navy">{t.summaryFare}</dt>
            <dd>{t.summaryFareValue}</dd>
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
            <button type="button" onClick={() => go(3)} className={btnGhost}>{t.back2}</button>
            <button type="submit" className={btnPrimary}>{t.pay}</button>
          </div>
        </form>
      )}

      {step === 5 && trip && (
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
