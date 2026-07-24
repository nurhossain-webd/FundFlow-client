"use client";

import {
  ChevronDown,
  Code2,
  Coins,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";

import { Avatar } from "@/components/ui/avatar";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { useCurrentProfile } from "@/features/auth/hooks/use-current-profile";
import { getRoleDashboard } from "@/features/auth/utils/auth-routing";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

import { Logo } from "./logo";
import { PageContainer } from "./page-container";

const repositoryURL = process.env.NEXT_PUBLIC_CLIENT_REPOSITORY_URL;

const roleLabels = {
  supporter: "Supporter",
  creator: "Creator",
  admin: "Admin",
} as const;

const focusableDrawerSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function linkClasses(active: boolean): string {
  return cn(
    "rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flow-600",
    active
      ? "bg-flow-100 text-flow-800"
      : "text-ink hover:bg-flow-50 hover:text-flow-700",
  );
}

function DeveloperLink({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  if (!repositoryURL) {
    return null;
  }

  return (
    <a
      href={repositoryURL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] border border-border bg-white font-semibold text-flow-700 transition hover:border-flow-600 hover:bg-flow-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flow-600",
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
  const { data: profile } = useCurrentProfile(isAuthenticated);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const displayName = profile?.displayName ?? user?.name ?? "FundFlow member";
  const email = profile?.email ?? user?.email ?? "";
  const profileImage = profile?.photoURL ?? user?.image;
  const dashboardHref = profile ? getRoleDashboard(profile.role) : "/dashboard";
  const profileHref = profile
    ? `${getRoleDashboard(profile.role)}/profile`
    : "/dashboard";
  const creditsHref =
    profile?.role === "supporter"
      ? "/dashboard/purchase-credit"
      : dashboardHref;

  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !profileContainerRef.current?.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        profileTriggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
        mobileTriggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          focusableDrawerSelector,
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    drawerRef.current
      ?.querySelector<HTMLElement>(focusableDrawerSelector)
      ?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

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
      setIsMobileOpen(false);
      setIsProfileOpen(false);
    }
  };

  const openProfileMenuFromKeyboard = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();
    setIsProfileOpen(true);
    window.requestAnimationFrame(() => {
      profileMenuRef.current
        ?.querySelector<HTMLElement>('[role="menuitem"]')
        ?.focus();
    });
  };

  const handleProfileMenuKeys = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    if (items.length === 0) {
      return;
    }

    event.preventDefault();
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex = 0;

    if (event.key === "End") {
      nextIndex = items.length - 1;
    } else if (event.key === "ArrowUp") {
      nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    } else if (event.key === "ArrowDown") {
      nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
    }

    items[nextIndex]?.focus();
  };

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 h-20 border-b border-border-subtle bg-white/95 backdrop-blur-lg">
      <PageContainer className="flex h-20 items-center justify-between gap-3">
        <Logo className="shrink-0" />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          <Link
            href="/campaigns"
            aria-current={isActivePath(pathname, "/campaigns") ? "page" : undefined}
            className={linkClasses(isActivePath(pathname, "/campaigns"))}
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
                href={dashboardHref}
                aria-current={
                  isActivePath(pathname, "/dashboard") ? "page" : undefined
                }
                className={cn(
                  linkClasses(isActivePath(pathname, "/dashboard")),
                  "inline-flex items-center gap-2",
                )}
              >
                <LayoutDashboard aria-hidden="true" className="size-4" />
                Dashboard
              </Link>

              <Link
                href={creditsHref}
                aria-label={`Available credits: ${profile?.credits ?? "loading"}`}
                title={
                  profile?.role === "supporter"
                    ? "Purchase credits"
                    : "View dashboard"
                }
                className="mx-1 flex h-10 items-center gap-2 rounded-[10px] bg-flow-50 px-3 text-sm font-semibold text-flow-800 transition hover:bg-flow-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flow-600"
              >
                <Coins aria-hidden="true" className="size-4" />
                <span className="tabular-nums">{profile?.credits ?? "—"}</span>
                credits
              </Link>

              <NotificationCenter />

              <div ref={profileContainerRef} className="relative ml-1">
                <button
                  ref={profileTriggerRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  aria-controls="profile-menu"
                  aria-label={`Open account menu for ${displayName}`}
                  onClick={() => setIsProfileOpen((current) => !current)}
                  onKeyDown={openProfileMenuFromKeyboard}
                  className="flex h-11 items-center gap-2 rounded-full border border-transparent pr-2 pl-1 transition hover:border-flow-300 hover:bg-flow-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flow-600"
                >
                  <Avatar
                    name={displayName}
                    src={profileImage}
                    size={38}
                    className="border border-border"
                  />
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "size-4 text-ink-muted transition",
                      isProfileOpen && "rotate-180",
                    )}
                  />
                </button>

                {isProfileOpen ? (
                  <div
                    ref={profileMenuRef}
                    id="profile-menu"
                    role="menu"
                    aria-label="Account menu"
                    onKeyDown={handleProfileMenuKeys}
                    className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-72 overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-[0_20px_60px_rgba(6,47,53,0.2)]"
                  >
                    <div className="border-b border-border-subtle px-4 py-4">
                      <p className="truncate font-display font-bold text-ink-strong">
                        {displayName}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-ink-muted">
                        {email}
                      </p>
                      {profile ? (
                        <span className="mt-2 inline-flex rounded-full bg-flow-100 px-2.5 py-1 text-xs font-bold text-flow-800">
                          {roleLabels[profile.role]}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-2">
                      <Link
                        role="menuitem"
                        href={dashboardHref}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex h-11 items-center gap-3 rounded-[10px] px-3 font-semibold text-ink transition hover:bg-flow-50 hover:text-flow-700 focus-visible:bg-flow-50 focus-visible:outline-none"
                      >
                        <LayoutDashboard aria-hidden="true" className="size-5" />
                        Dashboard
                      </Link>
                      <Link
                        role="menuitem"
                        href={profileHref}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex h-11 items-center gap-3 rounded-[10px] px-3 font-semibold text-ink transition hover:bg-flow-50 hover:text-flow-700 focus-visible:bg-flow-50 focus-visible:outline-none"
                      >
                        <UserRound aria-hidden="true" className="size-5" />
                        Profile
                      </Link>
                      <button
                        role="menuitem"
                        type="button"
                        onClick={() => void handleLogout()}
                        disabled={isLoggingOut}
                        className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left font-semibold text-error transition hover:bg-[#FFF0F2] focus-visible:bg-[#FFF0F2] focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
                      >
                        <LogOut aria-hidden="true" className="size-5" />
                        {isLoggingOut ? "Logging out…" : "Logout"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                aria-current={pathname === "/login" ? "page" : undefined}
                className={linkClasses(pathname === "/login")}
              >
                Login
              </Link>
              <Link
                href="/register"
                aria-current={pathname === "/register" ? "page" : undefined}
                className={cn(
                  "mr-2 inline-flex h-10 items-center rounded-[10px] bg-flow-700 px-4 text-sm font-semibold text-white transition hover:bg-flow-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flow-600",
                  pathname === "/register" && "bg-flow-900",
                )}
              >
                Register
              </Link>
            </>
          )}
          <DeveloperLink />
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          {!isPending && isAuthenticated ? (
            <>
              <Link
                href={creditsHref}
                aria-label={`Available credits: ${profile?.credits ?? "loading"}`}
                className="flex h-10 items-center gap-1.5 rounded-[10px] bg-flow-50 px-2.5 text-sm font-bold text-flow-800 transition hover:bg-flow-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flow-600"
              >
                <Coins aria-hidden="true" className="size-4" />
                <span className="tabular-nums">{profile?.credits ?? "—"}</span>
              </Link>
              <NotificationCenter triggerClassName="size-10" />
            </>
          ) : null}

          <button
            ref={mobileTriggerRef}
            type="button"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation"
            aria-label={
              isMobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            onClick={() => setIsMobileOpen((current) => !current)}
            className="flex size-10 items-center justify-center rounded-[10px] border border-border bg-white text-flow-950 transition hover:bg-flow-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flow-600"
          >
            {isMobileOpen ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </PageContainer>

      {isMobileOpen ? (
        <div className="fixed inset-x-0 top-20 z-30 h-[calc(100dvh-5rem)] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileOpen(false)}
            className="absolute inset-0 bg-flow-950/35 backdrop-blur-[2px]"
          />
          <aside
            ref={drawerRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute top-0 right-0 flex h-full w-[min(22rem,calc(100vw-2rem))] flex-col overflow-y-auto border-l border-border-subtle bg-white p-4 shadow-2xl"
          >
            {!isPending && isAuthenticated ? (
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-flow-50 p-3">
                <Avatar
                  name={displayName}
                  src={profileImage}
                  size={46}
                  className="border border-flow-200"
                />
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-ink-strong">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-ink-muted">{email}</p>
                  {profile ? (
                    <p className="mt-1 text-xs font-bold text-flow-700">
                      {roleLabels[profile.role]}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <nav aria-label="Mobile navigation links" className="space-y-1">
              <Link
                href="/campaigns"
                onClick={() => setIsMobileOpen(false)}
                aria-current={
                  isActivePath(pathname, "/campaigns") ? "page" : undefined
                }
                className={cn(
                  "flex h-11 items-center rounded-[10px] px-3 font-semibold transition focus-visible:outline-2 focus-visible:outline-flow-600",
                  isActivePath(pathname, "/campaigns")
                    ? "bg-flow-100 text-flow-800"
                    : "text-ink hover:bg-flow-50 hover:text-flow-700",
                )}
              >
                Explore Campaigns
              </Link>

              {!isPending && isAuthenticated ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-11 items-center gap-3 rounded-[10px] px-3 font-semibold text-ink transition hover:bg-flow-50 hover:text-flow-700 focus-visible:outline-2 focus-visible:outline-flow-600"
                  >
                    <LayoutDashboard
                      aria-hidden="true"
                      className="size-5"
                    />
                    Dashboard
                  </Link>
                  <Link
                    href={profileHref}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-11 items-center gap-3 rounded-[10px] px-3 font-semibold text-ink transition hover:bg-flow-50 hover:text-flow-700 focus-visible:outline-2 focus-visible:outline-flow-600"
                  >
                    <UserRound aria-hidden="true" className="size-5" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                    className="flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left font-semibold text-error transition hover:bg-[#FFF0F2] focus-visible:outline-2 focus-visible:outline-error disabled:cursor-wait disabled:opacity-60"
                  >
                    <LogOut aria-hidden="true" className="size-5" />
                    {isLoggingOut ? "Logging out…" : "Logout"}
                  </button>
                </>
              ) : !isPending ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-11 items-center justify-center rounded-[10px] border border-border font-semibold text-flow-700 focus-visible:outline-2 focus-visible:outline-flow-600"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex h-11 items-center justify-center rounded-[10px] bg-flow-700 font-semibold text-white focus-visible:outline-2 focus-visible:outline-flow-600"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div
                  aria-label="Restoring session"
                  className="h-11 animate-pulse rounded-[10px] bg-canvas-muted"
                />
              )}
            </nav>

            <div className="mt-auto pt-6">
              <DeveloperLink
                mobile
                onNavigate={() => setIsMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
