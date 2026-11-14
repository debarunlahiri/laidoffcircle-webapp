"use client";

import { SettingsGroup, SettingsRow } from "@/components/settings/settings-row";
import ChangePasswordSheet from "@/components/settings/change-password-sheet";
import UsernameInput from "@/components/ui/username-input";
import { googleSignInAvailable } from "@/lib/firebase";
import { apiMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { usePlatform } from "@/providers/platform-provider";
import Link from "next/link";
import {
  AtSign,
  Check,
  ChevronRight,
  KeyRound,
  LoaderCircle,
  UserRound,
} from "lucide-react";
import { useState } from "react";

export default function AccountSettings() {
  const { user, updateProfile, linkGoogle } = useAuth();
  const { notify } = usePlatform();
  const [username, setUsername] = useState(user?.username ?? "");
  const [valid, setValid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linking, setLinking] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const normalized = username.trim().replace(/^@/, "").toLowerCase();
  if (!user) return null;

  return (
    <div className="settings-stack">
      <header className="settings-page-heading">
        <p>Your sign-in details and public handle.</p>
      </header>
      <SettingsGroup
        icon={AtSign}
        title="Your public handle"
        description="Choose a username so people can find and mention you."
      >
        <form
          className="settings-username-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (saving || !valid || normalized === user.username) return;
            setSaving(true);
            try {
              await updateProfile({ username: normalized });
              notify("Username updated.");
            } catch (error) {
              notify(apiMessage(error));
            } finally {
              setSaving(false);
            }
          }}
        >
          <UsernameInput
            id="settings-username"
            value={username}
            onChange={setUsername}
            current={user.username}
            onValidity={setValid}
          />
          <button
            className="settings-button settings-button-primary"
            disabled={saving || !valid || normalized === user.username}
          >
            {saving && (
              <LoaderCircle
                size={15}
                className="settings-spinner"
                aria-hidden="true"
              />
            )}
            {saving ? "Saving…" : "Save username"}
          </button>
          {user.username && (
            <p className="settings-profile-address">
              Your profile:{" "}
              <Link href={`/users/${user.username}`}>
                laidoffcircle.com/users/{user.username}
              </Link>
            </p>
          )}
        </form>
      </SettingsGroup>
      <SettingsGroup
        icon={KeyRound}
        title="Sign-in & profile"
        description="Manage your account details and connected sign-in methods."
      >
        <SettingsRow label="Email address">
          <div className="settings-email">
            <span>{user.email}</span>
            <span
              className={`settings-badge${user.emailVerified ? " is-verified" : ""}`}
            >
              {user.emailVerified && <Check size={12} aria-hidden="true" />}
              {user.emailVerified ? "Verified" : "Not verified"}
            </span>
          </div>
        </SettingsRow>
        <SettingsRow
          label="Name and headline"
          hint="Edit these on your profile."
        >
          <Link className="settings-button" href="/profile/edit">
            <UserRound size={15} aria-hidden="true" /> Edit profile{" "}
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </SettingsRow>
        <SettingsRow
          label="Password"
          hint="Changing it signs you out on your other devices."
        >
          <button
            type="button"
            className="settings-button"
            onClick={() => setChangingPassword(true)}
          >
            <KeyRound size={15} aria-hidden="true" /> Change password
          </button>
        </SettingsRow>
        {googleSignInAvailable && (
          <SettingsRow
            label="Google sign-in"
            hint="Use your Google account to sign in."
          >
            {user.googleLinked ? (
              <span className="settings-badge is-verified">
                <Check size={12} aria-hidden="true" /> Connected
              </span>
            ) : (
              <button
                type="button"
                className="settings-button"
                disabled={linking}
                onClick={async () => {
                  setLinking(true);
                  try {
                    await linkGoogle();
                    notify("Google account linked.");
                  } catch (error) {
                    notify(apiMessage(error));
                  } finally {
                    setLinking(false);
                  }
                }}
              >
                {linking && (
                  <LoaderCircle
                    size={15}
                    className="settings-spinner"
                    aria-hidden="true"
                  />
                )}
                {linking ? "Connecting…" : "Connect Google"}
              </button>
            )}
          </SettingsRow>
        )}
      </SettingsGroup>
      {changingPassword && (
        <ChangePasswordSheet onClose={() => setChangingPassword(false)} />
      )}
    </div>
  );
}
