import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ui } from "@content/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.instatickets.co.zw";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "InstaTickets | One Platform. Every Ticket.",
    template: "%s | InstaTickets",
  },
  description:
    "InstaTickets is a digital ticketing aggregation and distribution platform connecting customers with Bus, Events and Sports ticket inventory.",
  icons: { icon: "/brand/favicon.png", apple: "/brand/favicon.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="flex min-h-screen flex-col antialiased">
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
      </body>
    </html>
  );
}
