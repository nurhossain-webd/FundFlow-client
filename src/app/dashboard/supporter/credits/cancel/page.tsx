import { ArrowLeft, CreditCard } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment Cancelled | FundFlow",
};

export default function PaymentCancelledPage() {
  return (
    <div className="mx-auto max-w-xl py-8 sm:py-14">
      <Card className="p-7 text-center sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-flow-50 text-flow-700">
          <CreditCard aria-hidden="true" className="size-8" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink-strong sm:text-3xl">
          Payment cancelled
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Stripe Checkout was closed before payment. Your card was not confirmed
          and FundFlow has not added any credits.
        </p>
        <Link
          href="/dashboard/supporter/credits"
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-flow-700 px-5 text-sm font-semibold text-white transition hover:bg-flow-800"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Return to credit packages
        </Link>
      </Card>
    </div>
  );
}
