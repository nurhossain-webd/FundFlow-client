import { Suspense } from "react";

import { TableSkeleton } from "@/components/ui/skeleton";
import { SupporterContributions } from "@/features/contributions/components/supporter-contributions";

function ContributionsPageFallback() {
  return (
    <main className="flex-1 bg-canvas px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
          Supporter workspace
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink-strong sm:text-4xl">
          My contributions
        </h1>
        <div className="mt-8">
          <TableSkeleton rows={5} />
        </div>
      </div>
    </main>
  );
}

export default function SupporterContributionsPage() {
  return (
    <Suspense fallback={<ContributionsPageFallback />}>
      <SupporterContributions />
    </Suspense>
  );
}
