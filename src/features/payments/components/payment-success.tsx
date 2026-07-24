"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Coins, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { currentProfileQueryKey } from "@/features/auth/hooks/use-current-profile";
import { supporterDashboardQueryKey } from "@/features/dashboard/hooks/use-supporter-dashboard";

import { useCreditPaymentStatus } from "../hooks/use-credit-payments";
import { getCreditPaymentErrorMessage } from "../services/credit-payment.service";

export function PaymentSuccess() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const refreshedPaymentId = useRef<string | null>(null);
  const checkoutSessionId = searchParams.get("session_id");
  const paymentQuery = useCreditPaymentStatus(checkoutSessionId);
  const payment = paymentQuery.data;

  useEffect(() => {
    if (
      payment?.status !== "completed" ||
      refreshedPaymentId.current === payment.paymentId
    ) {
      return;
    }

    refreshedPaymentId.current = payment.paymentId;
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: currentProfileQueryKey }),
      queryClient.invalidateQueries({ queryKey: supporterDashboardQueryKey }),
    ]);
    toast.success("Your verified credits are now available.");
  }, [payment, queryClient]);

  if (!checkoutSessionId) {
    return (
      <StatusCard
        icon={<TriangleAlert aria-hidden="true" className="size-8" />}
        iconClassName="bg-[#FFF4E5] text-[#9A5B12]"
        title="Payment reference is missing"
        description="No credits were granted from this page. Return to the package list or check your payment receipt."
      />
    );
  }

  if (paymentQuery.isLoading) {
    return (
      <StatusCard
        icon={<Clock3 aria-hidden="true" className="size-8 animate-pulse" />}
        iconClassName="bg-flow-50 text-flow-700"
        title="Verifying your payment"
        description="FundFlow is checking the server-confirmed Stripe payment. This normally takes only a few seconds."
      />
    );
  }

  if (paymentQuery.isError || !payment) {
    return (
      <StatusCard
        icon={<TriangleAlert aria-hidden="true" className="size-8" />}
        iconClassName="bg-[#FFF0F2] text-error"
        title="We could not verify this payment"
        description={getCreditPaymentErrorMessage(paymentQuery.error)}
        retry={() => void paymentQuery.refetch()}
      />
    );
  }

  if (payment.status === "pending" || payment.status === "created") {
    return (
      <StatusCard
        icon={<Clock3 aria-hidden="true" className="size-8 animate-pulse" />}
        iconClassName="bg-flow-50 text-flow-700"
        title="Payment received—confirmation pending"
        description="Stripe redirected you successfully. We are waiting for the signed webhook before adding credits, so it is safe to keep this page open."
      />
    );
  }

  if (payment.status !== "completed") {
    return (
      <StatusCard
        icon={<TriangleAlert aria-hidden="true" className="size-8" />}
        iconClassName="bg-[#FFF0F2] text-error"
        title="Credits were not added"
        description="The server did not confirm a successful payment. You can choose another package or contact support if Stripe charged your card."
      />
    );
  }

  return (
    <StatusCard
      icon={<CheckCircle2 aria-hidden="true" className="size-8" />}
      iconClassName="bg-[#EAF8F1] text-[#167451]"
      title="Credits added successfully"
      description={`${payment.creditsPurchased.toLocaleString()} credits were added after FundFlow verified the Stripe payment.`}
      details={
        <div className="mt-6 rounded-2xl bg-flow-50 p-4 text-left">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm text-ink-muted">
              <Coins aria-hidden="true" className="size-4" />
              Credits purchased
            </span>
            <strong className="text-ink-strong">
              {payment.creditsPurchased.toLocaleString()}
            </strong>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 border-t border-flow-100 pt-3 text-sm">
            <span className="text-ink-muted">Amount paid</span>
            <strong className="text-ink-strong">
              ${(payment.amountInCents / 100).toFixed(2)} USD
            </strong>
          </div>
        </div>
      }
    />
  );
}

interface StatusCardProps {
  icon: React.ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  details?: React.ReactNode;
  retry?: () => void;
}

function StatusCard({
  description,
  details,
  icon,
  iconClassName,
  retry,
  title,
}: StatusCardProps) {
  return (
    <div className="mx-auto max-w-xl py-8 sm:py-14">
      <Card className="p-7 text-center sm:p-10">
        <span
          className={`mx-auto flex size-16 items-center justify-center rounded-full ${iconClassName}`}
        >
          {icon}
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink-strong sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted">{description}</p>
        {details}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {retry ? <Button onClick={retry}>Check again</Button> : null}
          <Link
            href="/dashboard/supporter"
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-flow-700 px-5 text-sm font-semibold text-white transition hover:bg-flow-800"
          >
            Go to dashboard
          </Link>
          <Link
            href="/dashboard/supporter/credits"
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-white px-5 text-sm font-semibold text-flow-700 transition hover:bg-flow-50"
          >
            View packages
          </Link>
        </div>
      </Card>
    </div>
  );
}
