import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type {
  AdminPendingCampaign,
  AdminPendingCampaignPage,
} from "../types/admin-campaign";

interface PendingCampaignsResponse {
  success: true;
  data: AdminPendingCampaignPage;
}

interface ReviewCampaignResponse {
  success: true;
  data: { campaign: AdminPendingCampaign };
}

const getAdminCampaignError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data.message ?? fallback);
  }

  return new Error(fallback);
};

export const getAdminPendingCampaigns = async (
  page: number,
  limit = 10,
): Promise<AdminPendingCampaignPage> => {
  try {
    const response = await apiClient.get<PendingCampaignsResponse>(
      "/campaigns/admin/pending",
      {
        params: {
          page,
          limit,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      },
    );
    return response.data.data;
  } catch (error) {
    throw getAdminCampaignError(error, "Unable to load pending campaigns");
  }
};

export const approveAdminCampaign = async (
  campaignId: string,
): Promise<void> => {
  try {
    await apiClient.patch<ReviewCampaignResponse>(
      `/campaigns/admin/${campaignId}/approve`,
    );
  } catch (error) {
    throw getAdminCampaignError(error, "Unable to approve this campaign");
  }
};

export const rejectAdminCampaign = async (
  campaignId: string,
  reason?: string,
): Promise<void> => {
  try {
    await apiClient.patch<ReviewCampaignResponse>(
      `/campaigns/admin/${campaignId}/reject`,
      reason ? { reason } : {},
    );
  } catch (error) {
    throw getAdminCampaignError(error, "Unable to reject this campaign");
  }
};
