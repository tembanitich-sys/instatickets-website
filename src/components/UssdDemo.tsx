"use client";

import { useState } from "react";
import { bookDemo, channelDemo } from "@content/site";

const t = channelDemo.ussd;
const S = t.screens;
type Id = "idle" | "main" | "billers" | "product" | "from" | "to" | "date" | "trips" | "class" | "who" | "name" | "kin" | "pin" | "done";

const list = (head: string, items: readonly string[]) => `${head}\n${items.map((x, i) => `${i + 1}. ${x}`).join("\n")}`;

/** A simulated USSD session: dial *151#, Pay Bill, InstaTickets, Buy bus ticket and on to the PIN. */
export function UssdDemo() {
  const [id, setId] = useState<Id>("idle");
  const [input, setInput] = useState("");
  const [note, setNote] = useState("");
  const [from, setFrom] = useState("");

  const towns = bookDemo.towns;
  const times = bookDemo.times.map((x, i) => `${x} ${bookDemo.operator} ${bookDemo.operatorNames[i]}`);

  const text: Record<Id, string> = {
    idle: "",
    main: S.main,
    billers: S.billers,
    product: S.product,
    from: list(S.from, towns),
    to: list(S.to, towns.filter((x) => x !== from)),
    date: S.date,
    trips: list(S.trips, times),
    class: S.class,
    who: S.who,
    name: S.name,
    kin: S.kin,
    pin: S.pin,
    done: S.done,
  };

  function reset() {
    setId("idle");
    setInput("");
    setNote("");
    setFrom("");
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const v = input.trim();
    setInput("");
    const pick = (max: number) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= max;
    const bad = () => setNote(t.invalid);
    const to2 = (next: Id) => {
      setNote("");
      setId(next);
    };
    switch (id) {
      case "main": return v === "1" ? to2("billers") : bad();
      case "billers": return v === "1" ? to2("product") : bad();
      case "product": return v === "1" ? to2("from") : bad();
      case "from": if (!pick(towns.length)) return bad(); setFrom(towns[Number(v) - 1]); return to2("to");
      case "to": return pick(towns.length - 1) ? to2("date") : bad();
      case "date": return pick(2) ? to2("trips") : bad();
      case "trips": return pick(times.length) ? to2("class") : bad();
      case "class": return pick(2) ? to2("who") : bad();
      case "who": return pick(2) ? to2("name") : bad();
      case "name": return v ? to2("kin") : bad();
      case "kin": return v.replace(/\D/g, "").length >= 9 ? to2("pin") : bad();
      case "pin": return /^\d{4}$/.test(v) ? to2("done") : bad();
      default: return;
    }
  }

  const active = id !== "idle" && id !== "done";

  return (
    <div className="mx-auto w-full max-w-xs rounded-[2rem] border-4 border-navy bg-ink p-3 shadow-lg">
      <p className="sr-only">{t.frameLabel}</p>
      <div className="flex min-h-[22rem] flex-col rounded-2xl bg-[#e8efe6] p-4 font-mono text-sm text-ink">
        {id === "idle" ? (
          <>
            <p className="text-center text-3xl font-bold tracking-widest">{t.dialCode}</p>
            <p className="mt-6 text-center text-xs text-muted">{t.dialHint}</p>
            <button
              type="button"
              onClick={() => setId("main")}
              aria-label={t.dialLabel}
              className="mx-auto mt-auto grid size-16 place-items-center rounded-full bg-[#1a9c46] text-white shadow hover:bg-[#15803d]"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="size-8 fill-current"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.6 3.6a1 1 0 0 1-.25 1z" /></svg>
            </button>
          </>
        ) : (
          <>
            <pre aria-live="polite" className="whitespace-pre-wrap font-mono">{text[id]}</pre>
            {note && <p role="alert" className="mt-3 text-xs font-bold text-red-dark">{note}</p>}
            {active ? (
              <form onSubmit={send} className="mt-auto pt-4">
                <label htmlFor="ussd-in" className="sr-only">{t.reply}</label>
                <input
                  id="ussd-in"
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  type={id === "pin" ? "password" : "text"}
                  inputMode={id === "name" ? "text" : "numeric"}
                  autoComplete="off"
                  maxLength={id === "pin" ? 4 : 40}
                  className="w-full border-b-2 border-ink bg-transparent py-1 outline-none"
                />
                <div className="mt-4 flex justify-between">
                  <button type="button" onClick={reset} className="min-h-11 font-bold text-red-dark">{t.cancel}</button>
                  <button type="submit" className="min-h-11 font-bold text-navy">{t.send}</button>
                </div>
              </form>
            ) : (
              <button type="button" onClick={reset} className="mt-auto min-h-11 pt-4 text-left font-bold text-navy underline">{t.end}</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
