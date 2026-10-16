import Link from "next/link";
import {
  Award,
  Bus,
  Car,
  ClipboardList,
  Dumbbell,
  Footprints,
  ListChecks,
  Megaphone,
  Globe,
  Hash,
  MapPin,
  MessageCircle,
  Smartphone,
  Store,
  Wallet,
  Music,
  PartyPopper,
  Plug,
  Presentation,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingCart,
  Swords,
  Theater,
  Ticket,
  Timer,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { appStoreUrl, bookingUrl, facts, partnerVisible, playStoreUrl, type PartnerKey } from "@content/facts";
import { home, nav } from "@content/site";
import { brand } from "../Brand";
import { partnerCopy } from "@content/partners";
import { PartnerLogo, PartnerRow } from "../PartnerLogo";
import { StoreBadges } from "../StoreBadges";
import { BookButton, ButtonLink, Heading, Perforation, Section } from "../ui";

const findIcons: Record<string, LucideIcon> = { bus: Bus, events: Ticket, sports: Trophy };
const findAccent: Record<string, string> = {
  bus: "border-navy",
  events: "border-red",
  sports: "border-navy",
};

export function FindSection() {
  const s = home.find;
  return (
    <Section id="tickets" tone="mist">
      <Heading className="text-center">{s.heading}</Heading>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {s.cards.map((c) => {
          const Icon = findIcons[c.key];
          return (
            <article
              key={c.key}
              className={`flex flex-col rounded-2xl border-t-4 bg-white p-6 shadow-md ${findAccent[c.key]}`}
            >
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-navy text-white">
                <Icon aria-hidden className="size-6" />
              </span>
              <Perforation className="my-5 text-line" />
              <h3 className="text-xl font-extrabold tracking-wide text-navy">{c.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{brand(c.body)}</p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}

export function BusSection() {
  const s = home.bus;
  return (
    <Section id="bus">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Heading>{s.heading}</Heading>
          <p className="mt-4 text-lg leading-relaxed text-muted">{brand(s.body)}</p>
          <div className="mt-6">
            <ButtonLink href={bookingUrl} variant="secondary">
              {s.button}
            </ButtonLink>
          </div>
          <p className="mt-6 text-muted">
            {brand(s.operators)}{" "}
            <Link href={nav.registerBusiness.href} className="font-bold text-navy underline">
              {s.operatorsLink}
            </Link>
          </p>
        </div>
        <div aria-hidden className="rounded-3xl bg-navy p-8 text-white shadow-xl">
          <Bus className="size-16" />
          <Perforation className="my-6 text-white/40" />
          <div className="flex items-center gap-3">
            <span className="size-3 rounded-full bg-red" />
            <span className="h-1 flex-1 rounded bg-white/30" />
            <span className="size-3 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </Section>
  );
}

const eventIcons: Record<string, LucideIcon> = {
  Concerts: Music,
  Festivals: PartyPopper,
  "Fun runs": Footprints,
  Conferences: Presentation,
  Shows: Theater,
  "Community events": Users,
};

export function EventsSection() {
  const s = home.events;
  return (
    <Section id="events" tone="mist">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {s.types.map((t) => {
              const Icon = eventIcons[t] ?? Ticket;
              return (
                <li
                  key={t}
                  className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3 text-center text-sm font-bold text-navy shadow-sm"
                >
                  <Icon aria-hidden className="size-7 text-red" />
                  {t}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="order-1 lg:order-2">
          <Heading>{s.heading}</Heading>
          <p className="mt-4 text-lg leading-relaxed text-muted">{brand(s.body)}</p>
          <p className="mt-4 leading-relaxed text-muted">{brand(s.organisers)}</p>
          <div className="mt-6">
            <ButtonLink href={nav.registerBusiness.href} variant="secondary">
              {s.button}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

const sportIcons: Record<string, LucideIcon> = {
  Football: Trophy,
  Rugby: Award,
  Cricket: Timer,
  Athletics: Footprints,
  Motorsport: Car,
  Basketball: Dumbbell,
  Tennis: Award,
  "Combat sports": Swords,
};

export function SportsSection() {
  const s = home.sports;
  return (
    <Section id="sports">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Heading>{s.heading}</Heading>
          <p className="mt-4 text-lg leading-relaxed text-muted">{brand(s.body)}</p>
          <p className="mt-4 leading-relaxed text-muted">{brand(s.organisations)}</p>
          <div className="mt-6">
            <ButtonLink href={nav.registerBusiness.href} variant="secondary">
              {s.button}
            </ButtonLink>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {s.types.map((t) => {
            const Icon = sportIcons[t] ?? Trophy;
            return (
              <li
                key={t}
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-navy p-3 text-center text-sm font-bold text-white shadow-sm"
              >
                <Icon aria-hidden className="size-7" />
                {t}
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}

const customerIcons: LucideIcon[] = [Search, ListChecks, ShoppingCart, QrCode];
const businessIcons: LucideIcon[] = [ClipboardList, ShieldCheck, Plug, Megaphone];

export function HowSection() {
  const s = home.how;
  return (
    <Section tone="mist">
      <Heading className="text-center">{s.heading}</Heading>

      <h3 className="mt-12 text-sm font-extrabold uppercase tracking-[0.25em] text-red">{s.customersHeading}</h3>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {s.customers.map((step, i) => {
          const Icon = customerIcons[i];
          return (
            <li key={step.title} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-navy text-white">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-sm font-bold text-muted">0{i + 1}</span>
              </div>
              <h4 className="mt-3 text-lg font-extrabold tracking-wide text-navy">{step.title}</h4>
              <p className="mt-1 text-muted">{brand(step.body)}</p>
            </li>
          );
        })}
      </ol>

      <h3 className="mt-12 text-sm font-extrabold uppercase tracking-[0.25em] text-red">{s.businessesHeading}</h3>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {s.businesses.map((title, i) => {
          const Icon = businessIcons[i];
          return (
            <li key={title} className="rounded-2xl bg-navy p-5 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-navy">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-sm font-bold text-white/80">0{i + 1}</span>
              </div>
              <h4 className="mt-3 text-lg font-extrabold tracking-wide">{title}</h4>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 max-w-3xl leading-relaxed text-muted">{brand(s.businessesNote)}</p>
    </Section>
  );
}

const channelIcons: Record<string, LucideIcon> = {
  ecocashApp: Wallet,
  app: Smartphone,
  web: Globe,
  whatsapp: MessageCircle,
  ussd: Hash,
  agents: Store,
};

type Channel = { key: string; partner?: string };

/** A channel shows unless it is switched off, or it needs a partner that has not approved the site. */
function visibleChannel(c: Channel): boolean {
  const status = facts.channels[c.key as keyof typeof facts.channels];
  if (status === "hidden") return false;
  return !c.partner || partnerVisible(c.partner as PartnerKey);
}

export function ChannelsSection() {
  const s = home.channels;
  const cards = s.cards.filter(visibleChannel);
  const showPayPartner = partnerVisible("ecocash");
  return (
    <Section id="how-to-buy">
      <div className="mx-auto max-w-3xl text-center">
        <Heading>{s.heading}</Heading>
        <p className="mt-4 text-lg leading-relaxed text-muted">{brand(s.body)}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = channelIcons[c.key];
          const soon = facts.channels[c.key as keyof typeof facts.channels] === "soon";
          return (
            <article key={c.key} className="relative flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-navy text-white">
                <Icon aria-hidden className="size-6" />
              </span>
              {soon && (
                <span className="absolute right-4 top-4 rounded-full bg-mist px-3 py-1 text-xs font-extrabold tracking-wider text-navy">
                  {s.soon}
                </span>
              )}
              <h3 className="mt-4 text-lg font-extrabold tracking-wide text-navy">{brand(c.title)}</h3>
              <p className="mt-2 leading-relaxed text-muted">{brand(c.body)}</p>
              {"partner" in c && c.partner === "ecocash" && (
                <div className="mt-4">
                  <PartnerLogo partner="ecocash" height={18} />
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-center text-sm text-muted">{brand(s.ticketNote)}</p>

      {(showPayPartner || appStoreUrl || playStoreUrl) && (
        <div className={`mt-10 grid gap-6 ${showPayPartner && (appStoreUrl || playStoreUrl) ? "md:grid-cols-2" : ""}`}>
          {showPayPartner && (
            <div className="flex flex-col items-start gap-4 rounded-2xl bg-mist p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-red">{s.payLabel}</p>
              <PartnerLogo partner="ecocash" height={34} />
              <div>
                <h3 className="text-lg font-extrabold text-navy">{s.payHeading}</h3>
                <p className="mt-1 leading-relaxed text-muted">{brand(s.payBody)}</p>
              </div>
            </div>
          )}
          {(appStoreUrl || playStoreUrl) && (
            <div className="flex flex-col items-start gap-4 rounded-2xl bg-mist p-6">
              <h3 className="text-lg font-extrabold text-navy">{s.storeHeading}</h3>
              <StoreBadges />
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

export function InPersonSection() {
  const s = home.inPerson;
  // Naming the outlets needs Econet and TN CyberTech Bank to have approved the site.
  const named = partnerVisible("econet") && partnerVisible("tn");
  return (
    <Section tone="mist">
      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <div className="flex flex-col rounded-3xl bg-white p-6 shadow-md sm:p-8">
          <Heading>{s.heading}</Heading>
          <p className="mt-4 text-lg leading-relaxed text-muted">{brand(s.body)}</p>
          <h3 className="mt-6 flex items-center gap-2 text-xl font-extrabold text-navy">
            <MapPin aria-hidden className="size-6 shrink-0 text-red" />
            {brand(s.findHeading)}
          </h3>
          <p className="mt-2 leading-relaxed text-muted">{brand(named ? s.findBody : s.findBodyGeneric)}</p>
          {named && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-bold text-navy">{partnerCopy.availableAt}</span>
              <PartnerRow keys={["econet", "tn"]} height={22} />
            </div>
          )}
          <div className="mt-6">
            <ButtonLink href="/find-an-agent" variant="primary">
              {s.findButton}
            </ButtonLink>
          </div>
        </div>
        <div className="on-navy flex flex-col rounded-3xl bg-navy p-6 text-white shadow-xl sm:p-8">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-white text-navy">
            <Store aria-hidden className="size-6" />
          </span>
          <h3 className="mt-4 text-xl font-extrabold tracking-wide">{brand(s.subHeading)}</h3>
          <p className="mt-2 leading-relaxed text-white/90">{brand(s.subBody)}</p>
          <div className="mt-6">
            <ButtonLink href="/agents" variant="primary">
              {s.button}
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

const differentIcons: Record<string, LucideIcon> = { one: Ticket, every: Globe, phone: Smartphone, providers: Plug };

export function DifferentSection() {
  const s = home.different;
  return (
    <Section>
      <Heading className="text-center">{s.heading}</Heading>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {s.cards.map((c) => {
          const Icon = differentIcons[c.key];
          return (
            <article key={c.key} className="rounded-2xl border-t-4 border-red bg-mist p-6">
              <span className="inline-flex size-12 items-center justify-center rounded-xl bg-navy text-white">
                <Icon aria-hidden className="size-6" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold tracking-wide text-navy">{brand(c.title)}</h3>
              <p className="mt-2 leading-relaxed text-muted">{brand(c.body)}</p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
export function LaunchSection() {
  const s = home.launch;
  return (
    <Section>
      <div className="mx-auto max-w-3xl text-center">
        <Heading>{s.heading}</Heading>
        <p className="mt-4 text-lg leading-relaxed text-muted">{brand(s.body)}</p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <BookButton />
          <ButtonLink href={nav.registerBusiness.href} variant="primary">
            {s.secondary}
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}

export function AboutSection() {
  const s = home.about;
  return (
    <Section tone="mist">
      <div className="mx-auto max-w-3xl">
        <Heading>{s.heading}</Heading>
        {s.body.map((p) => (
          <p key={p} className="mt-4 text-lg leading-relaxed text-muted">
            {brand(p)}
          </p>
        ))}
      </div>
    </Section>
  );
}
