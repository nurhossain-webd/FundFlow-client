import dynamic from "next/dynamic";

import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";

const AdminDashboard = dynamic(
  () =>
    import("@/features/dashboard/components/admin-dashboard").then(
      (module) => module.AdminDashboard,
    ),
  { loading: () => <DashboardPageSkeleton /> },
);

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
