"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCampaignContribution,
  getCampaignDetail,
  reportCampaign,
} from "../services/campaign-detail.service";
import type { CampaignReportInput } from "../types/campaign-detail";

export const campaignDetailQueryKey = (campaignId: string) =>
  ["campaigns", "detail", campaignId] as const;

export const useCampaignDetail = (campaignId: string) =>
  useQuery({
    queryKey: campaignDetailQueryKey(campaignId),
    queryFn: () => getCampaignDetail(campaignId),
    retry: false,
  });

export const useCreateContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      amount,
      campaignId,
      idempotencyKey,
    }: {
      amount: number;
      campaignId: string;
      idempotencyKey: string;
    }) => createCampaignContribution(campaignId, amount, idempotencyKey),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["dashboard", "supporter"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["contributions", "supporter"],
        }),
      ]);
    },
  });
};

export const useReportCampaign = () =>
  useMutation({
    mutationFn: ({
      campaignId,
      input,
    }: {
      campaignId: string;
      input: CampaignReportInput;
    }) => reportCampaign(campaignId, input),
  });
