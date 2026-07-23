import { Lightbulb } from "lucide-react";

import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

export default function CreatorDashboardPage() {
  return (
    <DashboardWelcome
      eyebrow="Creator dashboard"
      title="Welcome to your creator space"
      description="Your private FundFlow area is ready for upcoming campaign, contribution-review, and withdrawal tools."
      icon={Lightbulb}
    />
  );
}
