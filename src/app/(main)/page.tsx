import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import PopularRestaurants from "@/components/home/PopularRestaurants";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <PopularRestaurants />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
