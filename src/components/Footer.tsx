import Image from "next/image";
import Link from "next/link";
import { contact, footer } from "@content/site";

export function Footer() {
  return (
    <footer className="on-navy bg-navy text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Image
              src="/brand/logo-compact.png"
              alt="InstaTickets"
              width={1028}
              height={298}
              sizes="160px"
              className="h-12 w-auto"
            />
            <p className="mt-5 text-lg font-extrabold tracking-tight">{footer.tagline}</p>
            <p className="mt-1 text-sm font-semibold text-white/80">{footer.launching}</p>
            <a
              href={contact.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline hover:text-white"
            >
              {footer.whatsappLink}
            </a>
          </div>

          {footer.groups.map((g) => (
            <nav key={g.heading} aria-label={g.heading}>
              <h2 className="text-sm font-extrabold tracking-widest text-gold">{g.heading}</h2>
              <ul className="mt-2">
                {g.links.map((l) => (
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
          ))}
        </div>

        <div className="mt-12 border-t border-white/20 pt-8">
          {/* Bullion logos sit on white only (brief Section 5). */}
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/30 p-5 sm:flex-row sm:items-center">
            <span className="rounded-lg bg-white p-2">
              <Image
                src="/brand/bullion-compact.png"
                alt="Bullion Technologies"
                width={771}
                height={325}
                sizes="96px"
                className="h-12 w-auto"
              />
            </span>
            <div>
              <p className="text-sm font-extrabold tracking-wider text-gold">{footer.bullionLine}</p>
              <p className="mt-1 text-sm text-white/90">{footer.bullionText}</p>
            </div>
          </div>

          <address className="mt-8 not-italic text-sm text-white/90">
            <ul className="flex flex-wrap gap-x-6">
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
            </ul>
            <p className="mt-1 leading-relaxed">{contact.address.line}</p>
          </address>
          <p className="mt-4 text-sm text-white/80">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
