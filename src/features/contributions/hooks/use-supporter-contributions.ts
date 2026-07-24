"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getSupporterContributions } from "../services/supporter-contribution.service";
import type { SupporterContributionFilters } from "../types/supporter-contribution";

export const useSupporterContributions = (
  filters: SupporterContributionFilters,
) =>
  useQuery({
    queryKey: ["contributions", "supporter", filters],
    queryFn: () => getSupporterContributions(filters),
    placeholderData: keepPreviousData,
  });
