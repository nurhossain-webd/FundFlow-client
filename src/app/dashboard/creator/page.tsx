import dynamic from "next/dynamic";

import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";

const CreatorDashboard = dynamic(
  () =>
    import("@/features/dashboard/components/creator-dashboard").then(
      (module) => module.CreatorDashboard,
    ),
  { loading: () => <DashboardPageSkeleton /> },
);

export default function CreatorDashboardPage() {
  return <CreatorDashboard />;
}
