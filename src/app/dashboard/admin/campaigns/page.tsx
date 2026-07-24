"use client";

import { format } from "date-fns";
import {
  Check,
  CircleAlert,
  Eye,
  FolderSearch,
  LoaderCircle,
  X,
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
import { AdminCampaignDetailModal } from "@/features/campaigns/components/admin-campaign-detail-modal";
import {
  useAdminPendingCampaigns,
  useApproveAdminCampaign,
  useRejectAdminCampaign,
} from "@/features/campaigns/hooks/use-admin-campaigns";
import type { AdminPendingCampaign } from "@/features/campaigns/types/admin-campaign";

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export default function AdminCampaignApprovalsPage() {
  const [page, setPage] = useState(1);
  const [viewingCampaign, setViewingCampaign] =
    useState<AdminPendingCampaign>();
  const [processingCampaignId, setProcessingCampaignId] = useState<string>();
  const pendingQuery = useAdminPendingCampaigns(page);
  const approveMutation = useApproveAdminCampaign();
  const rejectMutation = useRejectAdminCampaign();
  const campaigns = pendingQuery.data?.campaigns ?? [];
  const pagination = pendingQuery.data?.pagination;
  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  const moveFromEmptyPage = () => {
    if (page > 1 && campaigns.length === 1) {
      setPage((currentPage) => currentPage - 1);
    }
  };

  const approveCampaign = async (
    event: MouseEvent<HTMLButtonElement>,
    campaign: AdminPendingCampaign,
  ) => {
    const button = event.currentTarget;
    button.disabled = true;

    try {
      const confirmation = await Swal.fire({
        icon: "question",
        title: "Approve this campaign?",
        text: `“${campaign.title}” will become visible to supporters and can begin receiving contributions.`,
        showCancelButton: true,
        confirmButtonText: "Approve campaign",
        cancelButtonText: "Keep pending",
        confirmButtonColor: "#098A91",
        reverseButtons: true,
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      setProcessingCampaignId(campaign._id);
      await approveMutation.mutateAsync(campaign._id);
      setViewingCampaign(undefined);
      moveFromEmptyPage();
      toast.success("Campaign approved and Creator notified");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to approve campaign",
      );
    } finally {
      setProcessingCampaignId(undefined);
      button.disabled = false;
    }
  };

  const rejectCampaign = async (
    event: MouseEvent<HTMLButtonElement>,
    campaign: AdminPendingCampaign,
  ) => {
    const button = event.currentTarget;
    button.disabled = true;

    try {
      const confirmation = await Swal.fire<string>({
        icon: "warning",
        title: "Reject this campaign?",
        text: `“${campaign.title}” will be removed from the pending queue and the Creator will be notified.`,
        input: "textarea",
        inputLabel: "Reason for rejection (optional)",
        inputPlaceholder:
          "Explain what should be corrected before submitting another campaign.",
        inputAttributes: { maxlength: "500" },
        showCancelButton: true,
        confirmButtonText: "Reject campaign",
        cancelButtonText: "Keep pending",
        confirmButtonColor: "#B83C4A",
        reverseButtons: true,
        focusCancel: true,
        inputValidator: (value) => {
          const reason = value.trim();
          if (reason.length > 0 && reason.length < 5) {
            return "Use at least 5 characters, or leave the reason empty";
          }
          return undefined;
        },
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      setProcessingCampaignId(campaign._id);
      const reason = confirmation.value?.trim();
      await rejectMutation.mutateAsync({
        campaignId: campaign._id,
        ...(reason ? { reason } : {}),
      });
      setViewingCampaign(undefined);
      moveFromEmptyPage();
      toast.success("Campaign rejected and Creator notified");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to reject campaign",
      );
    } finally {
      setProcessingCampaignId(undefined);
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
          Campaign approvals
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
          Review newly submitted campaigns before they become visible to
          supporters.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {pagination
            ? `${pagination.total.toLocaleString()} pending campaign${pagination.total === 1 ? "" : "s"}`
            : "Loading pending campaign count…"}
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
          title="Pending campaigns could not be loaded"
          description={
            pendingQuery.error instanceof Error
              ? pendingQuery.error.message
              : "FundFlow could not reach the campaign review service."
          }
          action={
            <Button onClick={() => void pendingQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title="No campaigns awaiting review"
          description="New Creator submissions will appear here automatically."
        />
      ) : (
        <>
          <div className="space-y-4 lg:hidden">
            {campaigns.map((campaign) => (
              <article
                key={campaign._id}
                className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]"
              >
                <div>
                  <p className="text-xs font-bold tracking-wide text-flow-700 uppercase">
                    {campaign.category}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold text-ink-strong">
                    {campaign.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">
                    By {campaign.creatorName}
                  </p>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-ink-muted">Goal</dt>
                    <dd className="mt-1 font-semibold text-ink-strong">
                      {formatCredits(campaign.fundingGoal)} credits
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Deadline</dt>
                    <dd className="mt-1 font-semibold text-ink-strong">
                      {format(new Date(campaign.deadline), "MMM d, yyyy")}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-ink-muted">Submitted</dt>
                    <dd className="mt-1 font-semibold text-ink-strong">
                      {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => setViewingCampaign(campaign)}
                    aria-label={`View ${campaign.title}`}
                  >
                    <Eye aria-hidden="true" className="size-4" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    disabled={isProcessing}
                    isLoading={
                      processingCampaignId === campaign._id &&
                      approveMutation.isPending
                    }
                    onClick={(event) => void approveCampaign(event, campaign)}
                    aria-label={`Approve ${campaign.title}`}
                  >
                    <Check aria-hidden="true" className="size-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isProcessing}
                    isLoading={
                      processingCampaignId === campaign._id &&
                      rejectMutation.isPending
                    }
                    onClick={(event) => void rejectCampaign(event, campaign)}
                    aria-label={`Reject ${campaign.title}`}
                  >
                    <X aria-hidden="true" className="size-4" />
                    Reject
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden lg:block">
            <Table className="min-w-[1120px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign title</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Submission date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const isCurrent = processingCampaignId === campaign._id;

                  return (
                    <TableRow key={campaign._id}>
                      <TableCell className="max-w-56 font-semibold text-ink-strong">
                        {campaign.title}
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-ink-strong">
                          {campaign.creatorName}
                        </p>
                        <p className="text-xs text-ink-muted">
                          {campaign.creatorEmail}
                        </p>
                      </TableCell>
                      <TableCell>{campaign.category}</TableCell>
                      <TableCell>
                        {formatCredits(campaign.fundingGoal)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(campaign.deadline), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            disabled={isProcessing}
                            onClick={() => setViewingCampaign(campaign)}
                            aria-label={`View ${campaign.title}`}
                          >
                            <Eye aria-hidden="true" className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            disabled={isProcessing}
                            onClick={(event) =>
                              void approveCampaign(event, campaign)
                            }
                            aria-label={`Approve ${campaign.title}`}
                          >
                            {isCurrent && approveMutation.isPending ? (
                              <LoaderCircle
                                aria-hidden="true"
                                className="size-4 animate-spin"
                              />
                            ) : (
                              <Check aria-hidden="true" className="size-4" />
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            disabled={isProcessing}
                            onClick={(event) =>
                              void rejectCampaign(event, campaign)
                            }
                            aria-label={`Reject ${campaign.title}`}
                          >
                            {isCurrent && rejectMutation.isPending ? (
                              <LoaderCircle
                                aria-hidden="true"
                                className="size-4 animate-spin"
                              />
                            ) : (
                              <X aria-hidden="true" className="size-4" />
                            )}
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
          aria-label="Pending campaign pagination"
          className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-4 sm:flex-row"
        >
          <p className="text-sm text-ink-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1 || isProcessing}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={
                pagination.page >= pagination.totalPages || isProcessing
              }
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}

      <AdminCampaignDetailModal
        campaign={viewingCampaign}
        onClose={() => setViewingCampaign(undefined)}
      />
    </div>
  );
}
