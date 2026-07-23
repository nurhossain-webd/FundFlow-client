import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type { PublicRole } from "../schemas/onboarding.schema";
import type {
  CompleteOnboardingResponse,
  ProfileResponse,
} from "../types/user-profile";

export const getPlatformProfile = async () => {
  const response = await apiClient.get<ProfileResponse>("/onboarding/profile");

  return response.data.data.profile;
};

export const completePlatformOnboarding = async (role: PublicRole) => {
  const response = await apiClient.post<CompleteOnboardingResponse>(
    "/onboarding/profile",
    { role },
  );

  return response.data.data;
};

export const isMissingPlatformProfile = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

export const getOnboardingErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data.message ?? "Unable to complete onboarding";
  }

  return "Unable to complete onboarding";
};
