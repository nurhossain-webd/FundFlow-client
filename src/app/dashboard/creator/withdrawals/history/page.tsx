import type { Metadata } from "next";
import { Suspense } from "react";

import { TableSkeleton } from "@/components/ui/skeleton";
import { CreatorWithdrawalHistory } from "@/features/withdrawals/components/creator-withdrawal-history";

export const metadata: Metadata = {
  title: "Withdrawal History | FundFlow",
  description: "Review the status of your FundFlow withdrawal requests.",
};

export default function CreatorWithdrawalHistoryPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={5} />}>
      <CreatorWithdrawalHistory />
    </Suspense>
  );
}
