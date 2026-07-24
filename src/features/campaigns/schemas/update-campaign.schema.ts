import { z } from "zod";

export const updateCampaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Campaign title must contain at least 5 characters")
    .max(120, "Campaign title cannot exceed 120 characters"),
  story: z
    .string()
    .trim()
    .min(50, "Campaign story must contain at least 50 characters")
    .max(20_000, "Campaign story cannot exceed 20,000 characters"),
  rewardInfo: z
    .string()
    .trim()
    .min(5, "Reward information must contain at least 5 characters")
    .max(2_000, "Reward information cannot exceed 2,000 characters"),
});

export type UpdateCampaignFormInput = z.infer<typeof updateCampaignSchema>;
