"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service";

export const notificationsQueryKey = ["notifications", "latest"] as const;
export const unreadNotificationsQueryKey = [
  "notifications",
  "unread-count",
] as const;

export const useUnreadNotificationCount = () =>
  useQuery({
    queryKey: unreadNotificationsQueryKey,
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

export const useNotifications = (enabled: boolean) =>
  useQuery({
    queryKey: notificationsQueryKey,
    queryFn: getNotifications,
    enabled,
    refetchInterval: enabled ? 30_000 : false,
    staleTime: 10_000,
  });

const useRefreshNotifications = () => {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
      queryClient.invalidateQueries({
        queryKey: unreadNotificationsQueryKey,
      }),
    ]);
  };
};

export const useMarkNotificationRead = () => {
  const refresh = useRefreshNotifications();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: refresh,
  });
};

export const useMarkAllNotificationsRead = () => {
  const refresh = useRefreshNotifications();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: refresh,
  });
};
