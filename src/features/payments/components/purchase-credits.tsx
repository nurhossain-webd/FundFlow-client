"use client";

import {
  Check,
  Coins,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useCreateCheckoutSession,
  useCreditPackages,
} from "../hooks/use-credit-payments";
import { getCreditPaymentErrorMessage } from "../services/credit-payment.service";
import type { CreditPackage } from "../types/credit-payment";

const popularPackageId: CreditPackage["id"] = "credits_300";

const formatMoney = (amountInCents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);

const packageValue = (creditPackage: CreditPackage) => {
  const creditsPerDollar =
    creditPackage.credits / (creditPackage.amountInCents / 100);
  const costPerHundred =
    (creditPackage.amountInCents / creditPackage.credits) * 100;

  return {
    creditsPerDollar,
    costPerHundred,
  };
};

export function PurchaseCredits() {
  const packagesQuery = useCreditPackages();
  const checkoutMutation = useCreateCheckoutSession();
  const [selectedPackageId, setSelectedPackageId] = useState<
    CreditPackage["id"] | null
  >(null);

  const handlePurchase = async (packageId: CreditPackage["id"]) => {
    setSelectedPackageId(packageId);

    try {
      const checkout = await checkoutMutation.mutateAsync(packageId);
      const checkoutURL = new URL(checkout.checkoutURL);

      if (
        checkoutURL.protocol !== "https:" ||
        checkoutURL.hostname !== "checkout.stripe.com"
      ) {
        throw new Error("Stripe returned an invalid Checkout URL.");
      }

      window.location.assign(checkoutURL.toString());
    } catch (error) {
      setSelectedPackageId(null);
      toast.error(getCreditPaymentErrorMessage(error));
    }
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-flow-950 px-6 py-8 text-white shadow-[0_18px_50px_rgba(6,47,53,0.16)] sm:px-8 lg:flex lg:items-end lg:justify-between lg:gap-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.12em] text-flow-200 uppercase">
            <Sparkles aria-hidden="true" className="size-4" />
            Fund the next breakthrough
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Add credits to your FundFlow wallet
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-flow-100 sm:text-base">
            Choose a package, complete payment securely with Stripe, and use
            your credits to support approved campaigns.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 lg:mt-0">
          <ShieldCheck aria-hidden="true" className="size-6 text-flow-300" />
          <p className="text-sm text-flow-100">
            Credits are issued only after verified payment.
          </p>
        </div>
      </div>

      {packagesQuery.isLoading ? (
        <div
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Loading credit packages"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[360px] rounded-2xl" />
          ))}
        </div>
      ) : packagesQuery.isError || !packagesQuery.data ? (
        <Card className="py-10 text-center">
          <h2 className="font-display text-xl font-bold text-ink-strong">
            Credit packages could not be loaded
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            {getCreditPaymentErrorMessage(packagesQuery.error)}
          </p>
          <Button className="mt-5" onClick={() => void packagesQuery.refetch()}>
            Try again
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {packagesQuery.data.map((creditPackage) => {
            const isPopular = creditPackage.id === popularPackageId;
            const value = packageValue(creditPackage);
            const isLoading =
              checkoutMutation.isPending &&
              selectedPackageId === creditPackage.id;

            return (
              <Card
                key={creditPackage.id}
                className={
                  isPopular
                    ? "relative border-flow-500 ring-2 ring-flow-500/15"
                    : "relative"
                }
              >
                {isPopular ? (
                  <span className="absolute -top-3 left-5 rounded-full bg-coral-700 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    Most popular
                  </span>
                ) : null}
                <div className="flex size-12 items-center justify-center rounded-2xl bg-flow-50 text-flow-700">
                  <Coins aria-hidden="true" className="size-6" />
                </div>
                <p className="mt-6 text-sm font-semibold text-ink-muted">
                  FundFlow credit pack
                </p>
                <h2 className="mt-1 font-display text-3xl font-bold text-ink-strong">
                  {creditPackage.credits.toLocaleString()}
                  <span className="ml-2 text-base font-semibold text-ink-muted">
                    credits
                  </span>
                </h2>
                <p className="mt-3 font-display text-4xl font-bold text-flow-700">
                  {formatMoney(creditPackage.amountInCents)}
                </p>
                <div className="my-6 h-px bg-border-subtle" />
                <ul className="space-y-3 text-sm text-ink">
                  <li className="flex items-start gap-2">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-flow-600"
                    />
                    {value.creditsPerDollar.toFixed(1)} credits per $1
                  </li>
                  <li className="flex items-start gap-2">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-flow-600"
                    />
                    {formatMoney(value.costPerHundred)} per 100 credits
                  </li>
                  <li className="flex items-start gap-2">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-flow-600"
                    />
                    Secure Stripe checkout
                  </li>
                </ul>
                <Button
                  className="mt-7 w-full"
                  variant={isPopular ? "accent" : "primary"}
                  isLoading={isLoading}
                  loadingText="Opening Stripe…"
                  disabled={checkoutMutation.isPending}
                  onClick={() => void handlePurchase(creditPackage.id)}
                  leftIcon={
                    <ExternalLink aria-hidden="true" className="size-4" />
                  }
                >
                  Buy {creditPackage.credits.toLocaleString()} credits
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-center text-xs leading-5 text-ink-muted">
        Payments are processed by Stripe. FundFlow never receives or stores your
        full card details.
      </p>
    </div>
  );
}
