"use client";

import { format } from "date-fns";
import { CircleAlert, ExternalLink, HandCoins } from "lucide-react";
import Link from "next/link";
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
import { cn } from "@/lib/utils";

import { useSupporterContributions } from "../hooks/use-supporter-contributions";
import type {
  SupporterContribution,
  SupporterContributionFilter,
  SupporterContributionFilters,
} from "../types/supporter-contribution";
import type { ContributionStatus } from "../types/creator-contribution";

const validStatuses = new Set<SupporterContributionFilter>([
  "pending",
  "approved",
  "rejected",
]);
const validLimits = new Set([10, 20, 50]);

const statusPresentation: Record<
  ContributionStatus,
  {
    label: string;
    variant: "warning" | "success" | "error" | "info";
    accent: string;
  }
> = {
  pending: {
    label: "Pending review",
    variant: "warning",
    accent: "border-l-[#C58B19]",
  },
  approved: {
    label: "Approved",
    variant: "success",
    accent: "border-l-[#167451]",
  },
  rejected: {
    label: "Rejected",
    variant: "error",
    accent: "border-l-error",
  },
  refunded: {
    label: "Refunded",
    variant: "info",
    accent: "border-l-[#2867A2]",
  },
};

const getFilters = (
  parameters: Pick<URLSearchParams, "get">,
): SupporterContributionFilters => {
  const requestedPage = Number(parameters.get("page"));
  const requestedLimit = Number(parameters.get("limit"));
  const requestedStatus = parameters.get("status");

  return {
    page:
      Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1,
    limit: validLimits.has(requestedLimit)
      ? (requestedLimit as 10 | 20 | 50)
      : 10,
    ...(requestedStatus &&
    validStatuses.has(requestedStatus as SupporterContributionFilter)
      ? { status: requestedStatus as SupporterContributionFilter }
      : {}),
  };
};

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

function StatusBadge({ status }: { status: ContributionStatus }) {
  const presentation = statusPresentation[status];

  return (
    <Badge variant={presentation.variant} className="font-bold">
      {presentation.label}
    </Badge>
  );
}

function MobileContributionCard({
  contribution,
}: {
  contribution: SupporterContribution;
}) {
  const presentation = statusPresentation[contribution.status];

  return (
    <article
      className={cn(
        "rounded-2xl border border-l-4 border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]",
        presentation.accent,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-lg leading-6 font-bold text-ink-strong">
          {contribution.campaignTitle}
        </h2>
        <StatusBadge status={contribution.status} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-ink-muted">Creator</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {contribution.creatorName ?? contribution.creatorEmail}
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Contribution</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {formatCredits(contribution.amount)} credits
          </dd>
        </div>
        <div>
          <dt className="text-ink-muted">Date</dt>
          <dd className="mt-1 font-semibold text-ink-strong">
            {format(new Date(contribution.createdAt), "MMM d, yyyy")}
          </dd>
        </div>
      </dl>
      <Link
        href={`/campaigns/${contribution.campaignId}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-flow-700 hover:text-flow-900"
      >
        View campaign
        <ExternalLink aria-hidden="true" className="size-4" />
      </Link>
    </article>
  );
}

export function SupporterContributions() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const filters = getFilters(searchParameters);
  const contributionQuery = useSupporterContributions(filters);
  const contributions = contributionQuery.data?.contributions ?? [];
  const pagination = contributionQuery.data?.pagination;

  const updateParameters = (
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const nextParameters = new URLSearchParams(searchParameters.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        nextParameters.set(key, value);
      } else {
        nextParameters.delete(key);
      }
    }

    if (resetPage) {
      nextParameters.set("page", "1");
    }

    const query = nextParameters.toString();
    startTransition(() => {
      router.replace(
        query
          ? `/dashboard/supporter/contributions?${query}`
          : "/dashboard/supporter/contributions",
        { scroll: false },
      );
    });
  };

  return (
    <main className="flex-1 bg-canvas px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
              Supporter workspace
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
              My contributions
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
              Follow every contribution from creator review through approval or
              refund.
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
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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

        <div className="mt-7 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">
            {pagination
              ? `${pagination.total.toLocaleString()} contribution${pagination.total === 1 ? "" : "s"}`
              : "Loading contribution count…"}
          </p>
          {isNavigating || contributionQuery.isFetching ? (
            <span className="text-sm text-ink-muted" role="status">
              Updating…
            </span>
          ) : null}
        </div>

        <section className="mt-4">
          {contributionQuery.isLoading ? (
            <TableSkeleton rows={filters.limit > 10 ? 8 : 5} />
          ) : contributionQuery.isError ? (
            <EmptyState
              icon={CircleAlert}
              title="Your contributions could not be loaded"
              description={
                contributionQuery.error instanceof Error
                  ? contributionQuery.error.message
                  : "FundFlow could not reach the contribution service."
              }
              action={
                <Button onClick={() => void contributionQuery.refetch()}>
                  Try again
                </Button>
              }
            />
          ) : contributions.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title={
                filters.status
                  ? `No ${filters.status} contributions`
                  : "You have not contributed yet"
              }
              description={
                filters.status
                  ? "Choose another status to review the rest of your contribution history."
                  : "Explore active campaigns and support an idea to begin building your contribution history."
              }
              action={
                filters.status ? (
                  <Button
                    variant="secondary"
                    onClick={() => updateParameters({ status: undefined })}
                  >
                    Show all contributions
                  </Button>
                ) : (
                  <Link
                    href="/campaigns"
                    className="font-semibold text-flow-700 hover:text-flow-900"
                  >
                    Explore campaigns
                  </Link>
                )
              }
            />
          ) : (
            <>
              <div className="hidden md:block">
                <Table className="min-w-[820px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign title</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Contribution amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Campaign</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((contribution) => (
                      <TableRow
                        key={contribution._id}
                        className={cn(
                          "border-l-4",
                          statusPresentation[contribution.status].accent,
                        )}
                      >
                        <TableCell className="font-semibold text-ink-strong">
                          {contribution.campaignTitle}
                        </TableCell>
                        <TableCell>
                          {contribution.creatorName ??
                            contribution.creatorEmail}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCredits(contribution.amount)} credits
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(contribution.createdAt),
                            "MMM d, yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={contribution.status} />
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/campaigns/${contribution.campaignId}`}
                            className="inline-flex items-center gap-1.5 font-semibold text-flow-700 hover:text-flow-900"
                          >
                            View
                            <ExternalLink
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:hidden">
                {contributions.map((contribution) => (
                  <MobileContributionCard
                    key={contribution._id}
                    contribution={contribution}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {pagination && pagination.totalPages > 1 ? (
          <nav
            aria-label="Contribution history pages"
            className="mt-7 flex items-center justify-between gap-4 border-t border-border-subtle pt-6"
          >
            <p className="text-sm text-ink-muted">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={filters.page <= 1 || contributionQuery.isFetching}
                onClick={() =>
                  updateParameters(
                    { page: String(Math.max(1, filters.page - 1)) },
                    false,
                  )
                }
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={
                  filters.page >= pagination.totalPages ||
                  contributionQuery.isFetching
                }
                onClick={() =>
                  updateParameters({ page: String(filters.page + 1) }, false)
                }
              >
                Next
              </Button>
            </div>
          </nav>
        ) : null}
      </div>
    </main>
  );
}
