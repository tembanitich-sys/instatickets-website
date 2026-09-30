import type { Metadata } from "next";
import type { ReactNode } from "react";

// Admin pages depend on the visitor's cookie and the server's environment, so they must
// never be prerendered at build time.
export const dynamic = "force-dynamic";

// Not linked from the public site and kept out of search engines.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex-1 bg-mist text-ink">{children}</div>;
}
