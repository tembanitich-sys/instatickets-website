import type { Metadata } from "next";
import Link from "next/link";
import { isReviewBuild, partnerVisible } from "@content/facts";
import { outlets } from "@content/locations";
import { findAgent as t } from "@content/site";
import { AgentLocator } from "@/components/AgentLocator";
import { brand } from "@/components/Brand";
import { PageIntro, Section, WhatsAppButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Find an Agent",
  description: t.intro,
  alternates: { canonical: "/find-an-agent" },
};

export default function FindAnAgentPage() {
  // Outlet types are named only once the partner has approved the site; unconfirmed outlets
  // appear only in review builds.
  const kinds = [
    ...(partnerVisible("econet") ? [{ value: "econet_shop" as const, label: t.kinds.econet_shop }] : []),
    ...(partnerVisible("tn") ? [{ value: "tn_agent" as const, label: t.kinds.tn_agent }] : []),
  ];
  const allowed = new Set(kinds.map((k) => k.value));
  const list = outlets.filter((o) => allowed.has(o.kind) && (isReviewBuild || o.confirmed));
  const named = kinds.length > 0;

  return (
    <>
      <PageIntro>
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
          {brand(t.headline)}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">{brand(named ? t.introNamed : t.intro)}</p>
      </PageIntro>

      <Section>
        {isReviewBuild && (
          <p role="note" className="mb-6 rounded-xl border-2 border-red bg-red-50 px-4 py-3 text-sm font-bold text-red-dark">
            {t.reviewNote}
          </p>
        )}
        <AgentLocator outlets={list} kinds={kinds} />
        <p className="mt-8 max-w-2xl text-sm text-muted">{t.checkFirst}</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <WhatsAppButton />
          <p className="text-muted">
            {t.becomeAgent}{" "}
            <Link href="/agents" className="font-bold text-navy underline">
              {t.becomeAgentLink}
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
