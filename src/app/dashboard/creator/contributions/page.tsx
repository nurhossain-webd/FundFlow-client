"use client";

import { format } from "date-fns";
import {
  Check,
  CircleAlert,
  Coins,
  Eye,
  HandCoins,
  Hourglass,
  RotateCcw,
  X,
} from "lucide-react";
import { type MouseEvent, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContributionDetailModal } from "@/features/contributions/components/contribution-detail-modal";
import {
  useApproveCreatorContribution,
  useCreatorContributionStatistics,
  usePendingCreatorContributions,
  useRejectCreatorContribution,
} from "@/features/contributions/hooks/use-creator-contributions";
import type { CreatorContribution } from "@/features/contributions/types/creator-contribution";

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

function StatisticsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}

export default function CreatorContributionsPage() {
  const [page, setPage] = useState(1);
  const [viewingContributionId, setViewingContributionId] = useState<string>();
  const [processingContributionId, setProcessingContributionId] =
    useState<string>();
  const pendingQuery = usePendingCreatorContributions(page);
  const statisticsQuery = useCreatorContributionStatistics();
  const approveMutation = useApproveCreatorContribution();
  const rejectMutation = useRejectCreatorContribution();
  const contributions = pendingQuery.data?.contributions ?? [];
  const pagination = pendingQuery.data?.pagination;
  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  const approveContribution = async (
    event: MouseEvent<HTMLButtonElement>,
    contribution: CreatorContribution,
  ) => {
    const button = event.currentTarget;
    button.disabled = true;

    try {
      const confirmation = await Swal.fire({
        icon: "question",
        title: "Approve this contribution?",
        text: `${formatCredits(contribution.amount)} credits will be added to “${contribution.campaignTitle}” and to your withdrawable raised-credit balance. This can happen only once.`,
        showCancelButton: true,
        confirmButtonText: "Approve contribution",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#098A91",
        reverseButtons: true,
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      setProcessingContributionId(contribution._id);
      await approveMutation.mutateAsync(contribution._id);

      if (page > 1 && contributions.length === 1) {
        setPage((currentPage) => currentPage - 1);
      }

      toast.success("Contribution approved and campaign totals updated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to approve contribution",
      );
    } finally {
      setProcessingContributionId(undefined);
      button.disabled = false;
    }
  };

  const rejectContribution = async (
    event: MouseEvent<HTMLButtonElement>,
    contribution: CreatorContribution,
  ) => {
    const button = event.currentTarget;
    button.disabled = true;

    try {
      const confirmation = await Swal.fire<string>({
        icon: "warning",
        title: "Reject this contribution?",
        text: `${formatCredits(contribution.amount)} credits will be refunded to ${contribution.supporterName}. A rejected contribution cannot later be approved.`,
        input: "textarea",
        inputLabel: "Reason for rejection",
        inputPlaceholder:
          "Explain clearly why this contribution cannot be accepted.",
        inputAttributes: {
          maxlength: "500",
        },
        showCancelButton: true,
        confirmButtonText: "Reject and refund",
        cancelButtonText: "Keep pending",
        confirmButtonColor: "#B8404E",
        reverseButtons: true,
        focusCancel: true,
        inputValidator: (value) => {
          const reason = value.trim();

          if (reason.length < 5) {
            return "Enter a reason containing at least 5 characters";
          }

          return undefined;
        },
      });

      if (!confirmation.isConfirmed || !confirmation.value) {
        return;
      }

      setProcessingContributionId(contribution._id);
      await rejectMutation.mutateAsync({
        contributionId: contribution._id,
        reason: confirmation.value.trim(),
      });

      if (page > 1 && contributions.length === 1) {
        setPage((currentPage) => currentPage - 1);
      }

      toast.success("Contribution rejected and credits refunded");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to reject contribution",
      );
    } finally {
      setProcessingContributionId(undefined);
      button.disabled = false;
    }
  };

  return (
    <main className="flex-1 bg-canvas px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7">
          <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
            Creator workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
            Contributions to review
          </h1>
          <p className="mt-3 max-w-3xl leading-7 text-ink-muted">
            Approving moves held credits into the campaign and your raised
            balance. Rejecting returns the full amount to the Supporter.
          </p>
        </div>

        {statisticsQuery.isLoading ? (
          <StatisticsSkeleton />
        ) : statisticsQuery.isError ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F1B6BE] bg-[#FFF0F2] p-4 text-sm text-error">
            <span>Contribution statistics could not be loaded.</span>
            <button
              type="button"
              onClick={() => void statisticsQuery.refetch()}
              className="flex items-center gap-2 font-semibold"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Retry
            </button>
          </div>
        ) : statisticsQuery.data ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Pending reviews",
                value: statisticsQuery.data.pendingCount,
                detail: `${formatCredits(statisticsQuery.data.pendingCredits)} credits held`,
                icon: Hourglass,
              },
              {
                label: "Approved",
                value: statisticsQuery.data.approvedCount,
                detail: `${formatCredits(statisticsQuery.data.approvedCredits)} credits raised`,
                icon: Check,
              },
              {
                label: "Rejected",
                value: statisticsQuery.data.rejectedCount,
                detail: `${formatCredits(statisticsQuery.data.rejectedCredits)} credits returned`,
                icon: X,
              },
              {
                label: "All contributions",
                value: statisticsQuery.data.totalContributions,
                detail: `${formatCredits(statisticsQuery.data.totalCredits)} total credits`,
                icon: Coins,
              },
            ].map((statistic) => {
              const Icon = statistic.icon;

              return (
                <section
                  key={statistic.label}
                  className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink-muted">
                        {statistic.label}
                      </p>
                      <p className="mt-2 font-display text-3xl font-bold text-ink-strong">
                        {statistic.value.toLocaleString()}
                      </p>
                    </div>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-flow-100 text-flow-700">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-flow-700">
                    {statistic.detail}
                  </p>
                </section>
              );
            })}
          </div>
        ) : null}

        <section className="mt-7">
          <div className="mb-4">
            <h2 className="font-display text-2xl font-bold text-ink-strong">
              Pending queue
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Review each contribution carefully before making a final decision.
            </p>
          </div>

          {pendingQuery.isLoading ? (
            <TableSkeleton rows={5} />
          ) : pendingQuery.isError ? (
            <EmptyState
              icon={CircleAlert}
              title="Pending contributions could not be loaded"
              description={
                pendingQuery.error instanceof Error
                  ? pendingQuery.error.message
                  : "FundFlow could not reach the contribution service."
              }
              action={
                <Button onClick={() => void pendingQuery.refetch()}>
                  Try again
                </Button>
              }
            />
          ) : contributions.length === 0 && page === 1 ? (
            <EmptyState
              icon={HandCoins}
              title="No contributions are waiting"
              description="New supporter contributions for your campaigns will appear here for review."
            />
          ) : (
            <>
              <Table className="min-w-[920px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Supporter name</TableHead>
                    <TableHead>Campaign title</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>View</TableHead>
                    <TableHead>Approve</TableHead>
                    <TableHead>Reject</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((contribution) => {
                    const isCurrentContribution =
                      processingContributionId === contribution._id;

                    return (
                      <TableRow key={contribution._id}>
                        <TableCell className="font-semibold text-ink-strong">
                          {contribution.supporterName}
                        </TableCell>
                        <TableCell>
                          <p className="max-w-64 truncate">
                            {contribution.campaignTitle}
                          </p>
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
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={
                              <Eye aria-hidden="true" className="size-4" />
                            }
                            disabled={isProcessing}
                            onClick={() =>
                              setViewingContributionId(contribution._id)
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            leftIcon={
                              <Check aria-hidden="true" className="size-4" />
                            }
                            isLoading={
                              isCurrentContribution && approveMutation.isPending
                            }
                            disabled={isProcessing}
                            onClick={(event) =>
                              void approveContribution(event, contribution)
                            }
                          >
                            Approve
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            leftIcon={
                              <X aria-hidden="true" className="size-4" />
                            }
                            isLoading={
                              isCurrentContribution && rejectMutation.isPending
                            }
                            disabled={isProcessing}
                            onClick={(event) =>
                              void rejectContribution(event, contribution)
                            }
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 ? (
                <nav
                  aria-label="Contribution review pages"
                  className="mt-6 flex items-center justify-between gap-4"
                >
                  <p className="text-sm text-ink-muted">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={
                        page <= 1 || pendingQuery.isFetching || isProcessing
                      }
                      onClick={() =>
                        setPage((currentPage) => Math.max(1, currentPage - 1))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={
                        page >= pagination.totalPages ||
                        pendingQuery.isFetching ||
                        isProcessing
                      }
                      onClick={() => setPage((currentPage) => currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </nav>
              ) : null}
            </>
          )}
        </section>
      </div>

      <ContributionDetailModal
        contributionId={viewingContributionId}
        onClose={() => setViewingContributionId(undefined)}
      />
    </main>
  );
}
