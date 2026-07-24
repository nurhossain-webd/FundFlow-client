import { Suspense } from "react";

import { ExploreCampaigns } from "@/features/campaigns/components/explore-campaigns";

function ExplorePageLoading() {
  return (
    <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-24">
      <p className="text-sm font-semibold text-ink-muted" role="status">
        Preparing campaign discovery…
      </p>
    </main>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense fallback={<ExplorePageLoading />}>
      <ExploreCampaigns />
    </Suspense>
  );
}
