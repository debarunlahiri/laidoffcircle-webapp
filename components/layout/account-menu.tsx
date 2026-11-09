"use client";

import { useAuth, userInitials } from "@/providers/auth-provider";
import { googleSignInAvailable } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/avatar";
import { useConfirm } from "@/providers/confirm-provider";
import { usePlatform } from "@/providers/platform-provider";
import {
  Bookmark,
  ChevronDown,
  CircleHelp,
  UserRound,
  LogOut,
  Link as LinkIcon,
  Moon,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import WhatsNewDialog from "@/components/layout/whats-new-dialog";
import { latestRelease } from "@/config/release-notes";
import { useTheme } from "@/hooks/use-theme";

export default function AccountMenu() {
  const { user, logout, linkGoogle } = useAuth();
  const router = useRouter();
  const confirm = useConfirm();
  const { theme, toggle: toggleTheme } = useTheme();
  const container = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState(false);
  const [unseen, setUnseen] = useState(false);
  useEffect(() => {
    try {
      setUnseen(
        localStorage.getItem("laidoffcircle:whatsnew") !== latestRelease,
      );
    } catch {}
  }, []);
  const trigger = useRef<HTMLButtonElement>(null);
  const { notify, accountOpen: open, setAccountOpen: setOpen } = usePlatform();

  useEffect(() => {
    if (!open) return;

    function closeOutside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    }

    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!user)
    return (
      <Link className="primary" href="/login">
        Sign in
      </Link>
    );

  return (
    <div
      className="account-menu"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Link
        className="account-profile-link"
        href="/profile"
        aria-label="Open your profile"
        onClick={() => setOpen(false)}
      >
        <Avatar
          initials={userInitials(user?.name ?? "Member")}
          src={user?.profileImageUrl}
          small
        />
        <span className="account-summary">
          <strong>{user?.name ?? "Your account"}</strong>
          <small>View your profile</small>
        </span>
      </Link>
      <button
        ref={trigger}
        className="icon-button account-menu-trigger"
        aria-label="Account options"
        aria-expanded={open}
        aria-controls={open ? "account-options" : undefined}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <ChevronDown size={18} />
      </button>
      {open && (
        <div className="account-dropdown card" id="account-options">
          <div className="account-dropdown-heading">
            <strong>{user?.name ?? "Your account"}</strong>
            <span>Your account</span>
          </div>
          <Link href="/profile" onClick={() => setOpen(false)}>
            <UserRound size={18} /> View profile
          </Link>
          <Link href="/bookmarks" onClick={() => setOpen(false)}>
            <Bookmark size={18} /> Saved posts
          </Link>
          <Link href="/settings" onClick={() => setOpen(false)}>
            <Settings size={18} /> Settings
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              setNotes(true);
              setUnseen(false);
              try {
                localStorage.setItem("laidoffcircle:whatsnew", latestRelease);
              } catch {}
            }}
          >
            <Sparkles size={18} />
            <span>What’s new</span>
            {unseen && <span className="new-dot" aria-label="New" />}
          </button>
          <button
            role="menuitemcheckbox"
            aria-checked={theme === "dark"}
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            <span
              className={`theme-switch ${theme === "dark" ? "on" : ""}`}
              aria-hidden="true"
            />
          </button>
          {googleSignInAvailable && !user.googleLinked && (
            <button
              onClick={async () => {
                setOpen(false);
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
                }
              }}
            >
              <LinkIcon size={18} />
              Link Google account
            </button>
          )}
          <button
            onClick={async () => {
              setOpen(false);
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
            <LogOut size={18} />
            Sign out
          </button>
          <button
            onClick={() => {
              setOpen(false);
              router.push("/support");
            }}
          >
            <CircleHelp size={18} /> Help & support
          </button>
        </div>
      )}
      {notes && <WhatsNewDialog onClose={() => setNotes(false)} />}
    </div>
  );
}
