"use client";

import { useRouter } from "next/navigation";
import { useEffect, type PropsWithChildren } from "react";

import { useAuth } from "@/providers/auth-provider";

import { useCurrentProfile } from "../hooks/use-current-profile";
import { isMissingPlatformProfile } from "../services/onboarding.service";
import {
  getCurrentPrivateDestination,
  getRoleDashboard,
} from "../utils/auth-routing";
import { AuthLoadingScreen } from "./auth-loading-screen";
import { RouteAccessError } from "./route-access-error";

interface PublicOnlyRouteGuardProps extends PropsWithChildren {
  bypassDuringSubmission?: boolean;
}

export function PublicOnlyRouteGuard({
  bypassDuringSubmission = false,
  children,
}: PublicOnlyRouteGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isPending } = useAuth();
  const profileQuery = useCurrentProfile(
    isAuthenticated && !bypassDuringSubmission,
  );
  const missingProfile =
    profileQuery.isError && isMissingPlatformProfile(profileQuery.error);

  useEffect(() => {
    if (isPending || !isAuthenticated || bypassDuringSubmission) {
      return;
    }

    if (missingProfile) {
      router.replace("/onboarding");
      return;
    }

    if (!profileQuery.data) {
      return;
    }

    if (profileQuery.data.isSuspended) {
      router.replace("/unauthorized");
      return;
    }

    router.replace(
      getCurrentPrivateDestination() ??
        getRoleDashboard(profileQuery.data.role),
    );
  }, [
    bypassDuringSubmission,
    isAuthenticated,
    isPending,
    missingProfile,
    profileQuery.data,
    router,
  ]);

  if (isPending) {
    return <AuthLoadingScreen message="Restoring your FundFlow session…" />;
  }

  if (!isAuthenticated || bypassDuringSubmission) {
    return children;
  }

  if (profileQuery.isError && !missingProfile) {
    return <RouteAccessError retry={() => void profileQuery.refetch()} />;
  }

  return <AuthLoadingScreen message="Opening your dashboard…" />;
}
