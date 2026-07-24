"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UpdateCampaignFormInput } from "../schemas/update-campaign.schema";
import {
  deleteCreatorCampaign,
  getCreatorCampaigns,
  updateCreatorCampaign,
} from "../services/campaign.service";

export const creatorCampaignsQueryKey = ["campaigns", "creator"] as const;

export const useCreatorCampaigns = (page: number) =>
  useQuery({
    queryKey: [...creatorCampaignsQueryKey, page],
    queryFn: () => getCreatorCampaigns(page),
  });

export const useUpdateCreatorCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      campaignId,
      input,
    }: {
      campaignId: string;
      input: UpdateCampaignFormInput;
    }) => updateCreatorCampaign(campaignId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: creatorCampaignsQueryKey,
      });
    },
  });
};

export const useDeleteCreatorCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCreatorCampaign,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: creatorCampaignsQueryKey,
      });
    },
  });
};
