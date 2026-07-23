import { z } from "zod";

export const campaignCategories = [
  "Education",
  "Health",
  "Technology",
  "Environment",
  "Community",
  "Creative",
] as const;

const positiveCreditValue = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => /^\d+$/.test(value), `${label} must be a whole number`)
    .transform(Number)
    .refine(Number.isSafeInteger, `${label} is too large`)
    .refine((value) => value > 0, `${label} must be greater than zero`);

export const campaignFormSchema = z
  .object({
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
    category: z.enum(campaignCategories, {
      error: "Choose a campaign category",
    }),
    fundingGoal: positiveCreditValue("Funding goal"),
    minimumContribution: positiveCreditValue("Minimum contribution"),
    deadline: z
      .string()
      .min(1, "Choose a campaign deadline")
      .refine(
        (value) => Number.isFinite(new Date(value).getTime()),
        "Choose a valid campaign deadline",
      )
      .refine(
        (value) => new Date(value).getTime() > Date.now(),
        "Campaign deadline must be in the future",
      ),
    rewardInfo: z
      .string()
      .trim()
      .min(5, "Reward information must contain at least 5 characters")
      .max(2_000, "Reward information cannot exceed 2,000 characters"),
    image: z
      .custom<File>((value) => value instanceof File, {
        message: "Choose a campaign image",
      })
      .refine(
        (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "Use a JPG, PNG, or WebP image",
      )
      .refine(
        (file) => file.size <= 8 * 1024 * 1024,
        "Campaign image must be 8 MB or smaller",
      ),
  })
  .superRefine((campaign, context) => {
    if (campaign.minimumContribution > campaign.fundingGoal) {
      context.addIssue({
        code: "custom",
        path: ["minimumContribution"],
        message: "Minimum contribution cannot exceed the funding goal",
      });
    }
  });

export type CampaignFormInput = z.input<typeof campaignFormSchema>;
export type ValidatedCampaignForm = z.output<typeof campaignFormSchema>;
