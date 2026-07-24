import type { UserProfile } from "../types/user-profile";
import { isSafeInternalPath } from "@/lib/safe-navigation";

const privatePathPrefixes = [
  "/dashboard",
  "/profile",
  "/campaigns/new",
  "/contributions",
  "/withdrawals",
  "/admin",
] as const;

export const getRoleDashboard = (role: UserProfile["role"]): string => {
  switch (role) {
    case "supporter":
      return "/dashboard/supporter";
    case "creator":
      return "/dashboard/creator";
    case "admin":
      return "/dashboard/admin";
  }
};

export const getSafePrivateDestination = (
  destination: string | null | undefined,
): string | undefined => {
  if (!destination || !isSafeInternalPath(destination)) {
    return undefined;
  }

  let pathname: string;

  try {
    pathname = new URL(destination, "http://fundflow.local").pathname;
  } catch {
    return undefined;
  }

  const isPrivatePath = privatePathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return isPrivatePath ? destination : undefined;
};

export const getCurrentPrivateDestination = (): string | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const parameters = new URLSearchParams(window.location.search);

  return getSafePrivateDestination(
    parameters.get("callbackUrl") ?? parameters.get("redirect"),
  );
};
