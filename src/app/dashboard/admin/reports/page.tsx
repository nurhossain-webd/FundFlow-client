"use client";

import { format } from "date-fns";
import {
  Ban,
  CircleAlert,
  ExternalLink,
  FileCheck2,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import Link from "next/link";
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
import {
  useAdminReports,
  useDeleteReportedCampaign,
  useResolveAdminReport,
  useSuspendReportedCampaign,
} from "@/features/reports/hooks/use-admin-reports";
import type {
  AdminCampaignReport,
  AdminCampaignReportFilters,
  CampaignReportReason,
  CampaignReportStatus,
} from "@/features/reports/types/admin-report";

const statuses: CampaignReportStatus[] = [
  "pending",
  "under_review",
  "resolved",
  "dismissed",
];
const validStatuses = new Set(statuses);

const statusPresentation = {
  pending: { label: "Pending", variant: "warning" },
  under_review: { label: "Under review", variant: "info" },
  resolved: { label: "Resolved", variant: "success" },
  dismissed: { label: "Dismissed", variant: "neutral" },
} as const;

const reasonLabels: Record<CampaignReportReason, string> = {
  fraud: "Suspected fraud",
  misleading_information: "Misleading information",
  prohibited_content: "Prohibited content",
  harassment: "Harassment",
  spam: "Spam",
  other: "Other concern",
};

const getFilters = (
  parameters: Pick<URLSearchParams, "get">,
): AdminCampaignReportFilters => {
  const page = Number(parameters.get("page"));
  const status = parameters.get("status");
  const search = parameters.get("search")?.trim();

  return {
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    limit: 10,
    ...(search ? { search } : {}),
    ...(status && validStatuses.has(status as CampaignReportStatus)
      ? { status: status as CampaignReportStatus }
      : {}),
  };
};

export default function AdminReportsPage() {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const filters = getFilters(searchParameters);
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [processing, setProcessing] = useState<string>();
  const reportsQuery = useAdminReports(filters);
  const resolveMutation = useResolveAdminReport();
  const suspendMutation = useSuspendReportedCampaign();
  const deleteMutation = useDeleteReportedCampaign();
  const reports = reportsQuery.data?.reports ?? [];
  const pagination = reportsQuery.data?.pagination;
  const isProcessing =
    resolveMutation.isPending ||
    suspendMutation.isPending ||
    deleteMutation.isPending;

  const updateParameters = (
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const next = new URLSearchParams(searchParameters.toString());
    Object.entries(updates).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    if (resetPage) next.set("page", "1");
    const query = next.toString();
    startTransition(() =>
      router.replace(
        query
          ? `/dashboard/admin/reports?${query}`
          : "/dashboard/admin/reports",
        { scroll: false },
      ),
    );
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParameters({ search: searchInput.trim() || undefined });
  };

  const afterAction = () => {
    if (filters.page > 1 && reports.length === 1) {
      updateParameters({ page: String(filters.page - 1) }, false);
    }
  };

  const resolveReport = async (report: AdminCampaignReport) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Resolve this report?",
      input: "textarea",
      inputLabel: "Resolution note (optional)",
      inputPlaceholder: "Record how this report was reviewed.",
      inputAttributes: { maxlength: "2000" },
      showCancelButton: true,
      confirmButtonText: "Mark resolved",
      confirmButtonColor: "#087F72",
    });
    if (!result.isConfirmed) return;

    try {
      setProcessing(`resolve-${report.id}`);
      await resolveMutation.mutateAsync({
        reportId: report.id,
        resolutionNote: String(result.value ?? "").trim() || undefined,
      });
      afterAction();
      toast.success("Report marked as resolved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setProcessing(undefined);
    }
  };

  const suspendCampaign = async (report: AdminCampaignReport) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Suspend this campaign?",
      text: "The campaign will immediately disappear from public discovery and its Creator will be notified.",
      input: "textarea",
      inputLabel: "Reason for suspension (optional)",
      inputAttributes: { maxlength: "2000" },
      showCancelButton: true,
      confirmButtonText: "Suspend campaign",
      confirmButtonColor: "#8A5A08",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    try {
      setProcessing(`suspend-${report.id}`);
      await suspendMutation.mutateAsync({
        reportId: report.id,
        resolutionNote: String(result.value ?? "").trim() || undefined,
      });
      afterAction();
      toast.success("Campaign suspended and report resolved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setProcessing(undefined);
    }
  };

  const deleteCampaign = async (report: AdminCampaignReport) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Permanently delete this campaign?",
      text: "Approved contributions will be refunded and financial balances adjusted transactionally. This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete and process refunds",
      cancelButtonText: "Keep campaign",
      confirmButtonColor: "#B83C4A",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    try {
      setProcessing(`delete-${report.id}`);
      const deletion = await deleteMutation.mutateAsync(report.campaignId);
      afterAction();
      toast.success(
        deletion.refundedCredits > 0
          ? `Campaign deleted and ${deletion.refundedCredits.toLocaleString()} credits refunded`
          : "Campaign deleted successfully",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setProcessing(undefined);
    }
  };

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-bold tracking-[0.14em] text-flow-700 uppercase">
          Trust and safety
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.035em] text-ink-strong sm:text-4xl">
          Campaign reports
        </h1>
        <p className="mt-3 max-w-3xl leading-7 text-ink-muted">
          Review supporter concerns, investigate campaigns, and take accountable
          action while preserving FundFlow&apos;s financial safeguards.
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-border-subtle bg-white p-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <form onSubmit={submitSearch} className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search reports</span>
            <Search className="absolute top-3 left-3 size-5 text-ink-muted" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search reporter, campaign, or Creator"
              maxLength={100}
              className="h-11 w-full rounded-[10px] border border-border bg-white pr-4 pl-10 text-sm text-ink-strong outline-none focus:border-flow-600 focus:ring-4 focus:ring-flow-100"
            />
          </label>
          <Button type="submit">Search</Button>
        </form>
        <label>
          <span className="sr-only">Filter by report status</span>
          <select
            value={filters.status ?? ""}
            onChange={(event) =>
              updateParameters({ status: event.target.value || undefined })
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

      <div className="flex items-center justify-between gap-4 text-sm text-ink-muted">
        <p>
          {pagination
            ? `${pagination.total.toLocaleString()} report${pagination.total === 1 ? "" : "s"}`
            : "Loading report count…"}
        </p>
        {isNavigating || reportsQuery.isFetching ? (
          <span role="status">Updating…</span>
        ) : null}
      </div>

      {reportsQuery.isLoading ? (
        <TableSkeleton rows={7} />
      ) : reportsQuery.isError ? (
        <EmptyState
          icon={CircleAlert}
          title="Reports could not be loaded"
          description={
            reportsQuery.error instanceof Error
              ? reportsQuery.error.message
              : "FundFlow could not reach the report service."
          }
          action={
            <Button onClick={() => void reportsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No matching reports"
          description="No campaign reports match the current search and status filter."
        />
      ) : (
        <>
          <div className="space-y-4 xl:hidden">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                disabled={isProcessing}
                processing={processing}
                onResolve={() => void resolveReport(report)}
                onSuspend={() => void suspendCampaign(report)}
                onDelete={() => void deleteCampaign(report)}
              />
            ))}
          </div>

          <div className="hidden xl:block">
            <Table className="min-w-[1500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Campaign / Creator</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Detailed explanation</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="align-top">
                      <p className="font-semibold text-ink-strong">
                        {report.reporterName}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {report.reporterEmail}
                      </p>
                    </TableCell>
                    <TableCell className="align-top">
                      <p className="max-w-56 font-semibold text-ink-strong">
                        {report.campaignTitle}
                      </p>
                      <p className="mt-1 text-xs text-ink-muted">
                        {report.creatorName}
                      </p>
                    </TableCell>
                    <TableCell className="align-top">
                      {reasonLabels[report.reason]}
                    </TableCell>
                    <TableCell className="max-w-sm align-top">
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {report.details}
                      </p>
                    </TableCell>
                    <TableCell className="align-top">
                      {format(new Date(report.reportDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="align-top">
                      <ReportStatus status={report.status} />
                    </TableCell>
                    <TableCell className="align-top">
                      <ReportActions
                        report={report}
                        disabled={isProcessing}
                        processing={processing}
                        onResolve={() => void resolveReport(report)}
                        onSuspend={() => void suspendCampaign(report)}
                        onDelete={() => void deleteCampaign(report)}
                      />
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
          aria-label="Report pagination"
          className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white p-4 sm:flex-row"
        >
          <p className="text-sm text-ink-muted">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page <= 1 || isNavigating || isProcessing}
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
                isProcessing
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

function ReportStatus({ status }: { status: CampaignReportStatus }) {
  const item = statusPresentation[status];
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

interface ActionProps {
  report: AdminCampaignReport;
  disabled: boolean;
  processing?: string;
  onResolve: () => void;
  onSuspend: () => void;
  onDelete: () => void;
}

function ReportActions(props: ActionProps) {
  const active =
    props.report.status === "pending" || props.report.status === "under_review";
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Link
        href={`/campaigns/${props.report.campaignId}`}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-border bg-white px-4 text-sm font-semibold text-flow-700 transition hover:border-flow-600 hover:bg-flow-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-flow-100"
      >
        <ExternalLink className="size-4" /> View
      </Link>
      <Button
        size="sm"
        variant="secondary"
        disabled={props.disabled || !active}
        isLoading={props.processing === `suspend-${props.report.id}`}
        onClick={props.onSuspend}
        leftIcon={<Ban className="size-4" />}
      >
        Suspend
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={props.disabled}
        isLoading={props.processing === `delete-${props.report.id}`}
        onClick={props.onDelete}
        leftIcon={<Trash2 className="size-4" />}
      >
        Delete
      </Button>
      <Button
        size="sm"
        disabled={props.disabled || !active}
        isLoading={props.processing === `resolve-${props.report.id}`}
        onClick={props.onResolve}
        leftIcon={<FileCheck2 className="size-4" />}
      >
        Resolve
      </Button>
    </div>
  );
}

function ReportCard(props: ActionProps) {
  const { report } = props;
  return (
    <article className="rounded-2xl border border-border-subtle bg-white p-5 shadow-[0_8px_30px_rgba(6,47,53,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-flow-700 uppercase">
            {reasonLabels[report.reason]}
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-ink-strong">
            {report.campaignTitle}
          </h2>
        </div>
        <ReportStatus status={report.status} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <Data label="Reporter" value={report.reporterName} />
        <Data label="Creator" value={report.creatorName} />
        <Data
          label="Reported"
          value={format(new Date(report.reportDate), "MMM d, yyyy")}
        />
      </dl>
      <div className="mt-4 rounded-xl bg-surface-muted p-4">
        <p className="text-xs font-bold tracking-wide text-ink-muted uppercase">
          Detailed explanation
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-strong">
          {report.details}
        </p>
      </div>
      <div className="mt-5">
        <ReportActions {...props} />
      </div>
    </article>
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
