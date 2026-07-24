"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  CircleAlert,
  Coins,
  FilePlus2,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UpdateCampaignModal } from "@/features/campaigns/components/update-campaign-modal";
import {
  useCreatorCampaigns,
  useDeleteCreatorCampaign,
} from "@/features/campaigns/hooks/use-creator-campaigns";
import type {
  CampaignStatus,
  CreatorCampaign,
} from "@/features/campaigns/services/campaign.service";

const statusPresentation: Record<
  CampaignStatus,
  {
    label: string;
    variant: "success" | "warning" | "error" | "neutral";
  }
> = {
  approved: { label: "Approved", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  rejected: { label: "Rejected", variant: "error" },
  suspended: { label: "Suspended", variant: "neutral" },
};

const formatCredits = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const presentation = statusPresentation[status];

  return <Badge variant={presentation.variant}>{presentation.label}</Badge>;
}

function CampaignsLoadingState() {
  return (
    <>
      <div
        className="hidden space-y-3 md:block"
        aria-label="Loading your campaigns"
      >
        <Skeleton className="h-14 w-full rounded-2xl" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 md:hidden" aria-label="Loading your campaigns">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    </>
  );
}

export default function CreatorCampaignsPage() {
  const [page, setPage] = useState(1);
  const [editingCampaign, setEditingCampaign] = useState<CreatorCampaign>();
  const campaignsQuery = useCreatorCampaigns(page);
  const deleteCampaign = useDeleteCreatorCampaign();
  const campaigns = campaignsQuery.data?.campaigns ?? [];
  const pagination = campaignsQuery.data?.pagination;

  const confirmDelete = async (campaign: CreatorCampaign) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this campaign?",
      text: `${campaign.title} will be permanently removed. All pending and approved supporter contributions will be refunded safely. Approved credits will also be reversed from your raised balance.`,
      showCancelButton: true,
      confirmButtonText: "Delete and refund",
      cancelButtonText: "Keep campaign",
      confirmButtonColor: "#B8404E",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const result = await deleteCampaign.mutateAsync(campaign._id);

      if (page > 1 && campaigns.length === 1) {
        setPage((currentPage) => currentPage - 1);
      }

      await Swal.fire({
        icon: "success",
        title: "Campaign deleted",
        text:
          result.refundedCredits > 0
            ? `${formatCredits(result.refundedCredits)} credits were refunded across ${result.refundedSupporters} supporter account${result.refundedSupporters === 1 ? "" : "s"}.`
            : "The campaign was removed. There were no refundable contributions.",
        confirmButtonColor: "#098A91",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete campaign",
      );
    }
  };

  return (
    <div className="min-w-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
              Creator workspace
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
              My campaigns
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
              Track funding progress, revise campaign details, and manage every
              campaign submitted from your verified creator account.
            </p>
          </div>
          <Link
            href="/dashboard/creator/campaigns/new"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-flow-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-flow-700"
          >
            <FilePlus2 aria-hidden="true" className="size-4" />
            Add campaign
          </Link>
        </div>

        {campaignsQuery.isLoading ? (
          <CampaignsLoadingState />
        ) : campaignsQuery.isError ? (
          <EmptyState
            icon={CircleAlert}
            title="Your campaigns could not be loaded"
            description={
              campaignsQuery.error instanceof Error
                ? campaignsQuery.error.message
                : "FundFlow could not reach the campaign service."
            }
            action={
              <Button onClick={() => void campaignsQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : campaigns.length === 0 && page === 1 ? (
          <EmptyState
            icon={FilePlus2}
            title="You have not submitted a campaign yet"
            description="Start with a clear story and realistic goal. New campaigns are sent to an administrator for review."
            action={
              <Link
                href="/dashboard/creator/campaigns/new"
                className="inline-flex h-11 items-center justify-center rounded-[10px] bg-flow-600 px-5 text-sm font-semibold text-white hover:bg-flow-700"
              >
                Create your first campaign
              </Link>
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Goal</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign._id}>
                      <TableCell>
                        <p className="max-w-xs font-semibold text-ink-strong">
                          {campaign.title}
                        </p>
                      </TableCell>
                      <TableCell>
                        {format(new Date(campaign.deadline), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {formatCredits(campaign.fundingGoal)} credits
                      </TableCell>
                      <TableCell>
                        {formatCredits(campaign.amountRaised)} credits
                      </TableCell>
                      <TableCell>
                        <CampaignStatusBadge status={campaign.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={
                              <Pencil aria-hidden="true" className="size-4" />
                            }
                            onClick={() => setEditingCampaign(campaign)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            leftIcon={
                              <Trash2 aria-hidden="true" className="size-4" />
                            }
                            disabled={deleteCampaign.isPending}
                            onClick={() => void confirmDelete(campaign)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-4 md:hidden">
              {campaigns.map((campaign) => (
                <article
                  key={campaign._id}
                  className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-lg leading-6 font-bold text-ink-strong">
                      {campaign.title}
                    </h2>
                    <CampaignStatusBadge status={campaign.status} />
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border-subtle py-4 text-sm">
                    <div>
                      <dt className="flex items-center gap-1.5 text-ink-muted">
                        <CalendarDays aria-hidden="true" className="size-4" />
                        Deadline
                      </dt>
                      <dd className="mt-1 font-semibold text-ink-strong">
                        {format(new Date(campaign.deadline), "MMM d, yyyy")}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5 text-ink-muted">
                        <Coins aria-hidden="true" className="size-4" />
                        Funding
                      </dt>
                      <dd className="mt-1 font-semibold text-ink-strong">
                        {formatCredits(campaign.amountRaised)} /{" "}
                        {formatCredits(campaign.fundingGoal)}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      leftIcon={
                        <Pencil aria-hidden="true" className="size-4" />
                      }
                      onClick={() => setEditingCampaign(campaign)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      leftIcon={
                        <Trash2 aria-hidden="true" className="size-4" />
                      }
                      disabled={deleteCampaign.isPending}
                      onClick={() => void confirmDelete(campaign)}
                    >
                      Delete
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <nav
                aria-label="Campaign pages"
                className="mt-6 flex items-center justify-between gap-4"
              >
                <p className="text-sm text-ink-muted">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1 || campaignsQuery.isFetching}
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
                      page >= pagination.totalPages || campaignsQuery.isFetching
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
      </div>

      <UpdateCampaignModal
        campaign={editingCampaign}
        onClose={() => setEditingCampaign(undefined)}
      />
    </div>
  );
}
