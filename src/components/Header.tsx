import Image from "next/image";
import Link from "next/link";
import { nav } from "@content/site";
import { buttonClass } from "./ui";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="InstaTickets home" className="flex shrink-0 items-center">
          <Image
            src="/brand/logo-compact.png"
            alt="InstaTickets"
            width={1028}
            height={195}
            priority
            className="h-6 w-auto sm:h-8"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {nav.links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-navy hover:bg-mist"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={nav.join.href}
            className={buttonClass("primary", "!px-3 !py-2 text-xs sm:!px-6 sm:!py-3 sm:text-sm")}
          >
            {nav.join.label}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
