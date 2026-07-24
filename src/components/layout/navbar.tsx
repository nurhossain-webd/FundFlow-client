"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Code2,
  Coins,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getPlatformProfile } from "@/features/auth/services/onboarding.service";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

import { Logo } from "./logo";
import { PageContainer } from "./page-container";

const repositoryURL = process.env.NEXT_PUBLIC_CLIENT_REPOSITORY_URL;

function DeveloperLink({ mobile = false }: { mobile?: boolean }) {
  if (!repositoryURL) {
    return null;
  }

  return (
    <a
      href={repositoryURL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] border border-border bg-white font-semibold text-flow-700 transition hover:border-flow-600 hover:bg-flow-50",
        mobile ? "h-11 w-full px-4 text-sm" : "h-10 px-4 text-sm",
      )}
    >
      <Code2 aria-hidden="true" className="size-4" />
      Join as Developer
    </a>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isPending, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: profile } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: getPlatformProfile,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
      toast.success("You have been signed out");
      router.replace("/");
      router.refresh();
    } catch {
      toast.error("We could not sign you out. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
    }
  };

  const profileImage = profile?.photoURL ?? user?.image;
  const displayName = profile?.displayName ?? user?.name ?? "FundFlow member";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-white/95 backdrop-blur-lg">
      <PageContainer className="flex h-[72px] items-center justify-between gap-4">
        <Logo />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 xl:flex"
        >
          <Link
            href="/campaigns"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-ink transition hover:bg-flow-50 hover:text-flow-700"
          >
            Explore Campaigns
          </Link>
          {isPending ? (
            <div
              aria-label="Restoring session"
              className="ml-3 h-10 w-60 animate-pulse rounded-[10px] bg-canvas-muted"
            />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink transition hover:bg-flow-50 hover:text-flow-700"
              >
                <LayoutDashboard aria-hidden="true" className="size-4" />
                Dashboard
              </Link>
              <span className="mx-2 flex h-10 items-center gap-2 rounded-[10px] bg-flow-50 px-3 text-sm font-semibold text-flow-800">
                <Coins aria-hidden="true" className="size-4" />
                <span className="tabular-nums">{profile?.credits ?? "—"}</span>
                credits
              </span>
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                aria-label={`Open ${displayName}'s profile`}
                className="mr-2 flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-flow-100 text-sm font-bold text-flow-800 transition hover:border-flow-600"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="size-full object-cover"
                  />
                ) : (
                  initials || (
                    <UserRound aria-hidden="true" className="size-5" />
                  )
                )}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mr-2 inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-ink transition hover:bg-[#FFF0F2] hover:text-error disabled:opacity-60"
              >
                <LogOut aria-hidden="true" className="size-4" />
                {isLoggingOut ? "Logging out…" : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-ink transition hover:bg-flow-50 hover:text-flow-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="mr-2 inline-flex h-10 items-center rounded-[10px] bg-flow-600 px-4 text-sm font-semibold text-white transition hover:bg-flow-700"
              >
                Register
              </Link>
            </>
          )}
          <DeveloperLink />
        </nav>

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          onClick={() => setIsMenuOpen((current) => !current)}
          className="flex size-11 items-center justify-center rounded-[10px] border border-border bg-white text-flow-950 transition hover:bg-flow-50 xl:hidden"
        >
          {isMenuOpen ? (
            <X aria-hidden="true" className="size-5" />
          ) : (
            <Menu aria-hidden="true" className="size-5" />
          )}
        </button>
      </PageContainer>

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!isMenuOpen}
        className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-border-subtle bg-white xl:hidden"
      >
        <PageContainer className="space-y-2 py-4">
          <Link
            href="/campaigns"
            onClick={() => setIsMenuOpen(false)}
            className="flex h-11 items-center rounded-[10px] px-3 font-semibold text-ink hover:bg-flow-50 hover:text-flow-700"
          >
            Explore Campaigns
          </Link>
          {!isPending && isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 items-center gap-3 rounded-[10px] px-3 font-semibold text-ink hover:bg-flow-50 hover:text-flow-700"
              >
                <LayoutDashboard aria-hidden="true" className="size-5" />
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 items-center justify-between rounded-[10px] px-3 font-semibold text-ink hover:bg-flow-50 hover:text-flow-700"
              >
                <span className="flex items-center gap-3">
                  <UserRound aria-hidden="true" className="size-5" />
                  Profile
                </span>
                <span className="flex items-center gap-1.5 text-sm text-flow-700">
                  <Coins aria-hidden="true" className="size-4" />
                  {profile?.credits ?? "—"} credits
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left font-semibold text-error hover:bg-[#FFF0F2] disabled:opacity-60"
              >
                <LogOut aria-hidden="true" className="size-5" />
                {isLoggingOut ? "Logging out…" : "Logout"}
              </button>
            </>
          ) : !isPending ? (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-[10px] border border-border font-semibold text-flow-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-[10px] bg-flow-600 font-semibold text-white"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="h-11 animate-pulse rounded-[10px] bg-canvas-muted" />
          )}
          <DeveloperLink mobile />
        </PageContainer>
      </nav>
    </header>
  );
}
