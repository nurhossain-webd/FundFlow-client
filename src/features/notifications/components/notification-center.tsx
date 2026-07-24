"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  Inbox,
  LoaderCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import toast from "react-hot-toast";

import { cn } from "@/lib/utils";
import { isSafeInternalPath } from "@/lib/safe-navigation";

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks/use-notifications";
import type { DashboardNotification } from "../types/notification";

interface NotificationCenterProps {
  triggerClassName?: string;
}

export function NotificationCenter({
  triggerClassName,
}: NotificationCenterProps = {}) {
  const router = useRouter();
  const popupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const unreadQuery = useUnreadNotificationCount();
  const notificationsQuery = useNotifications(isOpen);
  const readMutation = useMarkNotificationRead();
  const readAllMutation = useMarkAllNotificationsRead();
  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = unreadQuery.data ?? 0;
  const isUpdating = readMutation.isPending || readAllMutation.isPending;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    popupRef.current?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const openNotification = async (notification: DashboardNotification) => {
    try {
      await readMutation.mutateAsync(notification.id);
      setIsOpen(false);

      if (
        notification.actionRoute &&
        isSafeInternalPath(notification.actionRoute)
      ) {
        router.push(notification.actionRoute);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open this notification",
      );
    }
  };

  const markAllRead = async () => {
    try {
      await readAllMutation.mutateAsync();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update notifications",
      );
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={
          unreadCount > 0
            ? `Open notifications, ${unreadCount} unread`
            : "Open notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={popupId}
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "relative flex size-11 items-center justify-center rounded-[10px] border border-border bg-white text-ink-muted transition hover:border-flow-300 hover:bg-flow-50 hover:text-flow-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flow-600",
          triggerClassName,
        )}
      >
        <Bell aria-hidden="true" className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-coral-700 px-1 text-[0.65rem] leading-none font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          ref={popupRef}
          id={popupId}
          role="dialog"
          aria-modal="false"
          aria-label="Notifications"
          tabIndex={-1}
          className="fixed top-[5.25rem] right-2 left-2 z-50 max-h-[calc(100dvh-6rem)] overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-[0_24px_70px_rgba(6,47,53,0.22)] outline-none sm:absolute sm:top-14 sm:right-0 sm:left-auto sm:max-h-[min(72vh,580px)] sm:w-[min(400px,calc(100vw-2rem))]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-4 py-3.5">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-strong">
                Notifications
              </h2>
              <p className="text-xs text-ink-muted">
                {unreadCount > 0
                  ? `${unreadCount.toLocaleString()} unread`
                  : "You’re all caught up"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => void markAllRead()}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-flow-700 transition hover:bg-flow-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {readAllMutation.isPending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <CheckCheck aria-hidden="true" className="size-4" />
                )}
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[calc(100dvh-10.5rem)] overflow-y-auto sm:max-h-[calc(min(72vh,580px)-72px)]">
            {notificationsQuery.isLoading ? (
              <div className="space-y-3 p-4" aria-label="Loading notifications">
                {Array.from({ length: 4 }, (_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-xl bg-canvas-muted"
                  />
                ))}
              </div>
            ) : notificationsQuery.isError ? (
              <div className="px-6 py-10 text-center">
                <CircleAlert
                  aria-hidden="true"
                  className="mx-auto size-8 text-error"
                />
                <p className="mt-3 font-semibold text-ink-strong">
                  Notifications could not be loaded
                </p>
                <button
                  type="button"
                  onClick={() => void notificationsQuery.refetch()}
                  className="mt-3 rounded-lg px-3 py-2 text-sm font-semibold text-flow-700 hover:bg-flow-50"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Inbox
                  aria-hidden="true"
                  className="mx-auto size-9 text-ink-subtle"
                />
                <p className="mt-3 font-semibold text-ink-strong">
                  No notifications yet
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Campaign, contribution, payment, and withdrawal updates will
                  appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => void openNotification(notification)}
                      className={cn(
                        "block w-full px-4 py-4 text-left transition hover:bg-flow-50 focus-visible:bg-flow-50 disabled:cursor-wait",
                        !notification.isRead && "bg-flow-50/60",
                      )}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-2 size-2 shrink-0 rounded-full",
                            notification.isRead ? "bg-border" : "bg-coral-600",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span className="font-display text-sm font-bold text-ink-strong">
                              {notification.title}
                            </span>
                            <time
                              dateTime={notification.time}
                              className="shrink-0 text-[0.7rem] text-ink-subtle"
                            >
                              {formatDistanceToNow(
                                new Date(notification.time),
                                { addSuffix: true },
                              )}
                            </time>
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-ink-muted">
                            {notification.message}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
