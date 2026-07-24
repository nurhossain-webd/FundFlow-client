"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard } from "../services/admin-dashboard.service";

export const adminDashboardQueryKey = ["dashboard", "admin"] as const;

export const useAdminDashboard = () =>
  useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: getAdminDashboard,
    staleTime: 30_000,
  });
