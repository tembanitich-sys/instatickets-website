import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { contact, help } from "@content/site";
import { PageIntro, Section, WhatsAppButton } from "@/components/ui";

export const metadata: Metadata = { title: "Help" };

const linkClass = "font-bold text-navy underline";

/** Turns the WhatsApp and contact-form phrases in the last answer into links. */
function withHelpLinks(answer: string): ReactNode[] {
  const { whatsapp, contact: contactPhrase } = help.helpLinks;
  return answer.split(new RegExp(`(${whatsapp}|${contactPhrase})`)).map((part, i) => {
    if (part === whatsapp) {
      return (
        <a key={i} href={contact.whatsapp.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {part}
        </a>
      );
    }
    if (part === contactPhrase) {
      return (
        <Link key={i} href="/contact" className={linkClass}>
          {part}
        </Link>
      );
    }
    return part;
  });
}

export default function HelpPage() {
  const last = help.faq.length - 1;
  return (
    <>
      <PageIntro>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{help.heading}</h1>
      </PageIntro>
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="divide-y divide-line rounded-2xl border border-line bg-white shadow-sm">
            {help.faq.map((item, i) => (
              <details key={item.q} className="group p-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold text-navy">
                  {item.q}
                  <ChevronDown aria-hidden className="size-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 leading-relaxed text-muted">
                  {i === last ? withHelpLinks(item.a) : item.a}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-8">
            <WhatsAppButton />
          </div>
        </div>
      </Section>
    </>
  );
}
