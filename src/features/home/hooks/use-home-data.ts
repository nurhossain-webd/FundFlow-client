"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getPlatformStatistics,
  getTopFundedCampaigns,
} from "../services/home.service";

export const homeQueryKeys = {
  topCampaigns: ["home", "top-campaigns"] as const,
  statistics: ["home", "statistics"] as const,
};

export const useTopFundedCampaigns = () =>
  useQuery({
    queryKey: homeQueryKeys.topCampaigns,
    queryFn: getTopFundedCampaigns,
    staleTime: 60_000,
  });

export const usePlatformStatistics = () =>
  useQuery({
    queryKey: homeQueryKeys.statistics,
    queryFn: getPlatformStatistics,
    staleTime: 60_000,
  });
