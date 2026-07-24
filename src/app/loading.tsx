import { PageContainer } from "@/components/layout/page-container";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      className="flex-1 py-10 sm:py-14"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <PageContainer>
        <span className="sr-only">Loading FundFlow content</span>
        <div className="mb-8 space-y-3">
          <div className="h-4 w-28 animate-pulse rounded bg-[#E3ECEB]" />
          <div className="h-10 max-w-md animate-pulse rounded-lg bg-[#E3ECEB]" />
          <div className="h-5 max-w-xl animate-pulse rounded bg-[#E3ECEB]" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </PageContainer>
    </main>
  );
}
