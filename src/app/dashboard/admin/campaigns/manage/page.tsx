"use client";

import { format } from "date-fns";
import { CircleAlert, Eye, FolderSearch, Search, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

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
import { AdminCampaignDetailModal } from "@/features/campaigns/components/admin-campaign-detail-modal";
import {
  useAdminCampaigns,
  useDeleteAdminCampaign,
} from "@/features/campaigns/hooks/use-admin-campaigns";
import type {
  AdminCampaign,
  AdminCampaignFilters,
  AdminCampaignStatus,
} from "@/features/campaigns/types/admin-campaign";

const statuses: AdminCampaignStatus[] = [
  "pending",
  "approved",
  "rejected",
  "suspended",
];
const validStatuses = new Set(statuses);

const statusPresentation: Record<
  AdminCampaignStatus,
  {
    label: string;
    variant: "warning" | "success" | "error" | "info";
  }
> = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "error" },
  suspended: { label: "Suspended", variant: "info" },
};

const getFilters = (
  parameters: Pick<URLSearchParams, "get">,
): AdminCampaignFilters => {
  const page = Number(parameters.get("page"));
  const status = parameters.get("status");
  const search = parameters.get("search")?.trim();

  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    limit: 10,
    ...(search ? { search } : {}),
    ...(status && validStatuses.has(status as AdminCampaignStatus)
      ? { status: status as AdminCampaignStatus }
      : {}),
  };
};

function StatusBadge({ status }: { status: AdminCampaignStatus }) {
  const presentation = statusPresentation[status];
  return <Badge variant={presentation.variant}>{presentation.label}</Badge>;
}

export default function AdminManageCampaignsPage() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const filters = getFilters(searchParameters);
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [viewingCampaign, setViewingCampaign] = useState<AdminCampaign>();
  const [deletingCampaignId, setDeletingCampaignId] = useState<string>();
  const campaignQuery = useAdminCampaigns(filters);
  const deleteMutation = useDeleteAdminCampaign();
  const campaigns = campaignQuery.data?.campaigns ?? [];
  const pagination = campaignQuery.data?.pagination;

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
          ? `/dashboard/admin/campaigns/manage?${query}`
          : "/dashboard/admin/campaigns/manage",
        { scroll: false },
      );
    });
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParameters({ search: searchInput.trim() || undefined });
  };

  const removeCampaign = async (campaign: AdminCampaign) => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this campaign?",
      text: `“${campaign.title}” will be permanently removed. Approved contributions will be refunded safely and campaign and Creator balances will be adjusted transactionally.`,
      showCancelButton: true,
      confirmButtonText: "Delete and process refunds",
      cancelButtonText: "Keep campaign",
      confirmButtonColor: "#B83C4A",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      setDeletingCampaignId(campaign._id);
      const result = await deleteMutation.mutateAsync(campaign._id);
      setViewingCampaign(undefined);

      if (filters.page > 1 && campaigns.length === 1) {
        updateParameters({ page: String(filters.page - 1) }, false);
      }

      toast.success(
        result.refundedCredits > 0
          ? `Campaign deleted and ${result.refundedCredits.toLocaleString()} credits refunded`
          : "Campaign deleted successfully",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete campaign",
      );
    } finally {
      setDeletingCampaignId(undefined);
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
          Administration
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
          Manage campaigns
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-ink-muted">
          Find campaigns across every review state, inspect their details, and
          remove them with safe supporter refunds.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border-subtle bg-white p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <form onSubmit={submitSearch} className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search by campaign or Creator</span>
            <Search
              aria-hidden="true"
              className="absolute top-3 left-3 size-5 text-ink-muted"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search campaign or Creator"
              maxLength={100}
              className="h-11 w-full rounded-[10px] border border-border bg-white pr-4 pl-10 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
            />
          </label>
          <Button type="submit">Search</Button>
        </form>
        <label>
          <span className="sr-only">Filter by campaign status</span>
          <select
            value={filters.status ?? ""}
            onChange={(event) =>
              updateParameters({
                status: event.target.value || undefined,
              })
            }
            className="h-11 w-full rounded-[10px] border border-border bg-white px-3 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {statusPresentation[status].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-muted">
          {pagination
            ? `${pagination.total.toLocaleString()} campaign${pagination.total === 1 ? "" : "s"}`
            : "Loading campaign count…"}
        </p>
        {isNavigating || campaignQuery.isFetching ? (
          <span className="text-sm text-ink-muted" role="status">
            Updating…
          </span>
        ) : null}
      </div>

      {campaignQuery.isLoading ? (
        <TableSkeleton rows={7} />
      ) : campaignQuery.isError ? (
        <EmptyState
          icon={CircleAlert}
          title="Campaigns could not be loaded"
          description={
            campaignQuery.error instanceof Error
              ? campaignQuery.error.message
              : "FundFlow could not reach the campaign service."
          }
          action={
            <Button onClick={() => void campaignQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={FolderSearch}
          title="No matching campaigns"
          description="Try another campaign title, Creator, or status filter."
        />
      ) : (
        <>
          <div className="space-y-4 lg:hidden">
            {campaigns.map((campaign) => (
              <article
                key={campaign._id}
                className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-wide text-flow-700 uppercase">
                      {campaign.category}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold text-ink-strong">
                      {campaign.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">
                      {campaign.creatorName} · {campaign.creatorEmail}
                    </p>
                  </div>
                  <StatusBadge status={campaign.status} />
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                  <Data
                    label="Goal"
                    value={`${campaign.fundingGoal.toLocaleString()} credits`}
                  />
                  <Data
                    label="Raised"
                    value={`${campaign.amountRaised.toLocaleString()} credits`}
                  />
                  <Data
                    label="Deadline"
                    value={format(new Date(campaign.deadline), "MMM d, yyyy")}
                  />
                  <Data
                    label="Submitted"
                    value={format(new Date(campaign.createdAt), "MMM d, yyyy")}
                  />
                </dl>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button
                    variant="secondary"
                    disabled={deleteMutation.isPending}
                    onClick={() => setViewingCampaign(campaign)}
                    leftIcon={<Eye aria-hidden="true" className="size-4" />}
                  >
                    View
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    isLoading={
                      deletingCampaignId === campaign._id &&
                      deleteMutation.isPending
                    }
                    loadingText="Deleting…"
                    onClick={() => void removeCampaign(campaign)}
                    leftIcon={<Trash2 aria-hidden="true" className="size-4" />}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden lg:block">
            <Table className="min-w-[1120px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Goal / raised</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign._id}>
                    <TableCell>
                      <p className="max-w-64 font-semibold text-ink-strong">
                        {campaign.title}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {campaign.category} · Submitted{" "}
                        {format(new Date(campaign.createdAt), "MMM d, yyyy")}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold text-ink-strong">
                        {campaign.creatorName}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {campaign.creatorEmail}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p>{campaign.fundingGoal.toLocaleString()} goal</p>
                      <p className="text-xs text-ink-muted">
                        {campaign.amountRaised.toLocaleString()} raised
                      </p>
                    </TableCell>
                    <TableCell>
                      {format(new Date(campaign.deadline), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={campaign.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => setViewingCampaign(campaign)}
                          leftIcon={
                            <Eye aria-hidden="true" className="size-4" />
                          }
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          isLoading={
                            deletingCampaignId === campaign._id &&
                            deleteMutation.isPending
                          }
                          loadingText="Deleting…"
                          onClick={() => void removeCampaign(campaign)}
                          leftIcon={
                            <Trash2 aria-hidden="true" className="size-4" />
                          }
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
        </>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <nav
          aria-label="Campaign pagination"
          className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-4 sm:flex-row"
        >
          <p className="text-sm text-ink-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={
                pagination.page <= 1 || isNavigating || deleteMutation.isPending
              }
              onClick={() =>
                updateParameters({ page: String(pagination.page - 1) }, false)
              }
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={
                pagination.page >= pagination.totalPages ||
                isNavigating ||
                deleteMutation.isPending
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

      <AdminCampaignDetailModal
        campaign={viewingCampaign}
        onClose={() => setViewingCampaign(undefined)}
      />
    </div>
  );
}

function Data({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-ink-strong">{value}</dd>
    </div>
  );
}
