"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { creatorDashboardQueryKey } from "@/features/dashboard/hooks/use-creator-dashboard";

import {
  createWithdrawal,
  getWithdrawalSummary,
} from "../services/withdrawal.service";
import type { CreateWithdrawalInput } from "../types/withdrawal";

export const withdrawalSummaryQueryKey = ["withdrawals", "summary"] as const;

export const useWithdrawalSummary = () =>
  useQuery({
    queryKey: withdrawalSummaryQueryKey,
    queryFn: getWithdrawalSummary,
    staleTime: 15_000,
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
          queryKey: ["withdrawals", "creator"],
        }),
      ]);
    },
  });
};
