import type { Metadata } from "next";
import type { ReactNode } from "react";
import { privacy, ui } from "@content/site";
import { PageIntro, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Pre-Launch Privacy Notice", alternates: { canonical: "/privacy" } };

/** Renders unconfirmed [BRACKETED] values highlighted so they cannot be missed. */
function withBrackets(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    /^\[[^\]]+\]$/.test(part) ? (
      <mark key={i} className="rounded bg-yellow-200 px-1 font-bold text-ink">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageIntro>
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">{privacy.title}</h1>
        <p className="mt-4 text-white/90">{ui.effectiveDate} {withBrackets(privacy.effectiveDate)}</p>
      </PageIntro>
      <Section>
        <article className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed">{privacy.intro}</p>
          {privacy.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="text-2xl font-extrabold text-navy">{s.heading}</h2>
              {"paragraphs" in s &&
                s.paragraphs.map((p) => (
                  <p key={p} className="mt-3 leading-relaxed text-ink">
                    {withBrackets(p)}
                  </p>
                ))}
              {"bullets" in s && (
                <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </Section>
    </>
  );
}
