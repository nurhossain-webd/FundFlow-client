import {
  Bell,
  CircleDollarSign,
  Coins,
  CreditCard,
  FileWarning,
  HandCoins,
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import type { UserProfile } from "@/features/auth/types/user-profile";

export interface DashboardNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface DashboardNavigationGroup {
  label: string;
  items: DashboardNavigationItem[];
}

const sharedAccountItems = (
  role: UserProfile["role"],
): DashboardNavigationGroup => ({
  label: "Account",
  items: [
    {
      label: "Notifications",
      href: `/dashboard/${role}/notifications`,
      icon: Bell,
    },
    {
      label: "Profile",
      href: `/dashboard/${role}/profile`,
      icon: UserRound,
    },
  ],
});

const navigationByRole: Record<
  UserProfile["role"],
  DashboardNavigationGroup[]
> = {
  supporter: [
    {
      label: "Supporter",
      items: [
        {
          label: "Overview",
          href: "/dashboard/supporter",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Explore campaigns",
          href: "/campaigns",
          icon: Search,
        },
        {
          label: "My contributions",
          href: "/dashboard/supporter/contributions",
          icon: HandCoins,
        },
        {
          label: "Buy credits",
          href: "/dashboard/supporter/credits",
          icon: Coins,
        },
        {
          label: "Payment history",
          href: "/dashboard/supporter/payments",
          icon: CreditCard,
        },
      ],
    },
    sharedAccountItems("supporter"),
  ],
  creator: [
    {
      label: "Creator",
      items: [
        {
          label: "Overview",
          href: "/dashboard/creator",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "My campaigns",
          href: "/dashboard/creator/campaigns",
          icon: Megaphone,
        },
        {
          label: "Create campaign",
          href: "/dashboard/creator/campaigns/new",
          icon: PlusCircle,
        },
        {
          label: "Contributions",
          href: "/dashboard/creator/contributions",
          icon: HandCoins,
        },
        {
          label: "Withdrawals",
          href: "/dashboard/creator/withdrawals",
          icon: WalletCards,
        },
      ],
    },
    sharedAccountItems("creator"),
  ],
  admin: [
    {
      label: "Administration",
      items: [
        {
          label: "Overview",
          href: "/dashboard/admin",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          label: "Campaign review",
          href: "/dashboard/admin/campaigns",
          icon: ShieldCheck,
        },
        {
          label: "Users",
          href: "/dashboard/admin/users",
          icon: UsersRound,
        },
        {
          label: "Withdrawals",
          href: "/dashboard/admin/withdrawals",
          icon: CircleDollarSign,
        },
        {
          label: "Credit payments",
          href: "/dashboard/admin/payments",
          icon: CreditCard,
        },
        {
          label: "Reports",
          href: "/dashboard/admin/reports",
          icon: FileWarning,
        },
      ],
    },
    sharedAccountItems("admin"),
  ],
};

export const getDashboardNavigation = (
  role: UserProfile["role"],
): DashboardNavigationGroup[] => navigationByRole[role];
