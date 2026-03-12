import HeroSection from "@/components/layout/hero-section";
import FeaturesSection from "@/components/layout/features";
import StatsSection from "@/components/layout/CtaSection";
import Footer from "@/components/layout/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Features */}
      <FeaturesSection />

      {/* CTA */}
      <StatsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
