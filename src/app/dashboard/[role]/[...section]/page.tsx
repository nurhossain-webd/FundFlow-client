import { LayoutPanelTop } from "lucide-react";
import { notFound } from "next/navigation";

import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

const allowedSections = {
  supporter: [
    "contributions",
    "credits",
    "payments",
    "notifications",
    "profile",
  ],
  creator: [
    "campaigns",
    "campaigns/new",
    "contributions",
    "withdrawals",
    "notifications",
    "profile",
  ],
  admin: [
    "campaigns",
    "users",
    "withdrawals",
    "payments",
    "reports",
    "notifications",
    "profile",
  ],
} as const;

const sectionLabels: Record<string, string> = {
  campaigns: "Campaigns",
  "campaigns/new": "Create campaign",
  contributions: "Contributions",
  credits: "Buy credits",
  withdrawals: "Withdrawals",
  notifications: "Notifications",
  profile: "Profile",
  users: "Users",
  payments: "Credit payments",
  reports: "Reports",
};

interface DashboardSectionPageProps {
  params: Promise<{
    role: string;
    section: string[];
  }>;
}

export default async function DashboardSectionPage({
  params,
}: DashboardSectionPageProps) {
  const { role, section } = await params;
  const sectionPath = section.join("/");

  if (
    !(role in allowedSections) ||
    !allowedSections[role as keyof typeof allowedSections].some(
      (allowedSection) => allowedSection === sectionPath,
    )
  ) {
    notFound();
  }

  const title = sectionLabels[sectionPath] ?? "Dashboard";

  return (
    <DashboardWelcome
      eyebrow={`${role} workspace`}
      title={title}
      description={`${title} is connected to the responsive FundFlow dashboard layout and ready for its dedicated feature workflow.`}
      icon={LayoutPanelTop}
    />
  );
}
