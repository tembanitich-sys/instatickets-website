"use client";

import { useEffect, useRef, useState } from "react";
import { bookDemo, channelDemo } from "@content/site";
import { brand } from "./Brand";
import { allTowns, companyList, matchCompanies, readLastCompany, saveLastCompany, tripsFor, type DemoCompany, type DemoTrip } from "@/lib/demoTrips";
import { Select, TextInput } from "./forms/fields";

const t = channelDemo.whatsapp;
type Msg = { who: "bot" | "me"; text: string };
type Step = "start" | "menu" | "company" | "form" | "trips" | "names" | "summary" | "pay" | "ticket";

const bubble = (who: Msg["who"]) =>
  `max-w-[17rem] rounded-xl px-3 py-2 text-sm shadow-sm ${who === "me" ? "ml-auto bg-[#d9fdd3]" : "mr-auto bg-white"}`;
const action =
  "block w-full rounded-lg bg-white px-3 py-3 text-center text-sm font-bold text-[#027eb5] shadow-sm hover:bg-[#f0f2f5]";
const label = "mb-1 block text-xs font-bold text-navy";

/** A simulated WhatsApp chat: Hi, menu, trip form, trips, passenger, summary, pay, ticket. */
export function WhatsAppDemo() {
  const [step, setStep] = useState<Step>("start");
  const [log, setLog] = useState<Msg[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState("1");
  const [trip, setTrip] = useState<DemoTrip | null>(null);
  const [company, setCompany] = useState<DemoCompany | null>(null);
  const [options, setOptions] = useState<DemoCompany[]>([]);
  const [typed, setTyped] = useState("");
  const [name, setName] = useState("");
  const [idNo, setIdNo] = useState("");
  const [error, setError] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [log, step]);

  const say = (me: string | null, bot: string[], next: Step) => {
    setError("");
    setLog((l) => [...l, ...(me ? [{ who: "me" as const, text: me }] : []), ...bot.map((text) => ({ who: "bot" as const, text }))]);
    setStep(next);
  };
  const townList = company ? [...company.towns].sort((a, b) => a.localeCompare(b)) : allTowns();
  const towns = [{ value: "", label: t.choose }, ...townList.map((x) => ({ value: x, label: x }))];
  const results = from && to ? tripsFor(from, to, company ?? undefined) : [];
  const n = Number(pax);

  function restart() {
    setLog([]);
    setStep("start");
    setTrip(null);
    setCompany(null);
    setOptions([]);
    setFrom("");
    setTo("");
    setName("");
    setIdNo("");
  }

  function chooseCompany(c: DemoCompany) {
    saveLastCompany(c.slug);
    setCompany(c);
    setFrom("");
    setTo("");
    setOptions([]);
    say(c.name, [t.pickedCompany(c.name), t.storefrontOnly(c.name)], "form");
  }

  function chooseRoute() {
    setCompany(null);
    setOptions([]);
    say(t.byRoute, [t.formIntro], "form");
  }

  function sendTyped(e: React.FormEvent) {
    e.preventDefault();
    const v = typed.trim();
    if (!v) return;
    setTyped("");
    if (v.toUpperCase() === t.listWord) {
      setOptions(companyList(readLastCompany()));
      return say(v, [t.listIntro], "company");
    }
    const found = matchCompanies(v);
    setOptions(found);
    say(v, [found.length ? t.matchIntro : t.noMatch], "company");
  }

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border-4 border-navy bg-[#efeae2] shadow-lg">
      <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
        <span aria-hidden className="grid size-9 place-items-center rounded-full bg-white text-sm font-extrabold text-[#075e54]">IT</span>
        <div>
          <p className="text-sm font-bold">{t.profileName}</p>
          <p className="text-xs text-white/80">{t.profileNote}</p>
        </div>
      </div>

      <div ref={box} aria-live="polite" className="flex h-[26rem] flex-col gap-2 overflow-y-auto p-3">
        {log.map((m, i) => (
          <p key={i} className={bubble(m.who)}>{m.text}</p>
        ))}

        {step === "start" && <button type="button" onClick={() => say(t.hi, [t.welcome], "menu")} className={action}>{t.startPrompt}</button>}

        {step === "menu" && (
          <ul className="grid gap-2">
            {t.menu.map((m) => (
              <li key={m.key}>
                <button
                  type="button"
                  onClick={() => (m.key === "book" ? say(m.label, [t.companyPrompt], "company") : say(m.label, [t.soon], "menu"))}
                  className={action}
                >
                  {m.label}
                  {"soon" in m && m.soon ? ` (${bookDemo.tabSoon})` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}

        {step === "company" && (
          <ul className="grid gap-2">
            {options.map((c) => (
              <li key={c.slug}>
                <button type="button" onClick={() => chooseCompany(c)} className={action}>{c.name}</button>
              </li>
            ))}
            <li>
              <button type="button" onClick={chooseRoute} className={action}>{t.byRoute}</button>
            </li>
          </ul>
        )}

        {step === "form" && (
          <form
            className="grid gap-3 rounded-xl bg-white p-3 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!from || !to || from === to) return setError(t.sameTown);
              say(`${from} to ${to}, ${date || "-"}, ${pax}`, [t.tripsIntro], "trips");
            }}
          >
            <div><label htmlFor="wa-from" className={label}>{t.from}</label><Select id="wa-from" value={from} onChange={(e) => setFrom(e.target.value)} options={towns} /></div>
            <div><label htmlFor="wa-to" className={label}>{t.to}</label><Select id="wa-to" value={to} onChange={(e) => setTo(e.target.value)} options={towns} /></div>
            <div><label htmlFor="wa-date" className={label}>{t.date}</label><TextInput id="wa-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div>
              <label htmlFor="wa-pax" className={label}>{t.passengers}</label>
              <Select id="wa-pax" value={pax} onChange={(e) => setPax(e.target.value)} options={[1, 2, 3, 4, 5, 6].map((x) => ({ value: String(x), label: String(x) }))} />
            </div>
            {error && <p role="alert" className="text-sm font-semibold text-red-dark">{error}</p>}
            <button type="submit" className="min-h-11 rounded-full bg-[#128c7e] px-4 py-2 text-sm font-bold text-white">{t.formSubmit}</button>
          </form>
        )}

        {step === "trips" && (
          <ul className="grid gap-2">
            {results.length === 0 && <li className={bubble("bot")}>{t.noRouteTrips}</li>}
            {results.map((r) => {
              const line = t.tripLine(r.time, r.company.name, `${bookDemo.currency}${r.fare}`);
              return (
                <li key={`${r.company.slug}-${r.time}`}>
                  <button
                    type="button"
                    disabled={r.full}
                    onClick={() => { setTrip(r); say(line, [t.pickedTrip(line), t.namesIntro], "names"); }}
                    className={`${action} disabled:text-muted`}
                  >
                    {line}{r.full ? ` (${bookDemo.full})` : ""}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {step === "names" && (
          <form
            className="grid gap-3 rounded-xl bg-white p-3 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !idNo.trim()) return setError(t.needAll);
              say(`${name}, ${idNo}`, [`${t.summaryTitle}: ${t.summary(from, to, trip?.time ?? "", n)}`, t.refundNote], "summary");
            }}
          >
            <div><label htmlFor="wa-name" className={label}>{t.fullName}</label><TextInput id="wa-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label htmlFor="wa-id" className={label}>{t.idNumber}</label><TextInput id="wa-id" value={idNo} onChange={(e) => setIdNo(e.target.value)} /></div>
            {error && <p role="alert" className="text-sm font-semibold text-red-dark">{error}</p>}
            <button type="submit" className="min-h-11 rounded-full bg-[#128c7e] px-4 py-2 text-sm font-bold text-white">{t.namesSubmit}</button>
          </form>
        )}

        {step === "summary" && <button type="button" onClick={() => say(t.accept, [t.payPrompt], "pay")} className={action}>{t.accept}</button>}
        {step === "pay" && <button type="button" onClick={() => say(t.approve, [t.paid], "ticket")} className={action}>{t.approve}</button>}

        {step === "ticket" && (
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <p className="text-sm font-extrabold text-navy">{t.ticketTitle}</p>
            <p className="mt-1 text-sm">{t.ticketLine(from, to, trip?.time ?? "")}</p>
            <p className="mt-1 text-sm text-muted">{name}, {channelDemo.reference}</p>
            <div aria-hidden className="mt-3 grid size-24 grid-cols-6 gap-px bg-white">
              {Array.from({ length: 36 }, (_, i) => (
                <span key={i} className={(i * 7 + (i >> 2)) % 3 === 0 ? "bg-white" : "bg-ink"} />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">{t.ticketNote}</p>
            <p className="mt-2 text-xs font-semibold text-navy">{brand(bookDemo.refundPromise)}</p>
            <button type="button" onClick={restart} className="mt-3 min-h-11 text-sm font-bold text-navy underline">{t.again}</button>
          </div>
        )}
      </div>
      {step === "company" ? (
        <form onSubmit={sendTyped} className="flex gap-2 bg-[#f0f2f5] p-2">
          <label htmlFor="wa-type" className="sr-only">{t.typing}</label>
          <input
            id="wa-type"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={t.typing}
            autoComplete="off"
            className="min-h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm"
          />
          <button type="submit" className="min-h-11 rounded-full bg-[#128c7e] px-4 text-sm font-bold text-white">{t.send}</button>
        </form>
      ) : (
        <p className="bg-[#f0f2f5] px-4 py-3 text-xs text-muted">{t.typing}</p>
      )}
    </div>
  );
}
