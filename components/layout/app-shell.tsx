"use client";

import SignInDialog from "@/components/auth/sign-in-dialog";
import PostReportDialog from "@/components/feed/post-report-dialog";
import NoteDialog from "@/components/community-notes/note-dialog";
import PostComposerDialog from "@/components/feed/post-composer-dialog";
import ReferralRequestsDialog from "@/components/referrals/referral-requests-dialog";
import ReferralRequestFormDialog from "@/components/referrals/referral-request-form-dialog";
import PageHeading from "@/components/layout/page-heading";
import Topbar from "@/components/layout/topbar";
import VerifyEmailBanner from "@/components/layout/verify-email-banner";
import ConnectionBanner from "@/components/layout/connection-banner";
import VerifyPrompt from "@/components/auth/verify-prompt";
import BottomNav from "@/components/layout/bottom-nav";
import Toast from "@/components/ui/toast";
import { usePlatform } from "@/providers/platform-provider";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: ReactNode }) {
  const { section } = usePlatform();
  const pathname = usePathname();
  const settingsScreen =
    pathname === "/settings" || pathname.startsWith("/settings/");
  const editingProfile = pathname === "/profile/edit";
  // The side panels (daily reminder, people, referrals…) belong to the home feed
  // only. A single post (also reported as "Home") reads better full width.
  const showRightRail = section === "Home" && pathname === "/";
  const readingPage =
    pathname === "/explore" ||
    pathname === "/bookmarks" ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/posts/") ||
    (pathname.startsWith("/referrals/") && pathname !== "/referrals/new");
  const [collapsed, setCollapsed] = useState(false);

  // Remember the choice per viewer; storage can be blocked, so guard it.
  useEffect(() => {
    try {
      setCollapsed(
        localStorage.getItem("laidoffcircle:sidebar") === "collapsed",
      );
    } catch {}
  }, []);
  function toggleSidebar() {
    setCollapsed((current) => {
      try {
        localStorage.setItem(
          "laidoffcircle:sidebar",
          current ? "expanded" : "collapsed",
        );
      } catch {}
      return !current;
    });
  }

  return (
    <div
      className={`app-shell${collapsed ? " sidebar-collapsed" : ""}${settingsScreen ? " settings-screen" : ""}${editingProfile ? " profile-edit-screen" : ""}`}
    >
      <div className="workspace">
        <ConnectionBanner />
        <VerifyEmailBanner />
        <Topbar />
        <div
          className={`page-layout${showRightRail ? "" : " page-layout-without-rail"}${section === "Messages" ? " page-layout-wide" : ""}${readingPage ? " page-layout-reading" : ""}`}
        >
          <main key={pathname} className="page-transition">
            <PageHeading />
            {children}
          </main>
        </div>
      </div>
      <PostComposerDialog />
      <ReferralRequestsDialog />
      <ReferralRequestFormDialog />
      <NoteDialog />
      <PostReportDialog />
      <SignInDialog />
      <VerifyPrompt />
      {!settingsScreen && !editingProfile && <BottomNav />}
      <Toast />
    </div>
  );
}
