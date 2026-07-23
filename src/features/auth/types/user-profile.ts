import type { PublicRole } from "../schemas/onboarding.schema";

export interface UserProfile {
  _id: string;
  authUserId: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: PublicRole | "admin";
  credits: number;
  raisedCredits: number;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: true;
  data: {
    profile: UserProfile;
  };
}

export interface CompleteOnboardingResponse {
  success: true;
  message: string;
  data: {
    profile: UserProfile;
    created: boolean;
  };
}
