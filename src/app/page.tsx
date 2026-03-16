import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { AboutSection } from '@/components/landing/AboutSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D0F12] font-sans overflow-x-hidden selection:bg-blue-500/30">
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <AboutSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
