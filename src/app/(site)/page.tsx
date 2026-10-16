import type { Metadata } from "next";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { Hero } from "@/components/home/Hero";
import {
  AboutSection,
  ChannelsSection,
  DifferentSection,
  BusSection,
  EventsSection,
  FindSection,
  HowSection,
  InPersonSection,
  LaunchSection,
  SportsSection,
} from "@/components/home/Sections";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <FindSection />
      <ChannelsSection />
      <BusSection />
      <EventsSection />
      <SportsSection />
      <HowSection />
      <InPersonSection />
      <DifferentSection />
      <LaunchSection />
      <AboutSection />
    </>
  );
}
