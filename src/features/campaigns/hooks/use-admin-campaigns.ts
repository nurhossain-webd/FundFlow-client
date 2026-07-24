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
  getAdminPendingCampaigns,
  rejectAdminCampaign,
} from "../services/admin-campaign.service";

export const adminPendingCampaignsQueryKey = [
  "campaigns",
  "admin",
  "pending",
] as const;

export const useAdminPendingCampaigns = (page: number) =>
  useQuery({
    queryKey: [...adminPendingCampaignsQueryKey, page],
    queryFn: () => getAdminPendingCampaigns(page),
    placeholderData: keepPreviousData,
  });

const useRefreshAdminCampaignData = () => {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: adminPendingCampaignsQueryKey,
      }),
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
