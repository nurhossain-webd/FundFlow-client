"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  adminCampaignsQueryKey,
  adminPendingCampaignsQueryKey,
} from "@/features/campaigns/hooks/use-admin-campaigns";
import { deleteAdminCampaign } from "@/features/campaigns/services/admin-campaign.service";
import { adminDashboardQueryKey } from "@/features/dashboard/hooks/use-admin-dashboard";

import {
  getAdminReports,
  resolveAdminReport,
  suspendReportedCampaign,
} from "../services/admin-report.service";
import type { AdminCampaignReportFilters } from "../types/admin-report";

export const adminReportsQueryKey = ["reports", "admin"] as const;

export const useAdminReports = (filters: AdminCampaignReportFilters) =>
  useQuery({
    queryKey: [...adminReportsQueryKey, filters],
    queryFn: () => getAdminReports(filters),
    placeholderData: keepPreviousData,
  });

const useRefreshReportData = () => {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminReportsQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminCampaignsQueryKey }),
      queryClient.invalidateQueries({
        queryKey: adminPendingCampaignsQueryKey,
      }),
      queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey }),
      queryClient.invalidateQueries({ queryKey: ["campaigns", "explore"] }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
    ]);
  };
};

export const useResolveAdminReport = () => {
  const refresh = useRefreshReportData();
  return useMutation({
    mutationFn: ({
      reportId,
      resolutionNote,
    }: {
      reportId: string;
      resolutionNote?: string;
    }) => resolveAdminReport(reportId, resolutionNote),
    onSuccess: refresh,
  });
};

export const useSuspendReportedCampaign = () => {
  const refresh = useRefreshReportData();
  return useMutation({
    mutationFn: ({
      reportId,
      resolutionNote,
    }: {
      reportId: string;
      resolutionNote?: string;
    }) => suspendReportedCampaign(reportId, resolutionNote),
    onSuccess: refresh,
  });
};

export const useDeleteReportedCampaign = () => {
  const refresh = useRefreshReportData();
  return useMutation({
    mutationFn: deleteAdminCampaign,
    onSuccess: refresh,
  });
};
