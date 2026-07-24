"use client";

import {
  CircleAlert,
  CircleDollarSign,
  Coins,
  Info,
  Landmark,
  LockKeyhole,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useCreateWithdrawal,
  useWithdrawalSummary,
} from "../hooks/use-withdrawals";
import {
  withdrawalFormSchema,
  withdrawalPaymentSystems,
  type WithdrawalFormValues,
} from "../schemas/withdrawal-form.schema";

const fieldClasses =
  "mt-2 h-12 w-full rounded-[10px] border border-border bg-white px-4 text-ink-strong outline-none transition focus:border-flow-600 focus:ring-4 focus:ring-flow-200/70 disabled:cursor-not-allowed disabled:bg-canvas-muted";

const formatMoney = (amountInCents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);

export function CreatorWithdrawalForm() {
  const summaryQuery = useWithdrawalSummary();
  const withdrawalMutation = useCreateWithdrawal();
  const [requestIdentity, setRequestIdentity] = useState<{
    signature: string;
    key: string;
  } | null>(null);
  const {
    clearErrors,
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<WithdrawalFormValues>({
    defaultValues: {
      credits: "",
      paymentSystem: "",
      accountNumber: "",
    },
  });
  const enteredCredits = useWatch({ control, name: "credits" });
  const parsedCredits = /^\d+$/.test(enteredCredits ?? "")
    ? Number(enteredCredits)
    : 0;
  const summary = summaryQuery.data;
  const calculatedAmountInCents =
    (parsedCredits * 100) / (summary?.creditsPerDollar ?? 20);
  const hasMinimumBalance =
    Boolean(summary) &&
    summary!.withdrawableCredits >= summary!.minimumWithdrawalCredits;
  const exceedsBalance =
    Boolean(summary) && parsedCredits > summary!.withdrawableCredits;
  const isNonPreferredMultiple =
    parsedCredits >= 200 && parsedCredits % 20 !== 0;

  const submitForm = handleSubmit(async (values) => {
    clearErrors();
    const validation = withdrawalFormSchema.safeParse(values);

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (
          field === "credits" ||
          field === "paymentSystem" ||
          field === "accountNumber"
        ) {
          setError(field, { message: issue.message });
        }
      });
      return;
    }

    if (!summary || validation.data.credits > summary.withdrawableCredits) {
      setError("credits", {
        message: "Withdrawal cannot exceed your withdrawable credit balance",
      });
      return;
    }

    const amountInCents =
      (validation.data.credits * 100) / summary.creditsPerDollar;
    const confirmation = await Swal.fire({
      icon: "question",
      title: "Confirm withdrawal request",
      html: `Request <strong>${validation.data.credits.toLocaleString()} credits</strong> (${formatMoney(amountInCents)}) through ${validation.data.paymentSystem.toUpperCase()}?`,
      text: "These credits will be reserved until an administrator reviews the request.",
      showCancelButton: true,
      confirmButtonText: "Submit request",
      cancelButtonText: "Review details",
      confirmButtonColor: "#08717A",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    const signature = JSON.stringify(validation.data);
    let identity = requestIdentity;

    if (identity?.signature !== signature) {
      identity = {
        signature,
        key: `withdrawal:${crypto.randomUUID()}`,
      };
      setRequestIdentity(identity);
    }

    try {
      await withdrawalMutation.mutateAsync({
        input: validation.data,
        idempotencyKey: identity.key,
      });
      setRequestIdentity(null);
      reset();

      await Swal.fire({
        icon: "success",
        title: "Withdrawal requested",
        text: "Your request is pending administrator review. The requested credits are now reserved.",
        confirmButtonColor: "#08717A",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Request not submitted",
        text:
          error instanceof Error
            ? error.message
            : "Unable to submit the withdrawal request.",
        confirmButtonColor: "#08717A",
      });
    }
  });

  if (summaryQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-[480px] rounded-2xl" />
      </div>
    );
  }

  if (summaryQuery.isError || !summary) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="Withdrawal information could not be loaded"
        description={
          summaryQuery.error instanceof Error
            ? summaryQuery.error.message
            : "FundFlow could not reach the withdrawal service."
        }
        action={
          <Button onClick={() => void summaryQuery.refetch()}>Try again</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
          Creator workspace
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
          Withdraw raised credits
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
          Convert campaign earnings at the fixed FundFlow rate of 20 raised
          credits for $1.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={Coins}
          label="Current raised credits"
          value={summary.currentRaisedCredits.toLocaleString()}
          detail={
            summary.reservedRaisedCredits > 0
              ? `${summary.reservedRaisedCredits.toLocaleString()} reserved`
              : "No pending reservations"
          }
        />
        <SummaryCard
          icon={WalletCards}
          label="Available to withdraw"
          value={summary.withdrawableCredits.toLocaleString()}
          detail="Unreserved raised credits"
        />
        <SummaryCard
          icon={CircleDollarSign}
          label="Equivalent value"
          value={formatMoney(summary.equivalentAmountInCents)}
          detail={`${summary.creditsPerDollar} credits per $1`}
        />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <form onSubmit={submitForm} noValidate>
            <fieldset
              disabled={withdrawalMutation.isPending}
              className="space-y-5"
            >
              <legend className="font-display text-xl font-bold text-ink-strong">
                Withdrawal details
              </legend>

              <Input
                label="Credits to withdraw"
                type="text"
                inputMode="numeric"
                placeholder="400"
                leadingIcon={<Coins aria-hidden="true" className="size-5" />}
                error={errors.credits?.message}
                hint={
                  isNonPreferredMultiple
                    ? "Multiples of 20 are preferred for whole-dollar payouts."
                    : `Maximum available: ${summary.withdrawableCredits.toLocaleString()} credits`
                }
                {...register("credits")}
              />
              {exceedsBalance && !errors.credits ? (
                <p className="-mt-3 text-sm text-error" role="alert">
                  This exceeds your withdrawable credit balance.
                </p>
              ) : null}

              <Input
                label="Dollar amount"
                value={formatMoney(calculatedAmountInCents)}
                readOnly
                aria-readonly="true"
                leadingIcon={
                  <CircleDollarSign aria-hidden="true" className="size-5" />
                }
                hint="Calculated automatically. The server verifies the final amount."
              />

              <label className="block text-sm font-semibold text-ink-strong">
                Payment system
                <select
                  className={fieldClasses}
                  aria-invalid={Boolean(errors.paymentSystem)}
                  {...register("paymentSystem")}
                >
                  <option value="">Choose a payment system</option>
                  {withdrawalPaymentSystems.map((system) => (
                    <option key={system.value} value={system.value}>
                      {system.label}
                    </option>
                  ))}
                </select>
                {errors.paymentSystem ? (
                  <span
                    className="mt-1.5 block text-sm text-error"
                    role="alert"
                  >
                    {errors.paymentSystem.message}
                  </span>
                ) : null}
              </label>

              <Input
                label="Account number"
                type="text"
                autoComplete="off"
                placeholder="Enter your payout account identifier"
                leadingIcon={<Landmark aria-hidden="true" className="size-5" />}
                error={errors.accountNumber?.message}
                hint="Only a masked version is shown after submission."
                {...register("accountNumber")}
              />

              {hasMinimumBalance ? (
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  isLoading={withdrawalMutation.isPending}
                  loadingText="Submitting request…"
                  disabled={exceedsBalance}
                  leftIcon={
                    <WalletCards aria-hidden="true" className="size-5" />
                  }
                >
                  Request withdrawal
                </Button>
              ) : (
                <div className="rounded-xl border border-[#EDD48A] bg-[#FFF8E5] px-4 py-3 font-semibold text-[#8A5A08]">
                  Insufficient credit
                </div>
              )}
            </fieldset>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card className="bg-flow-950 text-white">
            <Info aria-hidden="true" className="size-6 text-flow-300" />
            <h2 className="mt-4 font-display text-lg font-bold">
              Minimum withdrawal
            </h2>
            <p className="mt-2 text-sm leading-6 text-flow-100">
              You need at least{" "}
              {summary.minimumWithdrawalCredits.toLocaleString()} withdrawable
              credits, equal to{" "}
              {formatMoney(
                (summary.minimumWithdrawalCredits * 100) /
                  summary.creditsPerDollar,
              )}
              .
            </p>
          </Card>
          <Card>
            <LockKeyhole aria-hidden="true" className="size-6 text-flow-700" />
            <h2 className="mt-4 font-display text-lg font-bold text-ink-strong">
              Secure review
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              FundFlow reserves requested credits immediately and deducts them
              only after an administrator approves the request.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  icon: typeof Coins;
  label: string;
  value: string;
  detail: string;
}

function SummaryCard({ detail, icon: Icon, label, value }: SummaryCardProps) {
  return (
    <Card>
      <span className="flex size-10 items-center justify-center rounded-xl bg-flow-50 text-flow-700">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink-strong">
        {value}
      </p>
      <p className="mt-1 text-xs text-ink-muted">{detail}</p>
    </Card>
  );
}
