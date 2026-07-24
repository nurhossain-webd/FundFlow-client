"use client";

import { format } from "date-fns";
import { CircleAlert, ReceiptText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
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

import { useCreatorWithdrawalHistory } from "../hooks/use-withdrawals";
import type {
  WithdrawalHistoryFilters,
  WithdrawalRequest,
  WithdrawalStatus,
} from "../types/withdrawal";

const statuses: WithdrawalStatus[] = [
  "pending",
  "approved",
  "processing",
  "completed",
  "rejected",
  "failed",
];
const validStatuses = new Set(statuses);
const validLimits = new Set([10, 20, 50]);

const statusPresentation: Record<
  WithdrawalStatus,
  {
    label: string;
    variant: "warning" | "success" | "error" | "info" | "neutral";
  }
> = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  processing: { label: "Processing", variant: "info" },
  completed: { label: "Completed", variant: "success" },
  rejected: { label: "Rejected", variant: "error" },
  failed: { label: "Failed", variant: "error" },
};

const paymentSystemLabels: Record<WithdrawalRequest["paymentSystem"], string> =
  {
    stripe: "Stripe",
    bkash: "Bkash",
    rocket: "Rocket",
    nagad: "Nagad",
  };

const getFilters = (
  parameters: Pick<URLSearchParams, "get">,
): WithdrawalHistoryFilters => {
  const page = Number(parameters.get("page"));
  const limit = Number(parameters.get("limit"));
  const status = parameters.get("status");

  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    limit: validLimits.has(limit) ? (limit as 10 | 20 | 50) : 10,
    ...(status && validStatuses.has(status as WithdrawalStatus)
      ? { status: status as WithdrawalStatus }
      : {}),
  };
};

const formatAmount = (amountInCents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amountInCents / 100);

function WithdrawalStatusBadge({ status }: { status: WithdrawalStatus }) {
  const presentation = statusPresentation[status];
  return <Badge variant={presentation.variant}>{presentation.label}</Badge>;
}

function MobileWithdrawalCard({
  withdrawal,
}: {
  withdrawal: WithdrawalRequest;
}) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Requested credits
          </p>
          <p className="mt-1 font-display text-xl font-bold text-ink-strong">
            {withdrawal.withdrawalCredits.toLocaleString()}
          </p>
        </div>
        <WithdrawalStatusBadge status={withdrawal.status} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-ink-muted">Dollar amount</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {formatAmount(withdrawal.amountInCents)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Payment system</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {paymentSystemLabels[withdrawal.paymentSystem]}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Account</dt>
          <dd className="mt-1 font-mono font-semibold text-ink-strong">
            {withdrawal.accountNumber}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Request date</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {format(new Date(withdrawal.date), "MMM d, yyyy, h:mm a")}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function CreatorWithdrawalHistory() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const filters = getFilters(searchParameters);
  const historyQuery = useCreatorWithdrawalHistory(filters);
  const withdrawals = historyQuery.data?.withdrawals ?? [];
  const pagination = historyQuery.data?.pagination;

  const updateParameters = (
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const nextParameters = new URLSearchParams(searchParameters.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParameters.set(key, value);
      } else {
        nextParameters.delete(key);
      }
    });

    if (resetPage) {
      nextParameters.set("page", "1");
    }

    const query = nextParameters.toString();
    startTransition(() => {
      router.replace(
        query
          ? `/dashboard/creator/withdrawals/history?${query}`
          : "/dashboard/creator/withdrawals/history",
        { scroll: false },
      );
    });
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
            Creator workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
            Withdrawal history
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
            Track every withdrawal request and its current review status. Payout
            accounts remain masked.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm font-semibold text-ink-muted">
            Status
            <select
              value={filters.status ?? ""}
              onChange={(event) =>
                updateParameters({
                  status: event.target.value || undefined,
                })
              }
              className="mt-1 block h-10 rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusPresentation[status].label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-ink-muted">
            Per page
            <select
              value={filters.limit}
              onChange={(event) =>
                updateParameters({ limit: event.target.value })
              }
              className="mt-1 block h-10 rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {pagination
            ? `${pagination.total.toLocaleString()} request${pagination.total === 1 ? "" : "s"}`
            : "Loading request count…"}
        </p>
        {isNavigating || historyQuery.isFetching ? (
          <span className="text-sm text-ink-muted" role="status">
            Updating…
          </span>
        ) : null}
      </div>

      {historyQuery.isLoading ? (
        <TableSkeleton rows={5} />
      ) : historyQuery.isError ? (
        <EmptyState
          icon={CircleAlert}
          title="Withdrawal history could not be loaded"
          description={
            historyQuery.error instanceof Error
              ? historyQuery.error.message
              : "FundFlow could not reach the withdrawal service."
          }
          action={
            <Button onClick={() => void historyQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : withdrawals.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={
            filters.status
              ? `No ${statusPresentation[filters.status].label.toLowerCase()} requests`
              : "No withdrawal requests yet"
          }
          description={
            filters.status
              ? "Choose another status to review your requests."
              : "Your withdrawal requests will appear here after submission."
          }
        />
      ) : (
        <>
          <div className="space-y-4 xl:hidden">
            {withdrawals.map((withdrawal) => (
              <MobileWithdrawalCard
                key={withdrawal.id}
                withdrawal={withdrawal}
              />
            ))}
          </div>
          <div className="hidden xl:block">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Requested credits</TableHead>
                  <TableHead>Dollar amount</TableHead>
                  <TableHead>Payment system</TableHead>
                  <TableHead>Masked account</TableHead>
                  <TableHead>Request date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
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
                      {format(new Date(withdrawal.date), "MMM d, yyyy, h:mm a")}
                    </TableCell>
                    <TableCell>
                      <WithdrawalStatusBadge status={withdrawal.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav
          aria-label="Withdrawal history pagination"
          className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-4 sm:flex-row"
        >
          <p className="text-sm text-ink-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1 || isNavigating}
              onClick={() =>
                updateParameters({ page: String(pagination.page - 1) }, false)
              }
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={
                pagination.page >= pagination.totalPages || isNavigating
              }
              onClick={() =>
                updateParameters({ page: String(pagination.page + 1) }, false)
              }
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
