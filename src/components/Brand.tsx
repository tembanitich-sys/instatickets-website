import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The name "InstaTickets" is a brand mark, so on the page it is always the logo and never
 * plain text. `brand(text)` swaps every visible occurrence in a copy string for the inline
 * logo (any capitalisation, so "JOIN INSTATICKETS" works too). E-mail addresses and the
 * domain name are left alone. Text that cannot hold an image (page titles, alt text,
 * e-mails, the admin) stays plain.
 *
 * Two images are rendered and CSS shows the right one: coloured on light backgrounds,
 * white on navy or red (`.on-navy`; see globals.css).
 */
const NAME = /(?<![@\w./-])(InstaTickets)(?![\w@-]|\.co)/gi;

export function BrandLogo() {
  return (
    <span className="brand-inline">
      <Image src="/brand/logo-plain.png" alt="InstaTickets" width={1028} height={224} sizes="160px" className="brand-logo brand-color" />
      <Image src="/brand/logo-plain-white.png" alt="InstaTickets" width={1028} height={224} sizes="160px" className="brand-logo brand-white" />
    </span>
  );
}

export function brand(text: string): ReactNode[] {
  const parts = text.split(NAME);
  return parts.map((part, i) => (i % 2 === 1 ? <BrandLogo key={i} /> : part));
}

/** Component form of `brand()`, for use as `<B>{copy.text}</B>`. */
export function B({ children }: { children: string }) {
  return <>{brand(children)}</>;
}
