import { Hero } from "@/components/home/Hero";
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

export default function HomePage() {
  return (
    <>
      <Hero />
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
