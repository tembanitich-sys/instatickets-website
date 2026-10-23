import Link from "next/link";
import type { Metadata } from "next";
import { QrCode, Scale, Store } from "lucide-react";
import { partnerVisible, type PartnerKey } from "@content/facts";
import { forBusinesses as t, home } from "@content/site";
import { brand } from "@/components/Brand";
import { ChannelIcon, channelVisible, type ChannelKey } from "@/components/ChannelIcon";
import { BusinessForm } from "@/components/forms/BusinessForm";
import { ButtonLink, Heading, PageIntro, Section } from "@/components/ui";

export const metadata: Metadata = { title: "For Businesses", alternates: { canonical: "/for-businesses" } };

export default function ForBusinessesPage() {
  return (
    <>
      <PageIntro>
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
          {brand(t.hero.headline)}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">{brand(t.hero.body)}</p>
        <p className="mt-6 text-sm font-bold tracking-widest text-white/80">{t.hero.forLabel}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {t.hero.audiences.map((a) => (
            <li key={a} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              {a}
            </li>
          ))}
        </ul>
      </PageIntro>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Heading>{brand(t.storefront.heading)}</Heading>
        </div>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {t.storefront.items.map((item, i) => {
            const Icon = [Store, QrCode, Scale][i];
            return (
              <li key={item.title} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <Icon aria-hidden className="size-8 text-red" />
                <h3 className="mt-4 text-lg font-extrabold tracking-wide text-navy">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{brand(item.body)}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 text-center">
          <ButtonLink href="#register" variant="primary">
            {t.storefront.button}
          </ButtonLink>
        </div>
      </Section>

      <Section tone="mist">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <Heading>{t.existing.heading}</Heading>
            <p className="mt-4 text-lg leading-relaxed text-muted">{brand(t.existing.body)}</p>
          </div>
          <div className="flex flex-col gap-3">
            <ButtonLink href="#register" variant="secondary">
              {t.existing.partnerButton}
            </ButtonLink>
            <ButtonLink href="#register" variant="secondary">
              {t.existing.integrationButton}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <Heading>{t.channels.heading}</Heading>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {brand(t.channels.body)}
            {partnerVisible("ecocash") && <> {brand(t.channels.partnerBody)}</>}
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-3" aria-label={t.channels.heading}>
            {home.channels.cards
              .filter((c) => channelVisible(c.key as ChannelKey, "partner" in c ? (c.partner as PartnerKey) : undefined))
              .map((c) => (
                <li key={c.key} title={c.title}>
                  <ChannelIcon channel={c.key as ChannelKey} size={56} />
                </li>
              ))}
          </ul>
          <div className="mt-8">
            <ButtonLink href="#register" variant="secondary">
              {t.channels.button}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section id="register" tone="mist">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <Heading>{t.form.heading}</Heading>
            <p className="mt-4 text-lg leading-relaxed text-muted">{brand(t.form.intro)}</p>
            <p className="mt-4 text-lg leading-relaxed text-ink">
              {t.form.operatorNote}{" "}
              <Link href="/operators" className="font-bold text-navy underline">
                {t.form.operatorLink}
              </Link>
              .
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
            <BusinessForm />
          </div>
        </div>
      </Section>

      <Section id="build" tone="navy">
        <div className="mx-auto max-w-3xl text-center">
          <Heading>{t.build.heading}</Heading>
          <p className="mt-4 text-lg leading-relaxed text-white/90">{brand(t.build.body)}</p>
          <div className="mt-8">
            <ButtonLink href="#register" variant="primary">
              {t.build.button}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
