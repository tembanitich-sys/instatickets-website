import type { Metadata } from "next";
import Link from "next/link";
import { notFoundPage as t } from "@content/site";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageIntro, Section, buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: t.heading, robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        <PageIntro>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t.heading}</h1>
        </PageIntro>
        <Section>
          <p className="max-w-xl text-lg text-muted">{t.body}</p>
          <div className="mt-6">
            <Link href="/" className={buttonClass("primary")}>
              {t.link}
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
