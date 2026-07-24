"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

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

export const useCreateContribution = () =>
  useMutation({
    mutationFn: ({
      amount,
      campaignId,
      idempotencyKey,
    }: {
      amount: number;
      campaignId: string;
      idempotencyKey: string;
    }) => createCampaignContribution(campaignId, amount, idempotencyKey),
  });

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
