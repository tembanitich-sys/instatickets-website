import type { Metadata } from "next";
import { Check, Coins, GraduationCap, Layers, Store } from "lucide-react";
import { agents as t } from "@content/site";
import { brand } from "@/components/Brand";
import { AgentForm } from "@/components/forms/AgentForm";
import { ButtonLink, Heading, PageIntro, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Become an Agent",
  description: t.hero.subheadline,
  alternates: { canonical: "/agents" },
};

const icons = { commission: Coins, customers: Store, platform: Layers, support: GraduationCap } as const;

export default function AgentsPage() {
  return (
    <>
      <PageIntro>
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
          {brand(t.hero.headline)}
        </h1>
        <p className="mt-3 text-xl font-bold text-white/95">{brand(t.hero.subheadline)}</p>
        <p className="mt-4 max-w-2xl text-lg text-white/90">{brand(t.hero.body)}</p>
        <div className="mt-8">
          <ButtonLink href="#apply" variant="primary">
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
                <p className="mt-2 leading-relaxed text-muted">{c.body}</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Heading>{t.who.heading}</Heading>
            <ul className="mt-6 space-y-3">
              {t.who.items.map((i) => (
                <li key={i} className="flex items-start gap-3 text-lg">
                  <Check aria-hidden className="mt-1 size-5 shrink-0 text-red" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Heading>{t.how.heading}</Heading>
            <ol className="mt-6 space-y-4">
              {t.how.steps.map((s, i) => (
                <li key={s.title} className="flex gap-4 rounded-2xl bg-mist p-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-extrabold tracking-wide text-navy">{s.title}</h3>
                    <p className="mt-1 text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <p className="mt-10 max-w-3xl leading-relaxed text-muted">{brand(t.note)}</p>
      </Section>

      <Section id="apply" tone="mist">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <Heading>{t.form.heading}</Heading>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
            <AgentForm />
          </div>
        </div>
      </Section>
    </>
  );
}
