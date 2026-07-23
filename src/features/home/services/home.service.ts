import { publicApiClient } from "@/lib/public-api-client";

import type {
  PlatformStatistics,
  PlatformStatisticsResponse,
  TopCampaignsResponse,
  TopFundedCampaign,
} from "../types/home.types";

export const getTopFundedCampaigns = async (): Promise<TopFundedCampaign[]> => {
  const response = await publicApiClient.get<TopCampaignsResponse>(
    "/public/campaigns/top-funded",
  );

  return response.data.data.campaigns;
};

export const getPlatformStatistics = async (): Promise<PlatformStatistics> => {
  const response =
    await publicApiClient.get<PlatformStatisticsResponse>("/public/statistics");

  return response.data.data.statistics;
};
