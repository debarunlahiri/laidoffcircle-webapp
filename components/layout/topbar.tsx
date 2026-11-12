"use client";
import { usePlatform } from "@/providers/platform-provider";
import { ArrowRight, Bell, MessagesSquare, Search, X } from "lucide-react";

import { Suspense, useEffect, useRef } from "react";
import AppHeader from "@/components/layout/app-header";
import HeaderSearch from "@/components/search/header-search";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationRow from "@/components/notifications/notification-row";
import { notificationMeta } from "@/lib/notification-meta";
import type { ApiNotification } from "@/lib/api-types";
import { settingsSections } from "@/config/settings";

const morePageTitles: Record<string, string> = {
  "/network": "Network",
  "/referrals": "Referrals",
  "/insights": "Insights",
  "/bookmarks": "Saved",
  "/notifications": "Alerts",
  "/support": "Help",
  "/settings": "Settings",
  "/profile": "Profile",
};

export default function Topbar() {
  const {
    currentUser,
    notifications,
    setNotifications,
    notificationItems,
    notificationCount,
    notificationsLoading,
    notificationsError,
    markNotificationRead,
    navigationSource,
    unreadMessageCount,
  } = usePlatform();

  const notificationTrigger = useRef<HTMLButtonElement>(null);
  const notificationPanel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchReturnPath = useRef("/");

  useEffect(() => {
    setNotifications(false);
  }, [pathname]);

  useEffect(() => {
    if (!notifications) return;
    function outside(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !notificationTrigger.current?.contains(target) &&
        !notificationPanel.current?.contains(target)
      )
        setNotifications(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotifications(false);
        notificationTrigger.current?.focus();
      }
    }
    function focusOutside(event: FocusEvent) {
      const target = event.target as Node;
      if (
        !notificationTrigger.current?.contains(target) &&
        !notificationPanel.current?.contains(target)
      )
        setNotifications(false);
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    document.addEventListener("focusin", focusOutside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("focusin", focusOutside);
    };
  }, [notifications]);

  const settingsSection = settingsSections.find(
    (item) => pathname === `/settings/${item.slug}`,
  );
  const openedAsTab =
    navigationSource === "bottom-nav" ||
    (pathname === "/network" && navigationSource !== "more");
  const menuTitle = openedAsTab ? undefined : morePageTitles[pathname];
  const back = pathname.startsWith("/posts/")
    ? { href: "/", label: "Back to feed", title: "Post" }
    : pathname.startsWith("/referrals/")
      ? {
          href: "/referrals",
          label: "Back to referrals",
          title: pathname === "/referrals/new" ? "Add referral" : "Referral",
        }
      : settingsSection
        ? {
            href: "/settings",
            label: "Back to settings",
            title: settingsSection.label,
          }
        : pathname.startsWith("/support/")
          ? {
              href: "/support",
              label: "Back to help",
              title: pathname === "/support/new" ? "New request" : "Request",
            }
          : pathname === "/profile/edit"
            ? {
                href: "/profile",
                label: "Back to profile",
                title: "Edit profile",
              }
            : menuTitle
              ? { href: "/more", label: "Back to More", title: menuTitle }
              : null;

  if (pathname.startsWith("/users/")) {
    return (
      <AppHeader
        title="Profile"
        back={{ href: "/network", label: "Back to network" }}
      />
    );
  }

  if (back) return <AppHeader title={back.title} back={back} />;

  if (pathname === "/search") {
    return (
      <AppHeader className="topbar-searching">
        <Suspense fallback={<span role="status">Loading search…</span>}>
          <HeaderSearch
            onCancel={() => router.replace(searchReturnPath.current)}
          />
        </Suspense>
      </AppHeader>
    );
  }

  const tabTitle = (
    {
      "/explore": "Explore",
      "/network": "Network",
      "/more": "More",
      "/messages": "Messages",
    } as Record<string, string>
  )[pathname];

  return (
    <AppHeader
      title={tabTitle}
      actions={
        <>
          <Link
            href="/search"
            className="icon-button"
            aria-label="Search"
            onClick={() => {
              searchReturnPath.current =
                window.location.pathname + window.location.search;
              setNotifications(false);
            }}
          >
            <Search size={20} strokeWidth={1.8} />
          </Link>

          {currentUser && (
            <Link
              href="/messages"
              className="icon-button header-messages"
              aria-label={
                unreadMessageCount
                  ? `Messages, ${unreadMessageCount} unread`
                  : "Messages"
              }
            >
              <MessagesSquare size={20} strokeWidth={1.8} />
              {unreadMessageCount > 0 && (
                <span className="header-message-count">
                  {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                </span>
              )}
            </Link>
          )}
          <div className="notification-anchor" style={{ position: "relative" }}>
            <button
              ref={notificationTrigger}
              className="notification-button icon-button"
              aria-label="Notifications"
              aria-expanded={notifications}
              aria-controls={notifications ? "notification-panel" : undefined}
              onClick={() => {
                if (!currentUser) {
                  window.location.assign(
                    `/login?next=${encodeURIComponent(pathname)}`,
                  );
                  return;
                }
                setNotifications(!notifications);
              }}
            >
              <Bell size={20} strokeWidth={1.8} />
              {notificationCount > 0 && (
                <i aria-label={`${notificationCount} unread`}>
                  {notificationCount > 9 ? "9+" : notificationCount}
                </i>
              )}
            </button>

            {/* Notification drop-down (becomes a bottom sheet via CSS) */}
            {notifications && (
              <div
                ref={notificationPanel}
                className="notification-panel card"
                id="notification-panel"
                role="region"
                aria-label="Notifications"
              >
                <div className="notification-panel-heading">
                  <h3>
                    Notifications
                    {notificationCount > 0 && (
                      <span className="new-badge">{notificationCount} new</span>
                    )}
                  </h3>
                  <button
                    className="icon-button"
                    aria-label="Close notifications"
                    onClick={() => {
                      setNotifications(false);
                      notificationTrigger.current?.focus();
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
                {notificationsLoading && !notificationItems.length && (
                  <p
                    role="status"
                    style={{ padding: "16px", color: "var(--text-3)" }}
                  >
                    Loading…
                  </p>
                )}
                {notificationsError && (
                  <p
                    role="alert"
                    style={{ padding: "16px", color: "var(--danger)" }}
                  >
                    {notificationsError}
                  </p>
                )}
                {!notificationsLoading && !notificationItems.length && (
                  <p
                    style={{
                      padding: "16px 16px 20px",
                      color: "var(--text-3)",
                      fontSize: 14,
                    }}
                  >
                    You’re all caught up. 🎉
                  </p>
                )}
                {notificationItems.slice(0, 5).map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onOpen={(row: ApiNotification) => {
                      if (!row.readAt) void markNotificationRead(row.id);
                      setNotifications(false);
                      router.push(notificationMeta(row).href);
                    }}
                  />
                ))}
                <div className="notification-panel-footer">
                  {notificationCount > 0 ? (
                    <button
                      className="text-button"
                      onClick={() => void markNotificationRead()}
                    >
                      Mark all read
                    </button>
                  ) : (
                    <span />
                  )}
                  <Link
                    className="text-button"
                    href="/notifications"
                    onClick={() => setNotifications(false)}
                  >
                    See all <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {!currentUser && (
            <Link className="primary" href="/login">
              Sign in
            </Link>
          )}
        </>
      }
    >
      <Link href="/" className="topbar-brand" aria-label="LaidOffCircle home">
        <span className="topbar-brand-mark" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="15" fill="#3159df" />
            <g stroke="#fff" strokeWidth="4.5">
              <circle cx="24" cy="26" r="12" />
              <circle cx="40" cy="26" r="12" />
              <circle cx="32" cy="40" r="12" fill="#3159df" />
            </g>
          </svg>
        </span>
        <span>
          Laidoff<span style={{ color: "var(--brand)" }}>Circle</span>
        </span>
      </Link>
    </AppHeader>
  );
}
