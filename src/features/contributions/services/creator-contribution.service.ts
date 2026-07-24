import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type {
  CreatorContribution,
  CreatorContributionPage,
  CreatorContributionStatistics,
} from "../types/creator-contribution";

interface PendingContributionsResponse {
  success: true;
  data: CreatorContributionPage;
}

interface ContributionDetailResponse {
  success: true;
  data: {
    contribution: CreatorContribution;
  };
}

interface ContributionStatisticsResponse {
  success: true;
  data: {
    statistics: CreatorContributionStatistics;
  };
}

const getRequestError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data.message ?? fallback);
  }

  return new Error(fallback);
};

export const getPendingCreatorContributions = async (
  page: number,
): Promise<CreatorContributionPage> => {
  try {
    const response = await apiClient.get<PendingContributionsResponse>(
      "/contributions/creator/pending",
      {
        params: { page, limit: 10 },
      },
    );

    return response.data.data;
  } catch (error) {
    throw getRequestError(error, "Unable to load pending contributions");
  }
};

export const getCreatorContribution = async (
  contributionId: string,
): Promise<CreatorContribution> => {
  try {
    const response = await apiClient.get<ContributionDetailResponse>(
      `/contributions/creator/${contributionId}`,
    );

    return response.data.data.contribution;
  } catch (error) {
    throw getRequestError(error, "Unable to load contribution details");
  }
};

export const getCreatorContributionStatistics =
  async (): Promise<CreatorContributionStatistics> => {
    try {
      const response = await apiClient.get<ContributionStatisticsResponse>(
        "/contributions/creator/statistics",
      );

      return response.data.data.statistics;
    } catch (error) {
      throw getRequestError(error, "Unable to load contribution statistics");
    }
  };

export const approveCreatorContribution = async (
  contributionId: string,
): Promise<CreatorContribution> => {
  try {
    const response = await apiClient.patch<ContributionDetailResponse>(
      `/contributions/creator/${contributionId}/approve`,
    );

    return response.data.data.contribution;
  } catch (error) {
    throw getRequestError(error, "Unable to approve contribution");
  }
};

export const rejectCreatorContribution = async (
  contributionId: string,
  reason: string,
): Promise<CreatorContribution> => {
  try {
    const response = await apiClient.patch<ContributionDetailResponse>(
      `/contributions/creator/${contributionId}/reject`,
      { reason },
    );

    return response.data.data.contribution;
  } catch (error) {
    throw getRequestError(error, "Unable to reject contribution");
  }
};
