import Image from "next/image";
import { facts, partnerVisible, type PartnerKey } from "@content/facts";
import { home } from "@content/site";
import { brand } from "../Brand";
import { ChannelIcon, type ChannelKey } from "../ChannelIcon";
import { StoreBadges } from "../StoreBadges";
import { BookButton, ButtonLink } from "../ui";

/**
 * Hero layout.
 *
 * Desktop (1024px and up): two columns. Left: launch line, headline, subheading,
 * categories and the two buttons. Right: the full logo with the ways to buy directly
 * beneath it. The hero is sized to fit the first screen, header included.
 *
 * Mobile: one column in this order: launch line, headline, subheading, categories,
 * ways to buy, buttons, then a small logo. The two column wrappers use `display: contents`
 * below 1024px so their children can be interleaved with `order`; the source order
 * is the desktop reading order (text, buttons, logo, ways to buy).
 */
export function Hero() {
  const h = home.hero;
  const chips = h.chips.filter((c) => {
    const status = facts.channels[c.key as keyof typeof facts.channels];
    if (status === "hidden") return false;
    return !("partner" in c) || partnerVisible(c.partner as PartnerKey);
  });
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

          <p className="order-3 mt-3 max-w-xl text-base text-white/90 sm:text-lg lg:mt-4">{brand(h.subheading)}</p>

          <p className="order-4 mt-3 text-xs font-bold tracking-[0.3em] sm:text-sm lg:mt-5">
            {h.categories.join(" | ")}
          </p>

          <div className="order-6 mt-5 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center lg:mt-7">
            <BookButton />
            <ButtonLink href="/find-an-agent" variant="secondaryOnDark">
              {h.secondary}
            </ButtonLink>
          </div>
        </div>

        {/* Right column on desktop: logo, then the ways to buy directly beneath it */}
        <div className="contents lg:flex lg:w-full lg:max-w-[520px] lg:flex-col lg:items-stretch lg:justify-self-end">
          <Image
            src="/brand/logo-full.png"
            alt="InstaTickets: Bus, Events, Sports. A Bullion Technologies product."
            width={1800}
            height={521}
            preload
            fetchPriority="high"
            sizes="(min-width: 1024px) 520px, 240px"
            className="ticket-edge order-7 mx-auto mt-6 h-auto w-[62vw] max-w-[240px] lg:order-none lg:mt-0 lg:w-full lg:max-w-[520px]"
          />

          <div className="order-5 mt-5 w-full max-w-md rounded-3xl bg-white/10 p-4 ring-1 ring-white/20 lg:order-none lg:mt-5 lg:max-w-none">
            <p className="text-xs font-bold tracking-[0.25em] text-white/90">{h.channelsHeading}</p>
            <ul className="mt-3 flex flex-wrap justify-center gap-3 lg:justify-start">
              {chips.map((c) => {
                const soon = facts.channels[c.key as keyof typeof facts.channels] === "soon";
                const external = c.href.startsWith("http");
                return (
                  <li key={c.key} className="relative">
                    <a
                      href={c.href}
                      aria-label={soon ? `${c.label}, ${h.soon}` : c.label}
                      title={c.label}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      className="block rounded-[1.1rem] transition-transform hover:-translate-y-0.5"
                    >
                      <ChannelIcon channel={c.key as ChannelKey} size={56} />
                    </a>
                    {soon && (
                      <span className="absolute -right-1 -top-2 rounded-full bg-red px-1.5 py-0.5 text-[0.6rem] font-extrabold tracking-wider text-white">
                        {h.soonShort}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <StoreBadges className="mt-3 justify-center lg:justify-start" />
          </div>
        </div>
      </div>
    </div>
  );
}
