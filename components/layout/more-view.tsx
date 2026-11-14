"use client";
import WhatsNewDialog from "@/components/layout/whats-new-dialog";
import { latestRelease } from "@/config/release-notes";
import { googleSignInAvailable } from "@/lib/firebase";
import { useEffect, useState } from "react";
import VerifiedBadge from "@/components/ui/verified-badge";
import Avatar from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, userInitials } from "@/providers/auth-provider";
import { useConfirm } from "@/providers/confirm-provider";
import { usePlatform } from "@/providers/platform-provider";
import {
  Bell,
  BarChart3,
  Bookmark,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  KeyRound,
  Link as LinkIcon,
  LogIn,
  LogOut,
  Moon,
  MessagesSquare,
  Sun,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SiteFooter from "./site-footer";

const tiles = [
  { label: "Messages", text: "Messages", icon: MessagesSquare },
  { label: "My network", text: "Network", icon: Users },
  { label: "Referrals", text: "Referrals", icon: BriefcaseBusiness },
  { label: "Workforce insights", text: "Insights", icon: BarChart3 },
  { label: "Bookmarks", text: "Saved", icon: Bookmark },
  { label: "Notifications", text: "Alerts", icon: Bell },
] as const;

export default function MoreView() {
  const { navigate, notify, notificationCount, unreadMessageCount } =
    usePlatform();
  const { user, logout, linkGoogle } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const confirm = useConfirm();
  const dark = theme === "dark";
  const [notes, setNotes] = useState(false);
  const [unseen, setUnseen] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);

  useEffect(() => {
    try {
      setUnseen(
        localStorage.getItem("laidoffcircle:whatsnew") !== latestRelease,
      );
    } catch {}
  }, []);

  function openReleaseNotes() {
    setNotes(true);
    setUnseen(false);
    try {
      localStorage.setItem("laidoffcircle:whatsnew", latestRelease);
    } catch {}
  }

  return (
    <div className="more-page">
      {/* ── Profile hero card ── */}
      {user ? (
        <div className="more-profile-card">
          <div className="more-profile-top">
            <span className="more-profile-avatar">
              <Avatar
                initials={userInitials(user.name)}
                src={user.profileImageUrl}
              />
            </span>
            <div className="more-profile-actions">
              <Link href="/profile/edit" className="more-profile-edit-btn">
                Edit profile
              </Link>
            </div>
          </div>
          <div className="more-profile-name">
            {user.name}
            <VerifiedBadge type={user.badge} />
          </div>
          {(user.role || user.about) && (
            <div className="more-profile-headline">
              {user.role ?? user.about}
            </div>
          )}
          {user.username && (
            <div
              className="more-profile-headline"
              style={{ marginTop: 2, opacity: 0.65 }}
            >
              @{user.username}
            </div>
          )}
          <div className="more-profile-stats">
            <Link
              href="/profile"
              className="more-profile-stat"
              style={{ textDecoration: "none" }}
            >
              <strong>View</strong>
              <span>Profile</span>
            </Link>
          </div>
        </div>
      ) : (
        <Link href="/login" className="more-signin-card">
          <span className="more-signin-icon">
            <LogIn size={24} />
          </span>
          <span className="more-signin-text">
            <strong>Sign in to LaidOffCircle</strong>
            <small>Connect with people on a similar journey</small>
          </span>
          <ChevronRight
            size={18}
            style={{ color: "var(--text-3)", flexShrink: 0 }}
          />
        </Link>
      )}

      {/* ── Quick-access grid ── */}
      <div className="more-grid">
        {tiles.map(({ label, text, icon: Icon }) => (
          <button key={label} onClick={() => navigate(label, "more")}>
            <span className="more-tile-icon">
              <Icon size={22} />
              {label === "Notifications" && notificationCount > 0 && (
                <i>{notificationCount > 9 ? "9+" : notificationCount}</i>
              )}
              {label === "Messages" && unreadMessageCount > 0 && (
                <i aria-label={`${unreadMessageCount} unread messages`}>
                  {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                </i>
              )}
            </span>
            {text}
          </button>
        ))}
        <Link href="/support">
          <span className="more-tile-icon">
            <CircleHelp size={22} />
          </span>
          Help
        </Link>
      </div>

      {/* ── Settings ── */}
      <div className="more-list card">
        <Link href="/settings">
          <Settings size={20} />
          <span>Settings</span>
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
        {user?.isAdmin && (
          <Link href="/admin/agent-keys">
            <KeyRound size={20} />
            <span>Agent API keys</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        )}
        <button type="button" onClick={openReleaseNotes}>
          <Sparkles size={20} />
          <span>What’s new</span>
          {unseen && <i className="new-dot" aria-label="New release notes" />}
        </button>
        <button role="switch" aria-checked={dark} onClick={toggle}>
          {dark ? <Sun size={20} /> : <Moon size={20} />}
          <span>{dark ? "Light mode" : "Dark mode"}</span>
          <span
            className={`theme-switch${dark ? " on" : ""}`}
            aria-hidden="true"
          />
        </button>
        {user && googleSignInAvailable && !user.googleLinked && (
          <button
            type="button"
            disabled={linkingGoogle}
            onClick={async () => {
              setLinkingGoogle(true);
              try {
                await linkGoogle();
                notify(
                  "Google account linked. You can now sign in with Google.",
                );
              } catch (error) {
                notify(
                  error instanceof Error
                    ? error.message
                    : "Google could not be linked.",
                );
              } finally {
                setLinkingGoogle(false);
              }
            }}
          >
            <LinkIcon size={20} />
            <span>
              {linkingGoogle
                ? "Linking Google account…"
                : "Link Google account"}
            </span>
          </button>
        )}
        {user && (
          <button
            className="danger"
            onClick={async () => {
              if (
                !(await confirm({
                  title: "Sign out?",
                  message: "You can sign back in any time.",
                  confirmLabel: "Sign out",
                  tone: "danger",
                }))
              )
                return;
              try {
                await logout();
                router.replace("/");
              } catch {
                notify("Could not sign out. Please try again.");
              }
            }}
          >
            <LogOut size={20} />
            <span>Sign out</span>
          </button>
        )}
      </div>
      <SiteFooter />
      {notes && <WhatsNewDialog onClose={() => setNotes(false)} />}
    </div>
  );
}
