import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { bookingUrl, isReviewBuild } from "@content/facts";
import { home, bookDemo as t } from "@content/site";
import { ChannelDemos } from "@/components/ChannelDemos";
import { ChannelIcon, channelVisible, type ChannelKey } from "@/components/ChannelIcon";
import { PageIntro, Section } from "@/components/ui";
import type { PartnerKey } from "@content/facts";

export const metadata: Metadata = {
  title: "Book",
  robots: { index: false, follow: false },
  alternates: { canonical: "/book" },
};

/**
 * Demo of the online booking journey, for review builds only. Production never shows it: it
 * sends visitors to the real booking address, or to "How to buy" until that exists.
 */
export default function BookPage() {
  if (!isReviewBuild) redirect(bookingUrl.startsWith("/book") ? "/#how-to-buy" : bookingUrl);

  const channels = (
    <ul className="flex flex-wrap gap-3">
      {home.channels.cards
        .filter((c) => c.key !== "web")
        .filter((c) => channelVisible(c.key as ChannelKey, "partner" in c ? (c.partner as PartnerKey) : undefined))
        .map((c) => (
          <li key={c.key} title={c.title}>
            <ChannelIcon channel={c.key as ChannelKey} size={56} />
          </li>
        ))}
    </ul>
  );

  return (
    <>
      <PageIntro>
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">{t.headline}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">{t.intro}</p>
      </PageIntro>
      <Section>
        <p role="note" className="mb-6 rounded-xl border-2 border-red bg-red-50 px-4 py-3 text-sm font-bold text-red-dark">
          {t.banner}
        </p>
        <ChannelDemos channels={channels} />
      </Section>
    </>
  );
}
