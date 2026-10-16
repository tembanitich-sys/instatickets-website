import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { bookingUrl, facts, type PartnerKey } from "@content/facts";
import { contact, howToBuy as t } from "@content/site";
import { brand } from "@/components/Brand";
import { ChannelIcon, channelVisible, type ChannelKey } from "@/components/ChannelIcon";
import { StoreBadges } from "@/components/StoreBadges";
import { ButtonLink, PageIntro, Section, WhatsAppButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "How to Buy",
  description: t.intro,
  alternates: { canonical: "/how-to-buy" },
};

type Guide = (typeof t.guides)[number];

/** The control that shows where to start for each channel. */
function StartHere({ guide }: { guide: Guide }) {
  switch (guide.action) {
    case "book":
      return (
        <ButtonLink href={bookingUrl} variant="primary">
          {t.bookLabel}
        </ButtonLink>
      );
    case "stores":
      return <StoreBadges />;
    case "whatsapp":
      return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-navy">{t.whatsappSave}</p>
            <p className="text-2xl font-extrabold tracking-wide text-ink">{contact.whatsapp.display}</p>
          </div>
          <a
            href={`${contact.whatsapp.href}?text=${encodeURIComponent(t.whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-whatsapp px-6 py-3 text-sm font-bold tracking-wide text-white hover:opacity-90"
          >
            {t.whatsappStart}
          </a>
        </div>
      );
    case "dial":
      return (
        <a
          href={`tel:${t.dialCode.replace("#", encodeURIComponent("#"))}`}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-bold tracking-wide text-white hover:opacity-90"
        >
          {t.dialLabel}
        </a>
      );
    case "find":
      return (
        <ButtonLink href="/find-an-agent" variant="secondary">
          {t.findLabel}
        </ButtonLink>
      );
    default:
      return null;
  }
}

export default function HowToBuyPage() {
  const guides = t.guides.filter((g) =>
    channelVisible(g.channel as ChannelKey, "partner" in g ? (g.partner as PartnerKey) : undefined),
  );
  return (
    <>
      <PageIntro>
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">{t.headline}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">{brand(t.intro)}</p>
        <nav aria-label={t.jump} className="mt-6">
          <ul className="flex flex-wrap gap-3">
            {guides.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  title={g.title}
                  aria-label={g.title}
                  className="block rounded-[1.1rem] transition-transform hover:-translate-y-0.5"
                >
                  <ChannelIcon channel={g.channel as ChannelKey} size={52} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageIntro>

      <Section>
        <div className="mx-auto grid max-w-4xl gap-8">
          {guides.map((g) => {
            const soon = facts.channels[g.channel as keyof typeof facts.channels] === "soon";
            return (
              <article key={g.id} id={g.id} className="scroll-mt-24 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-4">
                  <ChannelIcon channel={g.channel as ChannelKey} size={64} />
                  <div>
                    <h2 className="text-2xl font-extrabold text-navy">{brand(g.title)}</h2>
                    {soon && (
                      <span className="mt-1 inline-block rounded-full bg-mist px-3 py-1 text-xs font-extrabold tracking-wider text-navy">
                        {t.soon}
                      </span>
                    )}
                  </div>
                </div>

                {g.path.length > 0 && (
                  <ol aria-label={t.startHere} className="mt-6 flex flex-wrap items-center gap-2">
                    {g.path.map((p, i) => (
                      <li key={p} className="flex items-center gap-2">
                        <span className="rounded-full bg-navy px-4 py-2 text-sm font-bold text-white on-navy">{brand(p)}</span>
                        {i < g.path.length - 1 && <ChevronRight aria-hidden className="size-4 text-muted" />}
                      </li>
                    ))}
                  </ol>
                )}

                <div className="mt-6">
                  <p className="mb-3 text-xs font-extrabold tracking-[0.25em] text-red">{t.startHere}</p>
                  <StartHere guide={g} />
                </div>

                <ol className="mt-6 grid gap-3">
                  {g.steps.map((s, i) => (
                    <li key={s} className="flex gap-4 rounded-2xl bg-mist p-4">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="self-center leading-relaxed text-ink">{brand(s)}</p>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <p className="leading-relaxed text-muted">{brand(t.footer)}</p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <WhatsAppButton />
            <p className="text-muted">{t.help}</p>
          </div>
          <p className="mt-6 text-sm text-muted">
            <Link href="/find-an-agent" className="font-bold text-navy underline">
              {t.findLabel}
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
