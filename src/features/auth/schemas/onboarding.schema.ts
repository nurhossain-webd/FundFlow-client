import { z } from "zod";

export const publicRoles = ["supporter", "creator"] as const;
export const publicRoleSchema = z.enum(publicRoles);

export type PublicRole = z.infer<typeof publicRoleSchema>;

export const onboardingSchema = z.object({
  role: publicRoleSchema,
});

export const registrationSchema = onboardingSchema.extend({
  displayName: z
    .string()
    .trim()
    .min(2, "Enter at least 2 characters")
    .max(80, "Enter no more than 80 characters"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128, "Use no more than 128 characters"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
