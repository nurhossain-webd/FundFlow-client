"use client";

import { useQuery } from "@tanstack/react-query";

import { getPlatformProfile } from "../services/onboarding.service";

export const currentProfileQueryKey = ["current-user-profile"] as const;

export const useCurrentProfile = (enabled = true) =>
  useQuery({
    queryKey: currentProfileQueryKey,
    queryFn: getPlatformProfile,
    enabled,
    retry: false,
    staleTime: 30_000,
  });
