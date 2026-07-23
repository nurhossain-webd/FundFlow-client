import type { PropsWithChildren } from "react";

import { PrivateRouteGuard } from "@/features/auth/components/private-route-guard";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return <PrivateRouteGuard>{children}</PrivateRouteGuard>;
}
