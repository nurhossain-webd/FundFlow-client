"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  WalletCards,
} from "lucide-react";
import { type MouseEvent, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminPendingWithdrawals,
  useApproveAdminWithdrawal,
} from "@/features/withdrawals/hooks/use-withdrawals";
import type {
  WithdrawalPaymentSystem,
  WithdrawalRequest,
} from "@/features/withdrawals/types/withdrawal";

const paymentSystemLabels: Record<WithdrawalPaymentSystem, string> = {
  stripe: "Stripe",
  bkash: "Bkash",
  rocket: "Rocket",
  nagad: "Nagad",
};

const formatAmount = (amountInCents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);

export default function AdminWithdrawalRequestsPage() {
  const [page, setPage] = useState(1);
  const [processingWithdrawalId, setProcessingWithdrawalId] =
    useState<string>();
  const pendingQuery = useAdminPendingWithdrawals(page);
  const approvalMutation = useApproveAdminWithdrawal();
  const withdrawals = pendingQuery.data?.withdrawals ?? [];
  const pagination = pendingQuery.data?.pagination;

  const confirmPaymentSuccess = async (
    event: MouseEvent<HTMLButtonElement>,
    withdrawal: WithdrawalRequest,
  ) => {
    const button = event.currentTarget;
    button.disabled = true;

    try {
      const confirmation = await Swal.fire({
        icon: "question",
        title: "Confirm payment success?",
        html: `Confirm that <strong>${formatAmount(withdrawal.amountInCents)}</strong> was paid to ${withdrawal.creatorName} through ${paymentSystemLabels[withdrawal.paymentSystem]}.`,
        text: `${withdrawal.withdrawalCredits.toLocaleString()} raised credits will be deducted exactly once. This action cannot be repeated.`,
        showCancelButton: true,
        confirmButtonText: "Confirm payment success",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#098A91",
        reverseButtons: true,
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      setProcessingWithdrawalId(withdrawal.id);
      await approvalMutation.mutateAsync(withdrawal.id);

      if (page > 1 && withdrawals.length === 1) {
        setPage((currentPage) => currentPage - 1);
      }

      toast.success("Payment confirmed and Creator notified");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to process this withdrawal",
      );
    } finally {
      setProcessingWithdrawalId(undefined);
      button.disabled = false;
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
          Administration
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
          Withdrawal requests
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
          Confirm Creator payouts only after successfully transferring the
          displayed dollar amount.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {pagination
            ? `${pagination.total.toLocaleString()} pending request${pagination.total === 1 ? "" : "s"}`
            : "Loading pending request count…"}
        </p>
        {pendingQuery.isFetching && !pendingQuery.isLoading ? (
          <span className="text-sm text-ink-muted" role="status">
            Updating…
          </span>
        ) : null}
      </div>

      {pendingQuery.isLoading ? (
        <TableSkeleton rows={6} />
      ) : pendingQuery.isError ? (
        <EmptyState
          icon={CircleAlert}
          title="Withdrawal requests could not be loaded"
          description={
            pendingQuery.error instanceof Error
              ? pendingQuery.error.message
              : "FundFlow could not reach the withdrawal service."
          }
          action={
            <Button onClick={() => void pendingQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : withdrawals.length === 0 ? (
        <EmptyState
          icon={WalletCards}
          title="No pending withdrawal requests"
          description="New Creator withdrawal requests will appear here automatically."
        />
      ) : (
        <>
          <div className="space-y-4 xl:hidden">
            {withdrawals.map((withdrawal) => (
              <article
                key={withdrawal.id}
                className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-ink-strong">
                      {withdrawal.creatorName}
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {withdrawal.creatorEmail}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EDD48A] bg-[#FFF8E5] px-2.5 py-1 text-xs font-semibold text-[#9A6508]">
                    <Clock3 aria-hidden="true" className="size-3.5" />
                    Pending
                  </span>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <Data
                    label="Requested credits"
                    value={withdrawal.withdrawalCredits.toLocaleString()}
                  />
                  <Data
                    label="Dollar amount"
                    value={formatAmount(withdrawal.amountInCents)}
                  />
                  <Data
                    label="Payment system"
                    value={paymentSystemLabels[withdrawal.paymentSystem]}
                  />
                  <Data
                    label="Masked account"
                    value={withdrawal.accountNumber}
                    mono
                  />
                  <div className="col-span-2">
                    <Data
                      label="Request date"
                      value={format(
                        new Date(withdrawal.date),
                        "MMM d, yyyy, h:mm a",
                      )}
                    />
                  </div>
                </dl>
                <Button
                  className="mt-5 w-full"
                  disabled={approvalMutation.isPending}
                  isLoading={
                    processingWithdrawalId === withdrawal.id &&
                    approvalMutation.isPending
                  }
                  loadingText="Processing…"
                  leftIcon={
                    <CheckCircle2 aria-hidden="true" className="size-5" />
                  }
                  onClick={(event) =>
                    void confirmPaymentSuccess(event, withdrawal)
                  }
                >
                  Payment Success
                </Button>
              </article>
            ))}
          </div>

          <div className="hidden xl:block">
            <Table className="min-w-[1120px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Requested credits</TableHead>
                  <TableHead>Dollar amount</TableHead>
                  <TableHead>Payment system</TableHead>
                  <TableHead>Masked account</TableHead>
                  <TableHead>Request date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => {
                  const isCurrent =
                    processingWithdrawalId === withdrawal.id &&
                    approvalMutation.isPending;

                  return (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <p className="font-semibold text-ink-strong">
                          {withdrawal.creatorName}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {withdrawal.creatorEmail}
                        </p>
                      </TableCell>
                      <TableCell className="font-semibold text-ink-strong">
                        {withdrawal.withdrawalCredits.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {formatAmount(withdrawal.amountInCents)}
                      </TableCell>
                      <TableCell>
                        {paymentSystemLabels[withdrawal.paymentSystem]}
                      </TableCell>
                      <TableCell className="font-mono">
                        {withdrawal.accountNumber}
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(withdrawal.date),
                          "MMM d, yyyy, h:mm a",
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            disabled={approvalMutation.isPending}
                            onClick={(event) =>
                              void confirmPaymentSuccess(event, withdrawal)
                            }
                          >
                            {isCurrent ? (
                              <LoaderCircle
                                aria-hidden="true"
                                className="size-4 animate-spin"
                              />
                            ) : (
                              <CheckCircle2
                                aria-hidden="true"
                                className="size-4"
                              />
                            )}
                            {isCurrent ? "Processing…" : "Payment Success"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav
          aria-label="Pending withdrawal pagination"
          className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-4 sm:flex-row"
        >
          <p className="text-sm text-ink-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1 || approvalMutation.isPending}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={
                pagination.page >= pagination.totalPages ||
                approvalMutation.isPending
              }
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function Data({
  label,
  mono = false,
  value,
}: {
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div>
      <dt className="text-ink-muted">{label}</dt>
      <dd
        className={`mt-1 font-semibold text-ink-strong ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
