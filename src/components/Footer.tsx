import Image from "next/image";
import Link from "next/link";
import { contact, footer } from "@content/site";

export function Footer() {
  return (
    <footer className="on-navy bg-navy text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Image
              src="/brand/logo-full.png"
              alt="InstaTickets: Bus, Events, Sports. A Bullion Technologies company."
              width={1800}
              height={540}
              className="h-auto w-72 max-w-full"
            />
            <p className="mt-6 text-lg font-extrabold tracking-tight">{footer.tagline}</p>
            <p className="mt-1 text-sm font-semibold tracking-widest text-white/80">
              {footer.categories.join(" | ")}
            </p>

            {/* Bullion logos sit on white only (brief Section 5). */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-white p-2">
                <Image
                  src="/brand/bullion-compact.png"
                  alt="Bullion Technologies"
                  width={771}
                  height={325}
                  className="h-10 w-auto"
                />
              </span>
              <span className="text-sm font-bold tracking-wider text-gold">{footer.bullionLine}</span>
            </div>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-6">
              {footer.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="flex min-h-11 items-center text-sm font-semibold text-white/90 hover:text-white hover:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic text-sm text-white/90">
            <ul className="space-y-1">
              <li>
                <a className="inline-flex min-h-11 items-center hover:underline" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  className="inline-flex min-h-11 items-center hover:underline"
                  href={contact.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp {contact.whatsapp.display}
                </a>
              </li>
              {contact.mobiles.map((m) => (
                <li key={m.tel}>
                  <a className="inline-flex min-h-11 items-center hover:underline" href={`tel:${m.tel}`}>
                    {m.display}
                  </a>
                </li>
              ))}
              <li className="pt-2 leading-relaxed">{contact.address.line}</li>
            </ul>
          </address>
        </div>

        <div className="mt-12 border-t border-white/20 pt-6">
          <ul className="flex flex-wrap gap-x-6">
            {footer.legal.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-sm text-white/90 hover:underline">
                  {l.label}
                  {l.comingSoon && (
                    <span className="ml-2 rounded bg-white/15 px-2 py-0.5 text-xs font-bold tracking-wider">
                      {footer.comingSoon}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-white/80">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
