import Image from "next/image";
import { home, nav } from "@content/site";
import { Countdown } from "../Countdown";
import { ButtonLink, JoinButton } from "../ui";

/**
 * Hero layout.
 *
 * Desktop (1024px and up): two columns. Left: launch line, headline, subheading,
 * categories and the two buttons. Right: the full logo with the countdown directly
 * beneath it. The hero is sized to fit the first screen, header included.
 *
 * Mobile: one column in this order: launch line, headline, subheading, categories,
 * countdown, buttons, then a small logo. The two column wrappers use `display: contents`
 * below 1024px so their children can be interleaved with `order`; the source order
 * is the desktop reading order (text, buttons, logo, countdown).
 */
export function Hero({ nowMs, getStartedUrl }: { nowMs: number; getStartedUrl: string }) {
  const h = home.hero;
  return (
    <div className="hero-bg on-navy relative overflow-hidden text-white lg:flex lg:min-h-[calc(100svh-65px)] lg:items-center">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-10 pt-6 text-center sm:px-6 sm:pb-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-8 lg:text-left">
        {/* Left column on desktop */}
        <div className="contents lg:flex lg:flex-col lg:items-start">
          <p className="order-1 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest sm:text-sm">
            {h.launchLine}
          </p>

          <h1 className="order-2 mt-4 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:mt-5 lg:text-4xl xl:text-5xl">
            {h.headline}
          </h1>

          <p className="order-3 mt-3 max-w-xl text-base text-white/90 sm:text-lg lg:mt-4">{h.subheading}</p>

          <p className="order-4 mt-3 text-xs font-bold tracking-[0.3em] sm:text-sm lg:mt-5">
            {h.categories.join(" | ")}
          </p>

          <div className="order-6 mt-5 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center lg:mt-7">
            <JoinButton />
            <ButtonLink href={nav.registerBusiness.href} variant="secondaryOnDark">
              {h.secondary}
            </ButtonLink>
          </div>
        </div>

        {/* Right column on desktop: logo, then the countdown directly beneath it */}
        <div className="contents lg:flex lg:w-full lg:max-w-[520px] lg:flex-col lg:items-stretch lg:justify-self-end">
          <Image
            src="/brand/logo-full.png"
            alt="InstaTickets: Bus, Events, Sports. A Bullion Technologies product."
            width={1800}
            height={521}
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 520px, 240px"
            className="order-7 mx-auto mt-6 h-auto w-[62vw] max-w-[240px] ticket-edge lg:order-none lg:mt-0 lg:w-full lg:max-w-[520px]"
          />

          <div className="order-5 mt-5 w-full max-w-md lg:order-none lg:mt-5 lg:max-w-none">
            <Countdown initialNowMs={nowMs} getStartedUrl={getStartedUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
