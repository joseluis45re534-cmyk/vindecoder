import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ReportPreviewSection } from "@/components/landing/ReportPreviewSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { ScrollProgress } from "@/components/ui/effects/ScrollProgress";
import { PageReveal } from "@/components/ui/effects/PageReveal";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <ScrollProgress />
      <Header />

      <PageReveal>
        <main className="flex-1">
          <HeroSection />
          <HowItWorksSection />
          <ReportPreviewSection />
          <PricingSection />
          <FaqSection />
          <CtaSection />
        </main>
      </PageReveal>

      <Footer />
    </div>
  );
}
