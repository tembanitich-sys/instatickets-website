import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { portal } from "@content/onboarding";
import { currentPartner } from "@/lib/partners/auth";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: { default: portal.name, template: `%s | ${portal.name}` },
  robots: { index: false, follow: false },
};

/** The partner portal: its own plain frame, no public-site navigation. */
export default async function PartnerLayout({ children }: LayoutProps<"/partner">) {
  const partner = await currentPartner();
  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/partner" className="flex items-center gap-3">
            <Image src="/brand/logo-plain.png" alt="InstaTickets" width={1028} height={224} sizes="130px" className="h-6 w-auto sm:h-7" />
            <span className="hidden text-sm font-bold uppercase tracking-widest text-muted sm:inline">Partner Portal</span>
          </Link>
          {partner && (
            <form action={signOutAction}>
              <button type="submit" className="min-h-11 text-sm font-semibold text-navy underline">
                {portal.dashboard.signOut}
              </button>
            </form>
          )}
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <footer className="border-t border-line bg-white py-4 text-center text-xs text-muted">
        InstaTickets, a Bullion Technologies product ·{" "}
        <Link href="/privacy" className="underline">
          Privacy Notice
        </Link>{" "}
        · accounts@instatickets.co.zw
      </footer>
    </div>
  );
}
