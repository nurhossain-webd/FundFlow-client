import { ExploreCategories } from "@/components/home/explore-categories";
import { HeroSlider } from "@/components/home/hero-slider";
import { HowItWorks } from "@/components/home/how-it-works";
import { PlatformImpact } from "@/components/home/platform-impact";
import { Testimonials } from "@/components/home/testimonials";
import { TopFundedCampaigns } from "@/components/home/top-funded-campaigns";

export default function Home() {
  return (
    <main className="flex-1">
      <HeroSlider />
      <TopFundedCampaigns />
      <HowItWorks />
      <ExploreCategories />
      <PlatformImpact />
      <Testimonials />
    </main>
  );
}
