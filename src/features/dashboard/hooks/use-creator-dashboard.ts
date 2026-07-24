"use client";

import { useQuery } from "@tanstack/react-query";

import { getCreatorDashboard } from "../services/creator-dashboard.service";

export const creatorDashboardQueryKey = ["dashboard", "creator"] as const;

export const useCreatorDashboard = () =>
  useQuery({
    queryKey: creatorDashboardQueryKey,
    queryFn: getCreatorDashboard,
    staleTime: 30_000,
  });
