import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { GrowthSection } from "./GrowthSection";
import { AutomateBanner } from "./AutomateBanner";
import { FeatureShowcase } from "./FeatureShowcase";
import { StatsSection } from "./StatsSection";
import { RunsItselfSection } from "./RunsItselfSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { FaqSection } from "./FaqSection";
import { ClosingSection } from "./ClosingSection";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f4ec] pb-px">
      <div className="pt-4">
        <LandingNav />
      </div>
      <HeroSection />
      <GrowthSection />
      <AutomateBanner />
      <FeatureShowcase />
      <StatsSection />
      <RunsItselfSection />
      <TestimonialsSection />
      <FaqSection />
      <ClosingSection />
      <LandingFooter />
    </div>
  );
}
