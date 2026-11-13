"use client";
import { usePlatform } from "@/providers/platform-provider";
import { Bell, MessagesSquare, Search } from "lucide-react";

import { Suspense, useEffect, useRef } from "react";
import AppHeader from "@/components/layout/app-header";
import HeaderSearch from "@/components/search/header-search";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
    setNotifications,
    notificationCount,
    navigationSource,
    unreadMessageCount,
  } = usePlatform();

  const pathname = usePathname();
  const router = useRouter();
  const searchReturnPath = useRef("/");

  useEffect(() => {
    setNotifications(false);
  }, [pathname]);

  const settingsSection = settingsSections.find(
    (item) => pathname === `/settings/${item.slug}`,
  );
  const openedAsTab =
    navigationSource === "bottom-nav" ||
    (pathname === "/network" && navigationSource !== "more");
  const menuTitle = openedAsTab ? undefined : morePageTitles[pathname];
  const back =
    pathname === "/notifications"
      ? { href: "/", label: "Back", title: "Notifications" }
      : pathname.startsWith("/posts/")
        ? { href: "/", label: "Back to feed", title: "Post" }
        : pathname.startsWith("/referrals/")
          ? {
              href: "/referrals",
              label: "Back to referrals",
              title:
                pathname === "/referrals/new" ? "Add referral" : "Referral",
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
                  title:
                    pathname === "/support/new" ? "New request" : "Request",
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
          <Link
            href={
              currentUser
                ? "/notifications"
                : `/login?next=${encodeURIComponent(pathname)}`
            }
            className="notification-button icon-button"
            aria-label={
              notificationCount
                ? `Notifications, ${notificationCount} unread`
                : "Notifications"
            }
            onClick={() => setNotifications(false)}
          >
            <Bell size={20} strokeWidth={1.8} />
            {notificationCount > 0 && (
              <i aria-hidden="true">
                {notificationCount > 9 ? "9+" : notificationCount}
              </i>
            )}
          </Link>

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
