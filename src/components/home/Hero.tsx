import Image from "next/image";
import { home, nav } from "@content/site";
import { Countdown } from "../Countdown";
import { ButtonLink } from "../ui";

export function Hero({ nowMs, getStartedUrl }: { nowMs: number; getStartedUrl: string }) {
  const h = home.hero;
  return (
    <div className="hero-bg on-navy relative overflow-hidden text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 text-center sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
        <Image
          src="/brand/logo-full.png"
          alt="InstaTickets: Bus, Events, Sports. A Bullion Technologies company."
          width={1800}
          height={540}
          priority
          sizes="(min-width: 640px) 480px, 80vw"
          className="mx-auto h-auto w-[80vw] max-w-[480px] rounded-2xl shadow-2xl"
        />

        <h1 className="mx-auto mt-10 max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
          {h.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/90 sm:text-xl">{h.subheading}</p>

        <p className="mt-6 text-sm font-bold tracking-[0.3em] text-white sm:text-base">
          {h.categories.join(" | ")}
        </p>
        <p className="mt-2 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold tracking-widest">
          {h.launchLine}
        </p>

        <Countdown initialNowMs={nowMs} getStartedUrl={getStartedUrl} />

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <ButtonLink href={nav.join.href} variant="primary">
            {h.primary}
          </ButtonLink>
          <ButtonLink href={nav.registerBusiness.href} variant="secondaryOnDark">
            {h.secondary}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
