import type { Metadata } from "next";
import { facts } from "@content/facts";
import { terms } from "@content/terms";
import { withBrackets } from "@/components/Bracketed";
import { brand } from "@/components/Brand";
import { PageIntro, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Terms & Conditions", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <>
      <PageIntro>
        <h1 className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">{brand(terms.title)}</h1>
        <p className="mt-4 text-white/90">{withBrackets(terms.meta)}</p>
      </PageIntro>
      <Section>
        <article className="mx-auto max-w-3xl">
          {!facts.termsFinal && (
            <p
              role="note"
              className="mb-8 rounded-xl border-2 border-red bg-red-50 px-4 py-3 font-bold text-red-dark"
            >
              DRAFT FOR LEGAL REVIEW. THESE TERMS ARE NOT YET IN FORCE.
            </p>
          )}
          <p className="text-lg leading-relaxed">{withBrackets(terms.lead)}</p>
          {terms.blocks.map((b, i) => {
            switch (b.type) {
              case "h2":
                return (
                  <h2 key={i} className="mt-10 text-2xl font-extrabold text-navy">
                    {b.text}
                  </h2>
                );
              case "p":
                return (
                  <p key={i} className="mt-3 leading-relaxed text-ink">
                    {withBrackets(b.text)}
                  </p>
                );
              case "ul":
                return (
                  <ul key={i} className="mt-3 list-disc space-y-1 pl-6 leading-relaxed">
                    {b.items.map((it) => (
                      <li key={it}>{withBrackets(it)}</li>
                    ))}
                  </ul>
                );
              case "table":
                return (
                  <div key={i} className="mt-4 overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                      <thead className="bg-mist text-navy">
                        <tr>
                          {b.head.map((h) => (
                            <th key={h} scope="col" className="px-3 py-2 font-extrabold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {b.rows.map((r, ri) => (
                          <tr key={ri} className="border-t border-line align-top">
                            {r.map((c, ci) => (
                              <td key={ci} className="px-3 py-2 leading-relaxed">
                                {withBrackets(c)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
            }
          })}
        </article>
      </Section>
    </>
  );
}
