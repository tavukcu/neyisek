import HeroSection from "@/components/home/HeroSection";
import PromoBanner from "@/components/home/PromoBanner";
import CategoriesSection from "@/components/home/CategoriesSection";
import PopularRestaurants from "@/components/home/PopularRestaurants";
import StatsSection from "@/components/home/StatsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import AppDownload from "@/components/home/AppDownload";
import CTASection from "@/components/home/CTASection";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NeYisek",
  url: "https://neyisek.com",
  description: "Türkiye'nin yemek sipariş platformu. Binlerce restorandan kapınıza teslimat.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://neyisek.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HeroSection />
      <PromoBanner />
      <CategoriesSection />
      <PopularRestaurants />
      <StatsSection />
      <FeaturesSection />
      <AppDownload />
      <CTASection />
    </>
  );
}
