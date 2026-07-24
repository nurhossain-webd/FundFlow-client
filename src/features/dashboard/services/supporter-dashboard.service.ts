import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type { SupporterDashboardData } from "../types/supporter-dashboard";

interface SupporterDashboardResponse {
  success: true;
  data: SupporterDashboardData;
}

export const getSupporterDashboard =
  async (): Promise<SupporterDashboardData> => {
    try {
      const response = await apiClient.get<SupporterDashboardResponse>(
        "/dashboard/supporter",
      );

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        throw new Error(
          error.response?.data.message ??
            "Unable to load supporter dashboard analytics",
        );
      }

      throw new Error("Unable to load supporter dashboard analytics");
    }
  };
