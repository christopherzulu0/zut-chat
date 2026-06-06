import { HeroSection } from "@/components/landing/hero-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CtaSection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <div className="landing-page min-h-full">
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <HowItWorks />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
