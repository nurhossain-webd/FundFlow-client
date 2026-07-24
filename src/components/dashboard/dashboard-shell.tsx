"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  Coins,
  Home,
  LoaderCircle,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type PropsWithChildren } from "react";
import toast from "react-hot-toast";

import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";
import {
  currentProfileQueryKey,
  useCurrentProfile,
} from "@/features/auth/hooks/use-current-profile";
import type { UserProfile } from "@/features/auth/types/user-profile";
import { getRoleDashboard } from "@/features/auth/utils/auth-routing";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

import {
  getDashboardNavigation,
  type DashboardNavigationGroup,
} from "./dashboard-navigation";

const roleLabels: Record<UserProfile["role"], string> = {
  supporter: "Supporter",
  creator: "Creator",
  admin: "Admin",
};

const breadcrumbLabels: Record<string, string> = {
  supporter: "Supporter",
  creator: "Creator",
  admin: "Admin",
  campaigns: "Campaigns",
  new: "Create campaign",
  contributions: "Contributions",
  credits: "Buy credits",
  payments: "Payments",
  withdrawals: "Withdrawals",
  notifications: "Notifications",
  profile: "Profile",
  users: "Users",
  reports: "Reports",
  history: "History",
};

interface DashboardSidebarContentProps {
  navigation: DashboardNavigationGroup[];
  pathname: string;
  profile: UserProfile;
  profileImage?: string | null;
  isLoggingOut: boolean;
  onNavigate?: () => void;
  onLogout: () => void;
}

function DashboardSidebarContent({
  isLoggingOut,
  navigation,
  onLogout,
  onNavigate,
  pathname,
  profile,
  profileImage,
}: DashboardSidebarContentProps) {
  const initials = profile.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Logo inverse />
      </div>

      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/10 text-sm font-bold text-white">
            {profileImage ? (
              <Image
                src={profileImage}
                alt=""
                width={44}
                height={44}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              initials || <UserRound aria-hidden="true" className="size-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-white">
              {profile.displayName}
            </p>
            <p className="truncate text-xs text-flow-200">{profile.email}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Badge variant={profile.role === "admin" ? "warning" : "info"}>
            {roleLabels[profile.role]}
          </Badge>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-flow-200">
            <Coins aria-hidden="true" className="size-4" />
            {profile.credits.toLocaleString()} credits
          </span>
        </div>
      </div>

      <nav
        aria-label="Dashboard navigation"
        className="flex-1 space-y-6 overflow-y-auto px-4 py-5"
      >
        {navigation.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[0.68rem] font-bold tracking-[0.14em] text-flow-300 uppercase">
              {group.label}
            </p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-semibold transition",
                        isActive
                          ? "bg-flow-600 text-white shadow-sm"
                          : "text-flow-100 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-5 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-sm font-semibold text-flow-100 transition hover:bg-[#6D2930] hover:text-white disabled:opacity-60"
        >
          {isLoggingOut ? (
            <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          ) : (
            <LogOut aria-hidden="true" className="size-5" />
          )}
          {isLoggingOut ? "Signing out…" : "Logout"}
        </button>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDrawerOpen]);

  if (!profile) {
    return null;
  }

  const navigation = getDashboardNavigation(profile.role);
  const profileImage = profile.photoURL ?? user?.image;
  const roleDashboard = getRoleDashboard(profile.role);
  const pathSegments = pathname.split("/").filter(Boolean).slice(2);
  const breadcrumbs = [
    {
      label: `${roleLabels[profile.role]} dashboard`,
      href: roleDashboard,
    },
    ...pathSegments.map((segment, index) => ({
      label:
        breadcrumbLabels[segment] ??
        segment
          .replaceAll("-", " ")
          .replace(/^\w/, (letter) => letter.toUpperCase()),
      href: `${roleDashboard}/${pathSegments.slice(0, index + 1).join("/")}`,
    })),
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
      queryClient.removeQueries({ queryKey: currentProfileQueryKey });
      toast.success("You have been signed out");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("We could not sign you out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-flow-950 xl:w-72 lg:block">
        <DashboardSidebarContent
          navigation={navigation}
          pathname={pathname}
          profile={profile}
          profileImage={profileImage}
          isLoggingOut={isLoggingOut}
          onLogout={() => void handleLogout()}
        />
      </aside>

      {isDrawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard navigation"
            className="absolute inset-0 bg-flow-950/65 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />
          <aside
            id="dashboard-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="relative h-full w-[min(88vw,320px)] bg-flow-950 shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close dashboard navigation"
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-5 right-4 z-10 flex size-10 items-center justify-center rounded-[10px] border border-white/15 text-white transition hover:bg-white/10"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <DashboardSidebarContent
              navigation={navigation}
              pathname={pathname}
              profile={profile}
              profileImage={profileImage}
              isLoggingOut={isLoggingOut}
              onNavigate={() => setIsDrawerOpen(false)}
              onLogout={() => void handleLogout()}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64 xl:pl-72">
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur-xl">
          <div className="flex h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              aria-label="Open dashboard navigation"
              aria-expanded={isDrawerOpen}
              aria-controls="dashboard-mobile-drawer"
              onClick={() => setIsDrawerOpen(true)}
              className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-border bg-white text-flow-950 transition hover:bg-flow-50 lg:hidden"
            >
              <Menu aria-hidden="true" className="size-5" />
            </button>

            <nav
              aria-label="Breadcrumb"
              className="min-w-0 flex-1 overflow-hidden"
            >
              <ol className="flex items-center gap-1.5 overflow-hidden text-sm">
                <li className="shrink-0">
                  <Link
                    href={roleDashboard}
                    aria-label="Dashboard home"
                    className="flex size-9 items-center justify-center rounded-lg text-ink-muted transition hover:bg-flow-50 hover:text-flow-700"
                  >
                    <Home aria-hidden="true" className="size-4" />
                  </Link>
                </li>
                {breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <li
                      key={breadcrumb.href}
                      className="flex min-w-0 items-center gap-1.5"
                    >
                      <ChevronRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-ink-subtle"
                      />
                      {isLast ? (
                        <span
                          className="truncate font-semibold text-ink-strong"
                          aria-current="page"
                        >
                          {breadcrumb.label}
                        </span>
                      ) : (
                        <Link
                          href={breadcrumb.href}
                          className="truncate text-ink-muted hover:text-flow-700"
                        >
                          {breadcrumb.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <span className="hidden h-10 items-center gap-2 rounded-[10px] bg-flow-50 px-3 text-sm font-semibold text-flow-800 sm:flex">
                <Coins aria-hidden="true" className="size-4" />
                <span className="tabular-nums">
                  {profile.credits.toLocaleString()}
                </span>
                credits
              </span>
              <NotificationCenter />
              <Link
                href={`/dashboard/${profile.role}/profile`}
                aria-label={`Open ${profile.displayName}'s profile`}
                className="flex size-11 items-center justify-center overflow-hidden rounded-full border border-border bg-flow-100 text-sm font-bold text-flow-800"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                    className="size-full object-cover"
                  />
                ) : (
                  profile.displayName.charAt(0).toUpperCase()
                )}
              </Link>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 bg-canvas px-4 py-7 sm:px-6 sm:py-9 lg:px-6 xl:px-8">
          <div className="mx-auto w-full min-w-0 max-w-7xl">{children}</div>
        </main>

        <footer className="border-t border-border-subtle bg-white px-4 py-5 text-sm text-ink-muted sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} FundFlow dashboard.</p>
            <p>Fund ideas. Move impact forward.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
