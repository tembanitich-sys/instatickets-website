import type { ReactNode } from "react";
import { ui } from "@content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { UtmCapture } from "@/components/UtmCapture";

/** The public site: header, footer and the floating WhatsApp button. The admin area does not use this. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded bg-white px-4 py-2 font-bold text-navy focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        {ui.skipToContent}
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppFloat />
      <UtmCapture />
    </>
  );
}
