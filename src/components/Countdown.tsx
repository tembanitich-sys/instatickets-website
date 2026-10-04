"use client";

import { useEffect, useState } from "react";
import { countdown as t } from "@content/site";
import { estimateClockOffset, getTimeLeft, isPreviewAllowed, parsePreviewNow } from "@/lib/countdown";
import { brand } from "./Brand";
import { buttonClass } from "./ui";

const pad = (n: number) => String(n).padStart(2, "0");

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center rounded-2xl bg-navy-deep/50 px-1 py-2.5 sm:px-3 sm:py-3">
      <span className="text-3xl font-extrabold tabular-nums leading-none sm:text-4xl lg:text-5xl">{value}</span>
      <span className="mt-1.5 text-[0.65rem] font-bold tracking-widest text-white/90 sm:text-xs">{label}</span>
    </div>
  );
}

/**
 * `initialNowMs` is the server's time when the page was rendered, so the first
 * paint already shows a real value and nothing jumps. After hydration the clock
 * is corrected against the server (/api/now) and ticks every second.
 */
export function Countdown({ initialNowMs, getStartedUrl }: { initialNowMs: number; getStartedUrl: string }) {
  // Whole seconds since the epoch; the state only changes once per second.
  const [nowSec, setNowSec] = useState(() => Math.floor(initialNowMs / 1000));

  useEffect(() => {
    const preview = isPreviewAllowed({
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
    })
      ? parsePreviewNow(window.location.search)
      : null;

    const startedAt = Date.now();
    let offset = 0;
    const current = () => (preview !== null ? preview + (Date.now() - startedAt) : Date.now() + offset);
    const tick = () => setNowSec(Math.floor(current() / 1000));

    let cancelled = false;
    if (preview === null) {
      const sentAt = Date.now();
      fetch("/api/now", { cache: "no-store" })
        .then((r) => r.json() as Promise<{ now: number }>)
        .then(({ now }) => {
          if (cancelled || typeof now !== "number") return;
          offset = estimateClockOffset(sentAt, now, Date.now());
          tick();
        })
        .catch(() => {
          // Keep using the device clock if the server time cannot be fetched.
        });
    }

    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 250);
    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const left = getTimeLeft(nowSec * 1000);

  if (left.launched) {
    return (
      <div className="rounded-3xl bg-white/10 p-5 text-center ring-1 ring-white/20 sm:p-6">
        <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">{brand(t.liveHeading)}</p>
        <a
          href={getStartedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("primary", "mt-4")}
        >
          {t.liveButton}
        </a>
      </div>
    );
  }

  return (
    <div
      role="timer"
      aria-label={t.timerLabel}
      className="flex w-full gap-1.5 rounded-3xl bg-white/10 p-2 ring-1 ring-white/20 sm:gap-2 sm:p-2.5"
    >
      <Tile value={String(left.days).padStart(2, "0")} label={t.labels.days} />
      <Tile value={pad(left.hours)} label={t.labels.hours} />
      <Tile value={pad(left.minutes)} label={t.labels.minutes} />
      <Tile value={pad(left.seconds)} label={t.labels.seconds} />
    </div>
  );
}
