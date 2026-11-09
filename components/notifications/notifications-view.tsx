"use client";
import PillTabs from "@/components/ui/pill-tabs";
import NotificationRow from "@/components/notifications/notification-row";
import type { ApiNotification } from "@/lib/api-types";
import { notificationMeta } from "@/lib/notification-meta";
import { usePlatform } from "@/providers/platform-provider";
import { Bell, CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NotificationsView() {
  const router = useRouter();
  const {
    notificationItems,
    notificationCount,
    notificationsLoading,
    notificationsError,
    notificationsHasMore,
    loadMoreNotifications,
    markNotificationRead,
  } = usePlatform();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const visible =
    tab === "unread"
      ? notificationItems.filter((item) => !item.readAt)
      : notificationItems;
  const fresh = visible.filter((item) => !item.readAt);
  const earlier = visible.filter((item) => item.readAt);

  function open(item: ApiNotification) {
    if (!item.readAt) void markNotificationRead(item.id);
    router.push(notificationMeta(item).href);
  }
  const group = (title: string, items: ApiNotification[]) =>
    items.length > 0 && (
      <section className="notification-group" aria-label={title}>
        <h2>
          {title} <span>{items.length}</span>
        </h2>
        {items.map((item) => (
          <NotificationRow key={item.id} item={item} detailed onOpen={open} />
        ))}
      </section>
    );

  return (
    <div className="notifications-page card">
      <div className="notifications-toolbar">
        <PillTabs
          label="Notifications"
          items={[
            { key: "all", label: "All" },
            {
              key: "unread",
              label: `Unread${notificationCount > 0 ? ` (${notificationCount})` : ""}`,
            },
          ]}
          active={tab}
          onChange={setTab}
        />
        {notificationCount > 0 && (
          <button
            className="text-button"
            onClick={() => void markNotificationRead()}
          >
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>
      {notificationsLoading && !notificationItems.length && (
        <p role="status">Loading notifications…</p>
      )}
      {notificationsError && <p role="alert">{notificationsError}</p>}
      {!notificationsLoading && !visible.length && (
        <div className="notifications-empty">
          <Bell size={28} />
          <p>
            {tab === "unread"
              ? "No unread notifications."
              : "You’re all caught up."}
          </p>
        </div>
      )}
      {group("New", fresh)}
      {group("Earlier", earlier)}
      {notificationsHasMore && (
        <button
          className="text-button"
          onClick={() => void loadMoreNotifications()}
        >
          Load more
        </button>
      )}
    </div>
  );
}
