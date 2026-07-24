import type { Metadata } from "next";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { PaymentSuccess } from "@/features/payments/components/payment-success";

export const metadata: Metadata = {
  title: "Payment Status | FundFlow",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={<Skeleton className="mx-auto h-80 max-w-xl rounded-2xl" />}
    >
      <PaymentSuccess />
    </Suspense>
  );
}
