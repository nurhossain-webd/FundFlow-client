import axios from "axios";

import { apiClient } from "@/lib/api-client";
import { publicApiClient } from "@/lib/public-api-client";

import type {
  CampaignDetail,
  CampaignReportInput,
} from "../types/campaign-detail";

interface CampaignDetailResponse {
  success: true;
  data: {
    campaign: CampaignDetail;
  };
}

interface CreateContributionResponse {
  success: true;
  message: string;
  data: {
    contribution: {
      _id: string;
      status: "pending";
      amount: number;
    };
    created: boolean;
  };
}

interface CampaignReportResponse {
  success: true;
  message: string;
  data: {
    report: {
      _id: string;
      status: "pending";
    };
  };
}

const getRequestError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data.message ?? fallback);
  }

  return new Error(fallback);
};

export const getCampaignDetail = async (
  campaignId: string,
): Promise<CampaignDetail> => {
  try {
    const response = await publicApiClient.get<CampaignDetailResponse>(
      `/campaigns/${campaignId}`,
    );

    return response.data.data.campaign;
  } catch (error) {
    throw getRequestError(error, "Unable to load this campaign");
  }
};

export const createCampaignContribution = async (
  campaignId: string,
  amount: number,
  idempotencyKey: string,
) => {
  try {
    const response = await apiClient.post<CreateContributionResponse>(
      "/contributions",
      { campaignId, amount },
      {
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    throw getRequestError(error, "Unable to submit contribution");
  }
};

export const reportCampaign = async (
  campaignId: string,
  input: CampaignReportInput,
) => {
  try {
    const response = await apiClient.post<CampaignReportResponse>(
      `/reports/campaigns/${campaignId}`,
      input,
    );

    return response.data.data.report;
  } catch (error) {
    throw getRequestError(error, "Unable to submit campaign report");
  }
};
