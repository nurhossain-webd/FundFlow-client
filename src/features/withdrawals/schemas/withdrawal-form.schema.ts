import { z } from "zod";

export const withdrawalPaymentSystems = [
  { value: "stripe", label: "Stripe" },
  { value: "bkash", label: "Bkash" },
  { value: "rocket", label: "Rocket" },
  { value: "nagad", label: "Nagad" },
] as const;

export const withdrawalFormSchema = z.object({
  credits: z
    .string()
    .trim()
    .min(1, "Enter the number of credits to withdraw")
    .regex(/^\d+$/, "Credits must be a whole number")
    .transform(Number)
    .pipe(
      z.number().int().min(200, "The minimum withdrawal is 200 credits").safe(),
    ),
  paymentSystem: z.enum(["stripe", "bkash", "rocket", "nagad"], {
    error: "Choose a payment system",
  }),
  accountNumber: z
    .string()
    .trim()
    .min(4, "Account number must contain at least 4 characters")
    .max(120, "Account number is too long")
    .regex(
      /^[A-Za-z0-9@._+\-\s]+$/,
      "Account number contains unsupported characters",
    ),
});

export interface WithdrawalFormValues {
  credits: string;
  paymentSystem: "" | "stripe" | "bkash" | "rocket" | "nagad";
  accountNumber: string;
}
