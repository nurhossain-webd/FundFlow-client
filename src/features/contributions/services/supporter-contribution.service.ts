import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type {
  SupporterContributionFilters,
  SupporterContributionPage,
} from "../types/supporter-contribution";

interface SupporterContributionsResponse {
  success: true;
  data: SupporterContributionPage;
}

export const getSupporterContributions = async (
  filters: SupporterContributionFilters,
): Promise<SupporterContributionPage> => {
  try {
    const response = await apiClient.get<SupporterContributionsResponse>(
      "/contributions/mine",
      {
        params: filters,
      },
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data.message ?? "Unable to load your contributions",
      );
    }

    throw new Error("Unable to load your contributions");
  }
};
