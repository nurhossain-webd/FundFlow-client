"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { currentProfileQueryKey } from "@/features/auth/hooks/use-current-profile";

import {
  approveCreatorContribution,
  getCreatorContribution,
  getCreatorContributionStatistics,
  getPendingCreatorContributions,
  rejectCreatorContribution,
} from "../services/creator-contribution.service";

export const creatorContributionsQueryKey = [
  "contributions",
  "creator",
] as const;

export const usePendingCreatorContributions = (page: number) =>
  useQuery({
    queryKey: [...creatorContributionsQueryKey, "pending", page],
    queryFn: () => getPendingCreatorContributions(page),
  });

export const useCreatorContributionStatistics = () =>
  useQuery({
    queryKey: [...creatorContributionsQueryKey, "statistics"],
    queryFn: getCreatorContributionStatistics,
  });

export const useCreatorContributionDetail = (contributionId?: string) =>
  useQuery({
    queryKey: [...creatorContributionsQueryKey, "detail", contributionId],
    queryFn: () => getCreatorContribution(contributionId ?? ""),
    enabled: Boolean(contributionId),
  });

const useReviewInvalidation = () => {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: creatorContributionsQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: currentProfileQueryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: ["campaigns"],
      }),
    ]);
  };
};

export const useApproveCreatorContribution = () => {
  const invalidateReviewData = useReviewInvalidation();

  return useMutation({
    mutationFn: approveCreatorContribution,
    onSuccess: invalidateReviewData,
  });
};

export const useRejectCreatorContribution = () => {
  const invalidateReviewData = useReviewInvalidation();

  return useMutation({
    mutationFn: ({
      contributionId,
      reason,
    }: {
      contributionId: string;
      reason: string;
    }) => rejectCreatorContribution(contributionId, reason),
    onSuccess: invalidateReviewData,
  });
};
