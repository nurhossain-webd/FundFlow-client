import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type { AdminDashboardData } from "../types/admin-dashboard";

interface AdminDashboardResponse {
  success: true;
  data: AdminDashboardData;
}

export const getAdminDashboard = async (): Promise<AdminDashboardData> => {
  try {
    const response =
      await apiClient.get<AdminDashboardResponse>("/dashboard/admin");

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(
        error.response?.data.message ??
          "Unable to load Admin dashboard analytics",
      );
    }

    throw new Error("Unable to load Admin dashboard analytics");
  }
};
