"use client";

import { useQuery } from "@tanstack/react-query";

import { getSupporterDashboard } from "../services/supporter-dashboard.service";

export const supporterDashboardQueryKey = ["dashboard", "supporter"] as const;

export const useSupporterDashboard = () =>
  useQuery({
    queryKey: supporterDashboardQueryKey,
    queryFn: getSupporterDashboard,
    staleTime: 30_000,
  });
