import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type {
  AdminCampaignReport,
  AdminCampaignReportFilters,
  AdminCampaignReportPage,
} from "../types/admin-report";

interface AdminReportPageResponse {
  success: true;
  data: AdminCampaignReportPage;
}

interface AdminReportResponse {
  success: true;
  data: { report: AdminCampaignReport };
}

const getReportError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data.message ?? fallback);
  }
  return new Error(fallback);
};

export const getAdminReports = async (
  filters: AdminCampaignReportFilters,
): Promise<AdminCampaignReportPage> => {
  try {
    const response = await apiClient.get<AdminReportPageResponse>(
      "/reports/admin",
      { params: filters },
    );
    return response.data.data;
  } catch (error) {
    throw getReportError(error, "Unable to load campaign reports");
  }
};

export const resolveAdminReport = async (
  reportId: string,
  resolutionNote?: string,
): Promise<AdminCampaignReport> => {
  try {
    const response = await apiClient.patch<AdminReportResponse>(
      `/reports/admin/${reportId}/resolve`,
      resolutionNote ? { resolutionNote } : {},
    );
    return response.data.data.report;
  } catch (error) {
    throw getReportError(error, "Unable to resolve this report");
  }
};

export const suspendReportedCampaign = async (
  reportId: string,
  resolutionNote?: string,
): Promise<void> => {
  try {
    await apiClient.patch(`/reports/admin/${reportId}/suspend-campaign`, {
      ...(resolutionNote ? { resolutionNote } : {}),
    });
  } catch (error) {
    throw getReportError(error, "Unable to suspend this campaign");
  }
};
