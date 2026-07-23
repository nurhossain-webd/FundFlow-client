import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type { ValidatedCampaignForm } from "../schemas/campaign-form.schema";

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
