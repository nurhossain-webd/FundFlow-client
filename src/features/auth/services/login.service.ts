import { getPlatformProfile } from "./onboarding.service";
import {
  getRoleDashboard,
  getSafePrivateDestination,
} from "../utils/auth-routing";
import { storeApiAccessToken } from "@/lib/token-storage";

interface AccessTokenResponse {
  success: true;
  data: {
    accessToken: string;
  };
}

export const synchronizeApiAccessToken = async (): Promise<void> => {
  const response = await fetch("/api/auth/access-token", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Unable to establish a secure API session");
  }

  const result = (await response.json()) as AccessTokenResponse;
  storeApiAccessToken(result.data.accessToken);
};

export const resolveAuthenticatedDestination = async (
  intendedDestination?: string,
): Promise<string> => {
  await synchronizeApiAccessToken();
  const profile = await getPlatformProfile();

  if (profile.isSuspended) {
    throw new Error("This FundFlow account is suspended");
  }

  return (
    getSafePrivateDestination(intendedDestination) ??
    getRoleDashboard(profile.role)
  );
};
