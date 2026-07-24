"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getExploreCampaigns } from "../services/explore-campaign.service";
import type { ExploreCampaignFilters } from "../types/explore-campaign";

export const useExploreCampaigns = (filters: ExploreCampaignFilters) =>
  useQuery({
    queryKey: ["campaigns", "explore", filters],
    queryFn: () => getExploreCampaigns(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
