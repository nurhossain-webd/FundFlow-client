import { z } from "zod";

const amountSchema = z
  .string()
  .trim()
  .min(1, "Enter a contribution amount")
  .refine(
    (value) => /^\d+$/.test(value),
    "Contribution must be a whole number of credits",
  )
  .transform(Number)
  .refine(Number.isSafeInteger, "Contribution amount is too large")
  .refine((value) => value > 0, "Contribution must be greater than zero");

export const contributionFormSchema = z.object({
  amount: amountSchema,
});

export const campaignReportSchema = z.object({
  reason: z.enum(
    [
      "fraud",
      "misleading_information",
      "prohibited_content",
      "harassment",
      "spam",
      "other",
    ],
    { error: "Choose a report reason" },
  ),
  details: z
    .string()
    .trim()
    .min(10, "Report details must contain at least 10 characters")
    .max(2_000, "Report details cannot exceed 2,000 characters"),
});

export type ContributionFormInput = z.input<typeof contributionFormSchema>;
export type CampaignReportFormInput = z.infer<typeof campaignReportSchema>;
