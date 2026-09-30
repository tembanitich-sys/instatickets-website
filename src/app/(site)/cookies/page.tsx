import type { Metadata } from "next";
import { comingSoonPages } from "@content/site";
import { PageIntro, Section } from "@/components/ui";

export const metadata: Metadata = { title: comingSoonPages.cookies.heading, alternates: { canonical: "/cookies" } };

export default function CookiesPage() {
  return (
    <>
      <PageIntro>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{comingSoonPages.cookies.heading}</h1>
      </PageIntro>
      <Section>
        <p className="text-center text-3xl font-extrabold tracking-widest text-navy">
          {comingSoonPages.cookies.label}
        </p>
      </Section>
    </>
  );
}
