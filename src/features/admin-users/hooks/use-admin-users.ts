"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { adminDashboardQueryKey } from "@/features/dashboard/hooks/use-admin-dashboard";

import {
  changeManagedUserRole,
  getManagedUsers,
  removeManagedUser,
} from "../services/admin-user.service";
import type { ManagedUserFilters, ManagedUserRole } from "../types/admin-user";

export const adminUsersQueryKey = ["admin", "users"] as const;

export const useAdminUsers = (filters: ManagedUserFilters) =>
  useQuery({
    queryKey: [...adminUsersQueryKey, filters],
    queryFn: () => getManagedUsers(filters),
    placeholderData: keepPreviousData,
  });

const useRefreshAdminUsers = () => {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminDashboardQueryKey }),
    ]);
  };
};

export const useChangeManagedUserRole = () => {
  const refresh = useRefreshAdminUsers();
  return useMutation({
    mutationFn: ({ role, userId }: { userId: string; role: ManagedUserRole }) =>
      changeManagedUserRole(userId, role),
    onSuccess: refresh,
  });
};

export const useRemoveManagedUser = () => {
  const refresh = useRefreshAdminUsers();
  return useMutation({
    mutationFn: removeManagedUser,
    onSuccess: refresh,
  });
};
