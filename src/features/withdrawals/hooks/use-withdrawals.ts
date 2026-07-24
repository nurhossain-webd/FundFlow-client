"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { creatorDashboardQueryKey } from "@/features/dashboard/hooks/use-creator-dashboard";

import {
  createWithdrawal,
  getCreatorWithdrawalHistory,
  getWithdrawalSummary,
} from "../services/withdrawal.service";
import type {
  CreateWithdrawalInput,
  WithdrawalHistoryFilters,
} from "../types/withdrawal";

export const withdrawalSummaryQueryKey = ["withdrawals", "summary"] as const;
export const creatorWithdrawalHistoryQueryKey = [
  "withdrawals",
  "creator",
] as const;

export const useWithdrawalSummary = () =>
  useQuery({
    queryKey: withdrawalSummaryQueryKey,
    queryFn: getWithdrawalSummary,
    staleTime: 15_000,
  });

export const useCreatorWithdrawalHistory = (
  filters: WithdrawalHistoryFilters,
) =>
  useQuery({
    queryKey: [...creatorWithdrawalHistoryQueryKey, filters],
    queryFn: () => getCreatorWithdrawalHistory(filters),
    placeholderData: keepPreviousData,
  });

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      idempotencyKey,
      input,
    }: {
      input: CreateWithdrawalInput;
      idempotencyKey: string;
    }) => createWithdrawal(input, idempotencyKey),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: withdrawalSummaryQueryKey }),
        queryClient.invalidateQueries({ queryKey: creatorDashboardQueryKey }),
        queryClient.invalidateQueries({
          queryKey: creatorWithdrawalHistoryQueryKey,
        }),
      ]);
    },
  });
};
