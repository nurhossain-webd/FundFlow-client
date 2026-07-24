import dynamic from "next/dynamic";

import { ExploreCategories } from "@/components/home/explore-categories";
import { HowItWorks } from "@/components/home/how-it-works";
import { PlatformImpact } from "@/components/home/platform-impact";
import { TopFundedCampaigns } from "@/components/home/top-funded-campaigns";
import { Skeleton } from "@/components/ui/skeleton";

const HeroSlider = dynamic(
  () =>
    import("@/components/home/hero-slider").then((module) => module.HeroSlider),
  {
    loading: () => (
      <Skeleton className="h-[520px] w-full rounded-none sm:h-[560px]" />
    ),
  },
);

const Testimonials = dynamic(
  () =>
    import("@/components/home/testimonials").then(
      (module) => module.Testimonials,
    ),
  {
    loading: () => (
      <section className="px-4 py-16 sm:px-6">
        <Skeleton className="mx-auto h-72 max-w-6xl rounded-3xl" />
      </section>
    ),
  },
);

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
