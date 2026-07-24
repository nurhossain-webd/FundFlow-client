"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { adminDashboardQueryKey } from "@/features/dashboard/hooks/use-admin-dashboard";

import {
  approveAdminCampaign,
  deleteAdminCampaign,
  getAdminCampaigns,
  getAdminPendingCampaigns,
  rejectAdminCampaign,
} from "../services/admin-campaign.service";
import type { AdminCampaignFilters } from "../types/admin-campaign";

export const adminPendingCampaignsQueryKey = [
  "campaigns",
  "admin",
  "pending",
] as const;
export const adminCampaignsQueryKey = ["campaigns", "admin", "all"] as const;

export const useAdminPendingCampaigns = (page: number) =>
  useQuery({
    queryKey: [...adminPendingCampaignsQueryKey, page],
    queryFn: () => getAdminPendingCampaigns(page),
    placeholderData: keepPreviousData,
  });

export const useAdminCampaigns = (filters: AdminCampaignFilters) =>
  useQuery({
    queryKey: [...adminCampaignsQueryKey, filters],
    queryFn: () => getAdminCampaigns(filters),
    placeholderData: keepPreviousData,
  });

const useRefreshAdminCampaignData = () => {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: adminPendingCampaignsQueryKey,
      }),
      queryClient.invalidateQueries({ queryKey: adminCampaignsQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey }),
      queryClient.invalidateQueries({ queryKey: ["home"] }),
      queryClient.invalidateQueries({ queryKey: ["campaigns", "explore"] }),
    ]);
  };
};

export const useApproveAdminCampaign = () => {
  const refresh = useRefreshAdminCampaignData();
  return useMutation({
    mutationFn: approveAdminCampaign,
    onSuccess: refresh,
  });
};

export const useRejectAdminCampaign = () => {
  const refresh = useRefreshAdminCampaignData();
  return useMutation({
    mutationFn: ({
      campaignId,
      reason,
    }: {
      campaignId: string;
      reason?: string;
    }) => rejectAdminCampaign(campaignId, reason),
    onSuccess: refresh,
  });
};

export const useDeleteAdminCampaign = () => {
  const refresh = useRefreshAdminCampaignData();
  return useMutation({
    mutationFn: deleteAdminCampaign,
    onSuccess: refresh,
  });
};
