import { ShieldCheck } from "lucide-react";

import { DashboardWelcome } from "@/components/dashboard/dashboard-welcome";

export default function AdminDashboardPage() {
  return (
    <DashboardWelcome
      eyebrow="Admin dashboard"
      title="Welcome to platform administration"
      description="This private FundFlow area is reserved for verified administrators and upcoming moderation tools."
      icon={ShieldCheck}
    />
  );
}
