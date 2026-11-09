"use client";
import { useAuth } from "@/providers/auth-provider";
import { api, apiMessage, invalidate } from "@/lib/api";
import type { ApiNotification } from "@/lib/api-types";
import { useApiList, useApiResource } from "./use-api-resource";
export function useNotifications(
  notify: (message: string) => void,
  live: boolean,
) {
  const { user } = useAuth();
  const summary = useApiResource<{ unread: number; unreadMessages: number }>(
    user ? "/notifications/summary" : null,
    { unread: 0, unreadMessages: 0 },
    live ? 0 : 20000, // poll only while the live connection is down
  );
  const list = useApiList<ApiNotification>(
    user ? "/notifications" : null,
    live ? 0 : 20000,
  );
  async function markNotificationRead(id?: string) {
    try {
      await api(id ? `/notifications/${id}/read` : "/notifications/read", {
        method: "PUT",
      });
      invalidate("notifications");
    } catch (error) {
      notify(apiMessage(error));
    }
  }
  return {
    notificationItems: list.data,
    notificationCount: Number(summary.data.unread),
    unreadMessageCount: Number(summary.data.unreadMessages),
    notificationsLoading: list.loading,
    notificationsError: list.error,
    notificationsHasMore: list.hasMore,
    loadMoreNotifications: list.loadMore,
    markNotificationRead,
  };
}
