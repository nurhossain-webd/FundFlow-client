import dynamic from "next/dynamic";

import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";

const SupporterDashboard = dynamic(
  () =>
    import("@/features/dashboard/components/supporter-dashboard").then(
      (module) => module.SupporterDashboard,
    ),
  { loading: () => <DashboardPageSkeleton /> },
);

export default function SupporterDashboardPage() {
  return <SupporterDashboard />;
}
