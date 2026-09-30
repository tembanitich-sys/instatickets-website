import type { Metadata } from "next";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { Hero } from "@/components/home/Hero";
import { serverNowMs } from "@/lib/countdown";
import { getGetStartedUrl } from "@/lib/settings-server";
import {
  AboutSection,
  BusSection,
  EventsSection,
  FindSection,
  HowSection,
  LaunchSection,
  OffersSection,
  PreregisterSection,
  SportsSection,
} from "@/components/home/Sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Re-render at most once a minute so the server-rendered countdown and the
// GET STARTED link stay close to current without a redeploy.
export const revalidate = 60;

export default async function HomePage() {
  const getStartedUrl = await getGetStartedUrl();
  return (
    <>
      <OrganizationJsonLd />
      <Hero nowMs={serverNowMs()} getStartedUrl={getStartedUrl} />
      <FindSection />
      <BusSection />
      <EventsSection />
      <SportsSection />
      <HowSection />
      <PreregisterSection />
      <OffersSection />
      <LaunchSection />
      <AboutSection />
    </>
  );
}
