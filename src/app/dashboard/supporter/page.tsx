import { HeartHandshake } from "lucide-react";

import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

export default function SupporterDashboardPage() {
  return (
    <DashboardWelcome
      eyebrow="Supporter dashboard"
      title="Welcome to your supporter space"
      description="Your private FundFlow area is ready for upcoming contribution, credit, and campaign-tracking tools."
      icon={HeartHandshake}
    />
  );
}
