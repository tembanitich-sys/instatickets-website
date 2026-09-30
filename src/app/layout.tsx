import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site-url";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s | InstaTickets" },
  description: SITE_DESCRIPTION,
  // Icons, the social image, robots.txt, the sitemap and the manifest come from the
  // files next to this one (icon.png, apple-icon.png, opengraph-image.png, robots.ts ...).
  openGraph: { type: "website", siteName: "InstaTickets", title: SITE_TITLE, description: SITE_DESCRIPTION, locale: "en_ZW" },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
