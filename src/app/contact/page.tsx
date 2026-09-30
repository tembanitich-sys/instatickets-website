import type { Metadata } from "next";
import Link from "next/link";
import { contact, contactPage as t } from "@content/site";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageIntro, Section, WhatsAppButton } from "@/components/ui";

export const metadata: Metadata = { title: "Contact" };

const link = "inline-flex min-h-11 items-center font-semibold text-navy underline";

export default function ContactPage() {
  return (
    <>
      <PageIntro>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{t.headline}</h1>
      </PageIntro>
      <Section>
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <dl className="space-y-6">
              <div>
                <dt className="text-sm font-extrabold uppercase tracking-widest text-red">{t.labels.email}</dt>
                <dd>
                  <a className={link} href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-extrabold uppercase tracking-widest text-red">{t.labels.mobile}</dt>
                <dd className="flex flex-wrap gap-x-4">
                  {contact.mobiles.map((m) => (
                    <a key={m.tel} className={link} href={`tel:${m.tel}`}>
                      {m.display}
                    </a>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-extrabold uppercase tracking-widest text-red">{t.labels.telephone}</dt>
                <dd className="flex flex-wrap gap-x-4">
                  {contact.telephones.map((m) => (
                    <a key={m.tel} className={link} href={`tel:${m.tel}`}>
                      {m.display}
                    </a>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-extrabold uppercase tracking-widest text-red">{t.labels.headOffice}</dt>
                <dd className="mt-1 text-muted">{contact.address.line}</dd>
              </div>
            </dl>
            <WhatsAppButton />
            <p className="text-muted">
              <Link href="/for-businesses#register" className="font-semibold text-navy underline">
                {t.businessNote}
              </Link>
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
            <ContactForm />
          </div>
        </div>
      </Section>
    </>
  );
}
