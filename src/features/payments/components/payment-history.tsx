"use client";

import { format } from "date-fns";
import { CircleAlert, CreditCard, ReceiptText } from "lucide-react";
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

import { usePaymentHistory } from "../hooks/use-credit-payments";
import type {
  PaymentHistoryFilters,
  PaymentHistoryItem,
  PaymentHistoryStatus,
} from "../types/credit-payment";

const validLimits = new Set([10, 20, 50]);

const statusPresentation: Record<
  PaymentHistoryStatus,
  {
    label: string;
    variant: "neutral" | "warning" | "success" | "error" | "info";
  }
> = {
  created: { label: "Created", variant: "neutral" },
  pending: { label: "Pending", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  failed: { label: "Failed", variant: "error" },
  refunded: { label: "Refunded", variant: "info" },
};

const getFilters = (
  parameters: Pick<URLSearchParams, "get">,
): PaymentHistoryFilters => {
  const page = Number(parameters.get("page"));
  const limit = Number(parameters.get("limit"));

  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    limit: validLimits.has(limit) ? (limit as 10 | 20 | 50) : 10,
  };
};

const formatAmount = (payment: PaymentHistoryItem) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: payment.currency.toUpperCase(),
  }).format(payment.amountInCents / 100);

function PaymentStatusBadge({ status }: { status: PaymentHistoryStatus }) {
  const presentation = statusPresentation[status];
  return <Badge variant={presentation.variant}>{presentation.label}</Badge>;
}

function MobilePaymentCard({ payment }: { payment: PaymentHistoryItem }) {
  return (
    <article className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Transaction
          </p>
          <p className="mt-1 font-mono text-sm font-semibold break-all text-ink-strong">
            {payment.transactionId}
          </p>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-ink-muted">Credits</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {payment.creditsPurchased.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Amount</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {formatAmount(payment)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Payment method</dt>
          <dd className="mt-1 flex items-center gap-1.5 font-semibold text-ink-strong">
            <CreditCard aria-hidden="true" className="size-4 text-flow-600" />
            {payment.paymentMethod}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Date</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {format(new Date(payment.createdAt), "MMM d, yyyy, h:mm a")}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function PaymentHistory() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const filters = getFilters(searchParameters);
  const paymentQuery = usePaymentHistory(filters);
  const payments = paymentQuery.data?.payments ?? [];
  const pagination = paymentQuery.data?.pagination;

  const updateParameters = (
    updates: Record<string, string>,
    resetPage = true,
  ) => {
    const nextParameters = new URLSearchParams(searchParameters.toString());

    Object.entries(updates).forEach(([key, value]) => {
      nextParameters.set(key, value);
    });

    if (resetPage) {
      nextParameters.set("page", "1");
    }

    startTransition(() => {
      router.replace(
        `/dashboard/supporter/payments?${nextParameters.toString()}`,
        { scroll: false },
      );
    });
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
            Supporter workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
            Payment history
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
            Review your credit purchases. Sensitive Stripe and card details are
            never displayed.
          </p>
        </div>
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

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {pagination
            ? `${pagination.total.toLocaleString()} payment${pagination.total === 1 ? "" : "s"}`
            : "Loading payment count…"}
        </p>
        {isNavigating || paymentQuery.isFetching ? (
          <span className="text-sm text-ink-muted" role="status">
            Updating…
          </span>
        ) : null}
      </div>

      {paymentQuery.isLoading ? (
        <TableSkeleton rows={5} />
      ) : paymentQuery.isError ? (
        <EmptyState
          icon={CircleAlert}
          title="Your payment history could not be loaded"
          description={
            paymentQuery.error instanceof Error
              ? paymentQuery.error.message
              : "FundFlow could not reach the payment service."
          }
          action={
            <Button onClick={() => void paymentQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No credit purchases yet"
          description="Your Stripe credit purchases will appear here, newest first."
        />
      ) : (
        <>
          <div className="space-y-4 md:hidden">
            {payments.map((payment) => (
              <MobilePaymentCard
                key={payment.transactionId}
                payment={payment}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Credits purchased</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment method</TableHead>
                  <TableHead>Payment status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.transactionId}>
                    <TableCell className="font-mono text-xs font-semibold text-ink-strong">
                      {payment.transactionId}
                    </TableCell>
                    <TableCell>
                      {payment.creditsPurchased.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-ink-strong">
                      {formatAmount(payment)}
                    </TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(payment.createdAt),
                        "MMM d, yyyy, h:mm a",
                      )}
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
          aria-label="Payment history pagination"
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
