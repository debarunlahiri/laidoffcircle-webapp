"use client";

import { SettingsGroup, SettingsRow } from "@/components/settings/settings-row";
import {
  defaultPrivacy,
  visibilityLabels,
  type PrivacySettings,
  type Visibility,
} from "@/config/settings";
import { useApiResource } from "@/hooks/use-api-resource";
import { api, apiMessage, invalidate } from "@/lib/api";
import { usePlatform } from "@/providers/platform-provider";
import {
  Check,
  ChevronDown,
  Eye,
  Globe,
  LockKeyhole,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type Key = keyof PrivacySettings;
const listLevels: Visibility[] = [
  "everyone",
  "members",
  "connections",
  "only_me",
];
const audienceIcons: Record<Visibility, LucideIcon> = {
  everyone: Globe,
  members: Users,
  connections: Users,
  only_me: LockKeyhole,
};
const fieldLabels: Record<Key, string> = {
  profile: "Profile visibility",
  followers: "Followers",
  following: "Following",
  connections: "Connections",
  connect: "Connection requests",
  likes: "Likes received",
  dislikes: "Dislikes received",
  referrals: "Referrals",
};
const activityLevels: Visibility[] = ["everyone", "connections", "only_me"];

export default function PrivacySettingsView() {
  const { notify } = usePlatform();
  const { data, loading, error } = useApiResource<PrivacySettings>(
    "/me/privacy",
    defaultPrivacy,
  );
  const [values, setValues] = useState<PrivacySettings>(defaultPrivacy);
  const [saving, setSaving] = useState<Key | null>(null);
  useEffect(() => setValues(data), [data]);

  async function change<K extends Key>(key: K, value: PrivacySettings[K]) {
    const previous = values[key];
    setValues((current) => ({ ...current, [key]: value }));
    setSaving(key);
    try {
      await api("/me/privacy", { method: "PUT", body: { [key]: value } });
      // Other members' views of this profile may now differ.
      invalidate("/users", "/me/privacy");
      notify("Privacy updated.");
    } catch (err) {
      setValues((current) => ({ ...current, [key]: previous }));
      notify(apiMessage(err));
    } finally {
      setSaving(null);
    }
  }

  function select(key: Key, levels: Visibility[]) {
    const Icon = audienceIcons[values[key]];
    return (
      <div className="settings-audience">
        <Icon size={15} aria-hidden="true" />
        <select
          value={values[key]}
          disabled={loading || !!error || saving !== null}
          onChange={(event) =>
            void change(key, event.target.value as Visibility)
          }
          aria-label={fieldLabels[key]}
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {key === "connect" && level === "only_me"
                ? "No one"
                : visibilityLabels[level]}
            </option>
          ))}
        </select>
        <ChevronDown size={14} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="settings-stack">
      <header className="settings-page-heading">
        <div className="settings-title-line">
          <span className="settings-save-status" role="status">
            {loading ? (
              "Loading preferences…"
            ) : saving ? (
              "Saving…"
            ) : error ? (
              "Preferences unavailable"
            ) : (
              <>
                <Check size={14} aria-hidden="true" /> Changes save
                automatically
              </>
            )}
          </span>
        </div>
        <p>A little more control over what you share, and with whom.</p>
      </header>
      {error && (
        <p className="settings-error" role="alert">
          {error}
        </p>
      )}
      <div className="settings-privacy-note">
        <ShieldCheck size={20} aria-hidden="true" />
        <p>
          <strong>Your visibility, your choice.</strong> You can always see your
          own information, whatever you choose below.
        </p>
      </div>
      <SettingsGroup
        title="Profile visibility"
        icon={Eye}
        description="When your profile is restricted, others only see your name and photo."
      >
        <SettingsRow label="Who can see your profile">
          {select("profile", listLevels)}
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup
        title="Your network"
        icon={Users}
        description="Choose who can see your network and reach out to you. Your profile visibility also applies."
      >
        <SettingsRow label="Followers">
          {select("followers", listLevels)}
        </SettingsRow>
        <SettingsRow label="Following">
          {select("following", listLevels)}
        </SettingsRow>
        <SettingsRow label="Connections">
          {select("connections", listLevels)}
        </SettingsRow>
        <SettingsRow
          label="Connection requests"
          hint="Existing connections are not affected."
        >
          {select("connect", ["everyone", "only_me"])}
        </SettingsRow>
      </SettingsGroup>
      <SettingsGroup
        title="Profile activity"
        icon={Globe}
        description="Totals shown on your profile. Who liked or disliked a post is always private to you."
      >
        <SettingsRow label="Likes received">
          {select("likes", activityLevels)}
        </SettingsRow>
        <SettingsRow label="Dislikes received">
          {select("dislikes", activityLevels)}
        </SettingsRow>
        <SettingsRow label="Referrals">
          {select("referrals", activityLevels)}
        </SettingsRow>
      </SettingsGroup>
    </div>
  );
}
