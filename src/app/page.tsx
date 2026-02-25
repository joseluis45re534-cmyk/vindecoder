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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://vindecoder-391.pages.dev/#website",
      url: "https://vindecoder-391.pages.dev",
      name: "VINDecoderAU",
      description: "Australia's most trusted VIN check and vehicle history report service.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://vindecoder-391.pages.dev/vin-check?vin={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://vindecoder-391.pages.dev/#organization",
      name: "VINDecoderAU",
      url: "https://vindecoder-391.pages.dev",
      logo: {
        "@type": "ImageObject",
        url: "https://vindecoder-391.pages.dev/og-image.png",
      },
      sameAs: [],
    },
    {
      "@type": "Product",
      name: "VIN History Report",
      description: "Comprehensive Australian vehicle history report including PPSR, stolen status, write-off, finance, and registration checks.",
      brand: { "@type": "Brand", name: "VINDecoderAU" },
      offers: {
        "@type": "Offer",
        priceCurrency: "AUD",
        price: "29.99",
        availability: "https://schema.org/InStock",
        url: "https://vindecoder-391.pages.dev/vin-check",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
