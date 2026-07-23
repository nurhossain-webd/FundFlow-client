import type { PropsWithChildren } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PrivateRouteGuard } from "@/features/auth/components/private-route-guard";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <PrivateRouteGuard>
      <DashboardShell>{children}</DashboardShell>
    </PrivateRouteGuard>
  );
}
