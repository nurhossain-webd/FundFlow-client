import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type { ValidatedCampaignForm } from "../schemas/campaign-form.schema";

export type CampaignStatus = "pending" | "approved" | "rejected" | "suspended";

export interface CreatorCampaign {
  _id: string;
  title: string;
  story: string;
  rewardInfo: string;
  deadline: string;
  fundingGoal: number;
  amountRaised: number;
  status: CampaignStatus;
}

export interface CreatorCampaignPage {
  campaigns: CreatorCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateCampaignInput {
  title: string;
  story: string;
  rewardInfo: string;
}

export interface CampaignUpdateInput {
  title: string;
  message: string;
}

interface CampaignImageResponse {
  success: true;
  data: {
    imageURL: string;
  };
}

interface CreateCampaignResponse {
  success: true;
  message: string;
  data: {
    campaign: {
      _id: string;
      status: "pending";
      amountRaised: 0;
    };
  };
}

interface CreatorCampaignsResponse {
  success: true;
  data: CreatorCampaignPage;
}

interface UpdateCampaignResponse {
  success: true;
  message: string;
  data: {
    campaign: CreatorCampaign;
  };
}

interface DeleteCampaignResponse {
  success: true;
  message: string;
  data: {
    campaignId: string;
    refundedContributions: number;
    refundedSupporters: number;
    refundedCredits: number;
  };
}

const getCampaignRequestError = (
  error: unknown,
  fallbackMessage: string,
): Error => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data.message ?? fallbackMessage);
  }

  return new Error(fallbackMessage);
};

export const uploadCampaignImage = async (
  image: File,
  onProgress: (percentage: number) => void,
): Promise<string> => {
  const body = new FormData();
  body.append("image", image);

  try {
    const response = await axios.post<CampaignImageResponse>(
      "/api/uploads/campaign-image",
      body,
      {
        withCredentials: true,
        onUploadProgress: (event) => {
          if (event.total) {
            onProgress(
              Math.min(100, Math.round((event.loaded / event.total) * 100)),
            );
          }
        },
      },
    );

    onProgress(100);
    return response.data.data.imageURL;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data.message ?? "Unable to upload campaign image",
      );
    }

    throw new Error("Unable to upload campaign image");
  }
};

export const submitCampaign = async (
  campaign: ValidatedCampaignForm,
  imageURL: string,
) => {
  try {
    const response = await apiClient.post<CreateCampaignResponse>(
      "/campaigns",
      {
        title: campaign.title,
        story: campaign.story,
        category: campaign.category,
        fundingGoal: campaign.fundingGoal,
        minimumContribution: campaign.minimumContribution,
        deadline: new Date(campaign.deadline).toISOString(),
        rewardInfo: campaign.rewardInfo,
        imageURL,
      },
    );

    return response.data.data.campaign;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data.message ?? "Unable to submit campaign",
      );
    }

    throw new Error("Unable to submit campaign");
  }
};

export const getCreatorCampaigns = async (
  page: number,
  limit = 10,
): Promise<CreatorCampaignPage> => {
  try {
    const response = await apiClient.get<CreatorCampaignsResponse>(
      "/campaigns/mine",
      {
        params: {
          page,
          limit,
          sortBy: "deadline",
          sortOrder: "desc",
        },
      },
    );

    return response.data.data;
  } catch (error) {
    throw getCampaignRequestError(
      error,
      "Unable to load your campaigns right now",
    );
  }
};

export const updateCreatorCampaign = async (
  campaignId: string,
  input: UpdateCampaignInput,
): Promise<CreatorCampaign> => {
  try {
    const response = await apiClient.patch<UpdateCampaignResponse>(
      `/campaigns/${campaignId}`,
      input,
    );

    return response.data.data.campaign;
  } catch (error) {
    throw getCampaignRequestError(error, "Unable to update this campaign");
  }
};

export const postCampaignUpdate = async (
  campaignId: string,
  input: CampaignUpdateInput,
): Promise<void> => {
  try {
    await apiClient.post(`/campaigns/${campaignId}/updates`, input);
  } catch (error) {
    throw getCampaignRequestError(error, "Unable to publish this update");
  }
};

export const deleteCreatorCampaign = async (
  campaignId: string,
): Promise<DeleteCampaignResponse["data"]> => {
  try {
    const response = await apiClient.delete<DeleteCampaignResponse>(
      `/campaigns/${campaignId}`,
      {
        data: {},
      },
    );

    return response.data.data;
  } catch (error) {
    throw getCampaignRequestError(error, "Unable to delete this campaign");
  }
};
