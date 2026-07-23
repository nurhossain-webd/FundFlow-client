"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type PropsWithChildren } from "react";

import { useAuth } from "@/providers/auth-provider";

import { useCurrentProfile } from "../hooks/use-current-profile";
import { isMissingPlatformProfile } from "../services/onboarding.service";
import type { UserProfile } from "../types/user-profile";
import { getRoleDashboard } from "../utils/auth-routing";
import { AuthLoadingScreen } from "./auth-loading-screen";
import { RouteAccessError } from "./route-access-error";

const getRequiredRole = (pathname: string): UserProfile["role"] | undefined => {
  if (
    pathname === "/dashboard/supporter" ||
    pathname.startsWith("/dashboard/supporter/")
  ) {
    return "supporter";
  }

  if (
    pathname === "/dashboard/creator" ||
    pathname.startsWith("/dashboard/creator/")
  ) {
    return "creator";
  }

  if (
    pathname === "/dashboard/admin" ||
    pathname.startsWith("/dashboard/admin/")
  ) {
    return "admin";
  }

  return undefined;
};

export function PrivateRouteGuard({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isPending } = useAuth();
  const profileQuery = useCurrentProfile(isAuthenticated);
  const profile = profileQuery.data;
  const requiredRole = getRequiredRole(pathname);
  const missingProfile =
    profileQuery.isError && isMissingPlatformProfile(profileQuery.error);
  const wrongRole = Boolean(
    profile && requiredRole && profile.role !== requiredRole,
  );

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!isAuthenticated) {
      const destination = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?callbackUrl=${encodeURIComponent(destination)}`);
      return;
    }

    if (missingProfile) {
      router.replace(`/onboarding?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!profile) {
      return;
    }

    if (profile.isSuspended || wrongRole) {
      router.replace("/unauthorized");
      return;
    }

    if (pathname === "/dashboard") {
      router.replace(getRoleDashboard(profile.role));
    }
  }, [
    isAuthenticated,
    isPending,
    missingProfile,
    pathname,
    profile,
    router,
    wrongRole,
  ]);

  if (profileQuery.isError && !missingProfile) {
    return <RouteAccessError retry={() => void profileQuery.refetch()} />;
  }

  if (
    isPending ||
    !isAuthenticated ||
    profileQuery.isLoading ||
    missingProfile ||
    !profile ||
    profile.isSuspended ||
    wrongRole ||
    pathname === "/dashboard"
  ) {
    return <AuthLoadingScreen />;
  }

  return children;
}
