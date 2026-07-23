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
    .max(128, "Use no more than 128 characters")
    .regex(/[a-z]/, "Include at least one lowercase letter")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number")
    .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
  profileImage: z
    .custom<File>((value) => value instanceof File, {
      message: "Choose a profile image",
    })
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Use a JPG, PNG, or WebP image",
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Profile image must be 5 MB or smaller",
    ),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
