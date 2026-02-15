import HeroSection from "@/components/home/HeroSection";
import PromoBanner from "@/components/home/PromoBanner";
import CategoriesSection from "@/components/home/CategoriesSection";
import PopularRestaurants from "@/components/home/PopularRestaurants";
import StatsSection from "@/components/home/StatsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import AppDownload from "@/components/home/AppDownload";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
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
