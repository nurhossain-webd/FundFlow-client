import type { Metadata } from "next";
import { Suspense } from "react";

import { TableSkeleton } from "@/components/ui/skeleton";
import { PaymentHistory } from "@/features/payments/components/payment-history";

export const metadata: Metadata = {
  title: "Payment History | FundFlow",
  description: "Review your FundFlow credit purchase history.",
};

export default function PaymentHistoryPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={5} />}>
      <PaymentHistory />
    </Suspense>
  );
}
