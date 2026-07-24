import axios from "axios";

import { apiClient } from "@/lib/api-client";

import type {
  DashboardNotification,
  NotificationPage,
} from "../types/notification";

interface NotificationPageResponse {
  success: true;
  data: NotificationPage;
}

interface UnreadCountResponse {
  success: true;
  data: { unreadCount: number };
}

interface NotificationResponse {
  success: true;
  data: { notification: DashboardNotification };
}

export const getNotifications = async (): Promise<NotificationPage> => {
  try {
    const response = await apiClient.get<NotificationPageResponse>(
      "/notifications",
      { params: { page: 1, limit: 20 } },
    );
    return response.data.data;
  } catch (error) {
    throw getNotificationError(error, "Unable to load notifications");
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await apiClient.get<UnreadCountResponse>(
      "/notifications/unread-count",
    );
    return response.data.data.unreadCount;
  } catch (error) {
    throw getNotificationError(error, "Unable to load unread notifications");
  }
};

export const markNotificationRead = async (
  notificationId: string,
): Promise<DashboardNotification> => {
  try {
    const response = await apiClient.patch<NotificationResponse>(
      `/notifications/${notificationId}/read`,
    );
    return response.data.data.notification;
  } catch (error) {
    throw getNotificationError(error, "Unable to update this notification");
  }
};

export const markAllNotificationsRead = async (): Promise<void> => {
  try {
    await apiClient.patch("/notifications/read-all");
  } catch (error) {
    throw getNotificationError(error, "Unable to update notifications");
  }
};

const getNotificationError = (
  error: unknown,
  fallbackMessage: string,
): Error => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return new Error(error.response?.data.message ?? fallbackMessage);
  }
  return new Error(fallbackMessage);
};
