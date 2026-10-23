import type { Metadata } from "next";
import { MapPin, Network, Store, Wrench } from "lucide-react";
import { operators as t } from "@content/site";
import { brand } from "@/components/Brand";
import { OperatorForm } from "@/components/forms/OperatorForm";
import { ButtonLink, Heading, PageIntro, Section } from "@/components/ui";

// Served at operators.instatickets.co.zw (src/proxy.ts rewrites its home page here) and at
// /operators on the main site. The subdomain is the canonical address.
export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
  alternates: { canonical: t.url },
  openGraph: { url: t.url, title: `${t.meta.title} | InstaTickets`, description: t.meta.description },
};

const icons = { reach: Network, storefront: Store, agents: MapPin, system: Wrench } as const;

export default function OperatorsPage() {
  return (
    <>
      <PageIntro>
        <p className="text-sm font-bold tracking-widest text-white/80">{t.hero.eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
          {brand(t.hero.headline)}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">{brand(t.hero.body)}</p>
        <div className="mt-8">
          <ButtonLink href="#register" variant="primary">
            {t.hero.button}
          </ButtonLink>
        </div>
      </PageIntro>

      <Section tone="mist">
        <Heading className="text-center">{t.why.heading}</Heading>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.why.cards.map((c) => {
            const Icon = icons[c.key];
            return (
              <article key={c.key} className="rounded-2xl border-t-4 border-navy bg-white p-6 shadow-md">
                <span className="inline-flex size-12 items-center justify-center rounded-xl bg-navy text-white">
                  <Icon aria-hidden className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold tracking-wide text-navy">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{brand(c.body)}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section>
        <Heading>{t.how.heading}</Heading>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.how.steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl bg-mist p-4">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-extrabold tracking-wide text-navy">{s.title}</h3>
                <p className="mt-1 text-muted">{brand(s.body)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-3xl leading-relaxed text-muted">{brand(t.note)}</p>
      </Section>

      <Section id="register" tone="mist">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-start">
          <div>
            <Heading>{t.form.heading}</Heading>
            <p className="mt-4 text-lg leading-relaxed text-muted">{brand(t.form.intro)}</p>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
            <OperatorForm />
          </div>
        </div>
      </Section>
    </>
  );
}
