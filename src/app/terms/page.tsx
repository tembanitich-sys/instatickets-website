import type { Metadata } from "next";
import { comingSoonPages } from "@content/site";
import { PageIntro, Section } from "@/components/ui";

export const metadata: Metadata = { title: comingSoonPages.terms.heading };

export default function TermsPage() {
  return (
    <>
      <PageIntro>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{comingSoonPages.terms.heading}</h1>
      </PageIntro>
      <Section>
        <p className="text-center text-3xl font-extrabold tracking-widest text-navy">
          {comingSoonPages.terms.label}
        </p>
      </Section>
    </>
  );
}
