import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type { CreatorDashboardData } from "../types/creator-dashboard";

interface CreatorDashboardResponse {
  success: true;
  data: CreatorDashboardData;
}

export const getCreatorDashboard = async (): Promise<CreatorDashboardData> => {
  try {
    const response =
      await apiClient.get<CreatorDashboardResponse>("/dashboard/creator");

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data.message ??
          "Unable to load creator dashboard analytics",
      );
    }

    throw new Error("Unable to load creator dashboard analytics");
  }
};
