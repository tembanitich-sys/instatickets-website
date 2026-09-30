import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { contact, nav } from "@content/site";

type Variant = "primary" | "secondary" | "secondaryOnDark";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-center text-sm font-bold tracking-wide transition-colors";

const variants: Record<Variant, string> = {
  primary: "bg-red text-white shadow-sm hover:bg-red-dark",
  secondary: "border-2 border-navy bg-white text-navy hover:bg-navy hover:text-white",
  secondaryOnDark: "border-2 border-white bg-transparent text-white hover:bg-white hover:text-navy",
};

export function buttonClass(variant: Variant = "secondary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

export function ButtonLink({
  variant = "secondary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={buttonClass(variant, className)} />;
}

/** In-page WhatsApp button. The wa.me address is never displayed. */
export function WhatsAppButton({
  variant = "secondary",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <a
      href={contact.whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass(variant, className)}
    >
      <MessageCircle aria-hidden className="size-5" />
      {nav.whatsappButton}
    </a>
  );
}

export function Section({
  id,
  tone = "white",
  className = "",
  children,
}: {
  id?: string;
  tone?: "white" | "mist" | "navy";
  className?: string;
  children: ReactNode;
}) {
  const tones = {
    white: "bg-white text-ink",
    mist: "bg-mist text-ink",
    navy: "on-navy bg-navy text-white",
  } as const;
  return (
    <section id={id} className={`scroll-mt-20 ${tones[tone]} ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">{children}</div>
    </section>
  );
}

export function Heading({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag className={`text-balance text-3xl font-extrabold tracking-tight sm:text-4xl ${className}`}>
      {children}
    </Tag>
  );
}

export function PageIntro({ children }: { children: ReactNode }) {
  return (
    <div className="hero-bg on-navy text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">{children}</div>
    </div>
  );
}

export function Perforation({ className = "text-line" }: { className?: string }) {
  return <div aria-hidden className={`perforation w-full ${className}`} />;
}
